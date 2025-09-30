#!/usr/bin/env node
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')

function parseArgs(argv) {
  const args = { input: null, output: null, dtcPath: process.env.DTC_PATH || null }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if ((a === '--in' || a === '--input') && argv[i + 1]) { args.input = argv[++i] }
    else if ((a === '--out' || a === '--output') && argv[i + 1]) { args.output = argv[++i] }
    else if ((a === '--dtc' || a === '--dtc-path') && argv[i + 1]) { args.dtcPath = argv[++i] }
  }
  return args
}

function ensureDir(p) {
  const dir = path.dirname(p)
  fs.mkdirSync(dir, { recursive: true })
}

function detectDtcExecutable(userPath) {
  if (userPath) return userPath
  const candidates = [
    'dtc',
    'DTC.exe',
    path.join(process.cwd(), 'tools', 'DTC.exe')
  ]
  return candidates[0]
}

function run(cmd, args, options = {}) {
  const res = spawnSync(cmd, args, { stdio: 'pipe', encoding: 'utf-8', ...options })
  return res
}

function stripComments(dtsText) {
  // remove /* ... */ and // ...\n comments
  const noBlock = dtsText.replace(/\/\*[\s\S]*?\*\//g, '')
  const noLine = noBlock.replace(/\/\/.*$/gm, '')
  return noLine
}

function tokenize(text) {
  // Split tokens while keeping meaningful symbols
  const tokens = []
  const re = /"([^"\\]|\\.)*"|<[^>]*>|[{};=,:@]|[^\s{};=,:@"<>]+/g
  let m
  while ((m = re.exec(text)) !== null) {
    tokens.push(m[0])
  }
  return tokens
}

function parseDts(text) {
  const tokens = tokenize(stripComments(text))
  let i = 0

  function peek() { return tokens[i] }
  function next() { return tokens[i++] }

  function parseValueList() {
    const values = []
    while (i < tokens.length && peek() && peek() !== ';' && peek() !== '}' ) {
      const t = next()
      if (t === ',') continue
      values.push(t)
    }
    return values.length === 1 ? values[0] : values
  }

  function parsePropsAndChildren() {
    const props = {}
    const propsOrder = []  // 순서 보존용 배열
    const children = []
    while (i < tokens.length) {
      const t = peek()
      if (t === '}') { next(); break }
      // property without value: key;
      // property with value: key = value[, value]*;
      // child node: [label:] name[@addr] { ... };
      // optional label:
      let label = null
      let nameTok = next()
      if (nameTok && nameTok.endsWith(':')) {
        label = nameTok.slice(0, -1)
        nameTok = next()
      }
      // child node
      if (peek() === '{' || (peek() === '@') || (typeof nameTok === 'string' && nameTok.includes('@'))) {
        // reconstruct name possibly with @addr until '{'
        let fullName = nameTok
        while (peek() && peek() !== '{') {
          fullName += next()
        }
        if (next() !== '{') throw new Error('Expected { for node')
        const { props: cprops, propsOrder: cpropsOrder, children: cchildren } = parsePropsAndChildren()
        // optional trailing ; after node block
        if (peek() === ';') next()
        children.push({ path: '', name: fullName, label, props: cprops, propsOrder: cpropsOrder, children: cchildren })
        continue
      }
      // property
      if (peek() === '=') {
        next() // consume '='
        const val = parseValueList()
        if (peek() === ';') next()
        props[nameTok] = val
        propsOrder.push({ key: nameTok, value: val })  // 순서 보존
      } else if (peek() === ';') {
        next()
        props[nameTok] = true
        propsOrder.push({ key: nameTok, value: true })  // 순서 보존
      } else {
        // Unexpected token; try to recover
        if (peek() === '{') { next(); parsePropsAndChildren(); if (peek() === ';') next() }
      }
    }
    return { props, propsOrder, children }
  }

  // root wrapper
  const root = { path: '/', name: '/', props: {}, propsOrder: [], children: [] }
  while (i < tokens.length) {
    const t = next()
    if (t === '/') {
      if (next() !== '{') break
      const { props, propsOrder, children } = parsePropsAndChildren()
      root.props = props
      root.propsOrder = propsOrder  // 순서 보존
      root.children = children
      break
    }
  }

  // assign paths depth-first
  function assignPaths(node, basePath) {
    if (node.name === '/' ) { node.path = '/'; }
    else {
      const seg = node.name
      node.path = basePath === '/' ? `/${seg}` : `${basePath}/${seg}`
    }
    if (Array.isArray(node.children)) {
      for (const ch of node.children) assignPaths(ch, node.path)
    }
  }
  assignPaths(root, '/')

  // flatten
  const nodes = []
  function collect(n) { 
    nodes.push({ 
      path: n.path, 
      name: n.name, 
      props: n.props, 
      propsOrder: n.propsOrder,  // 순서 보존
      children: n.children?.map(c=>({ path: c.path, name: c.name })) 
    }); 
    if (n.children) n.children.forEach(collect) 
  }
  collect(root)
  const byPath = {}
  nodes.forEach((n, idx) => { byPath[n.path] = idx })
  return { root: '/', nodes, byPath }
}

function convertDtbToJson(dtc, inputPath) {
  // Step 1: DTB -> DTS (or pass-through if already .dts)
  const ext = path.extname(inputPath).toLowerCase()
  let dtsText
  if (ext === '.dts') {
    dtsText = fs.readFileSync(inputPath, 'utf-8')
  } else {
    const res = run(dtc, ['-I', 'dtb', '-O', 'dts', inputPath])
    if (res.status !== 0) {
      const msg = res.stderr || 'DTC failed'
      throw new Error(`dtc conversion to dts failed: ${msg}`)
    }
    dtsText = res.stdout
  }
  // Step 2: parse DTS text -> JSON structure
  const parsed = parseDts(dtsText)
  return JSON.stringify(parsed, null, 2)
}

function main() {
  const { input, output, dtcPath } = parseArgs(process.argv)
  if (!input) {
    console.error('Usage: node scripts/convert-dtb.cjs --in <path/to/input.dtb> --out <path/to/output.json> [--dtc <path/to/DTC.exe>]')
    process.exit(1)
  }
  const outPath = output || path.join(process.cwd(), 'public', 'data', 'dts-map.json')
  const dtc = detectDtcExecutable(dtcPath)
  const absIn = path.resolve(input)
  const jsonText = convertDtbToJson(dtc, absIn)
  ensureDir(outPath)
  fs.writeFileSync(outPath, jsonText, 'utf-8')
  console.log(`Wrote ${path.relative(process.cwd(), outPath)} (${Buffer.byteLength(jsonText, 'utf-8')} bytes)`) 
}

if (require.main === module) {
  try { main() } catch (e) { console.error(e.message); process.exit(1) }
}

module.exports = { convertDtbToJson }


