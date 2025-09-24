import type { DtsMap } from '@/types/dts'

function stripComments(dtsText: string): string {
  const noBlock = dtsText.replace(/\/\*[\s\S]*?\*\//g, '')
  const noLine = noBlock.replace(/\/\/.*$/gm, '')
  return noLine
}

function tokenize(text: string): string[] {
  const tokens: string[] = []
  // Treat commas as part of name tokens so vendor keys like telechips,pmap-name stay intact
  // Important: comma is REMOVED from the single-char token class below
  const re = /"([^"\\]|\\.)*"|<[^>]*>|[{};=:@\[\]]|[^\s{};=:@"<>\[\]]+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) tokens.push(m[0])
  return tokens
}

export function parseDtsToMap(text: string): DtsMap {
  const tokens = tokenize(stripComments(text))
  let i = 0

  const peek = () => tokens[i]
  const next = () => tokens[i++]

  function parseValueList(): unknown {
    const values: string[] = []
    while (i < tokens.length && peek() && peek() !== ';' && peek() !== '}') {
      const t = next()
      if (t === ',') continue
      if (t === '[') {
        const inner: string[] = []
        while (i < tokens.length && peek() && peek() !== ']') {
          const it = next()
          if (it === ',') continue
          inner.push(it)
        }
        if (peek() === ']') next()
        values.push(`[ ${inner.join(' ')} ]`)
        continue
      }
      values.push(t)
    }
    return values.length === 1 ? values[0] : values
  }

  function parsePropsAndChildren(): { props: Record<string, unknown>, children: any[] } {
    const props: Record<string, unknown> = {}
    const children: any[] = []
    while (i < tokens.length) {
      const t = peek()
      if (t === '}') { next(); break }
      let label: string | null = null
      let nameTok = next()
      if (nameTok && nameTok.endsWith(':')) { label = nameTok.slice(0, -1); nameTok = next() }
      // Assemble full property key by consuming tokens up to value/start tokens
      // This preserves commas and hyphens inside keys, e.g., telechips,pmap-name
      {
        const keyParts: string[] = [nameTok]
        while (i < tokens.length) {
          const tnext = peek()
          if (!tnext || tnext === '=' || tnext === ';' || tnext === '{') break
          if (tnext === '}' || tnext === '<' || tnext === '[') break
          keyParts.push(next())
        }
        nameTok = keyParts.join('')
      }
      if (peek() === '{' || (peek() === '@') || (typeof nameTok === 'string' && nameTok.includes('@'))) {
        let fullName = nameTok
        while (peek() && peek() !== '{') fullName += next()
        if (next() !== '{') throw new Error('Expected { for node')
        const { props: cprops, children: cchildren } = parsePropsAndChildren()
        if (peek() === ';') next()
        children.push({ path: '', name: fullName, label, props: cprops, children: cchildren })
        continue
      }
      if (peek() === '=') {
        next()
        const val = parseValueList()
        if (peek() === ';') next()
        props[nameTok] = val
      } else if (peek() === ';') {
        next()
        props[nameTok] = true
      } else {
        if (peek() === '{') { next(); parsePropsAndChildren(); if (peek() === ';') next() }
      }
    }
    return { props, children }
  }

  const root: any = { path: '/', name: '/', props: {}, children: [] }
  while (i < tokens.length) {
    const t = next()
    if (t === '/') {
      if (next() !== '{') break
      const { props, children } = parsePropsAndChildren()
      root.props = props
      root.children = children
      break
    }
  }

  function assignPaths(node: any, basePath: string) {
    if (node.name === '/') node.path = '/'
    else node.path = basePath === '/' ? `/${node.name}` : `${basePath}/${node.name}`
    if (Array.isArray(node.children)) for (const ch of node.children) assignPaths(ch, node.path)
  }
  assignPaths(root, '/')

  const nodes: any[] = []
  function collect(n: any) {
    nodes.push({ path: n.path, name: n.name, props: n.props, children: n.children?.map((c: any) => ({ path: c.path, name: c.name })) })
    if (n.children) n.children.forEach(collect)
  }
  collect(root)
  const byPath: Record<string, number> = {}
  nodes.forEach((n, idx) => { byPath[n.path] = idx })
  return { root: '/', nodes, byPath }
}


