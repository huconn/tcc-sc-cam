import type { DtsMap, DtsNode } from '@/types/dts'

function indent(depth: number): string {
  return '\t'.repeat(depth)
}

function serializeProps(props: Record<string, unknown> | undefined, propsOrder: any[] | undefined, depth: number, out: string[]): void {
  if (!props) return
  
  // propsOrder가 있으면 순서대로, 없으면 Object.keys() 사용
  const keys = propsOrder ? propsOrder.map(p => p.key) : Object.keys(props)
  
  for (const key of keys) {
    const val = props[key]
    if (val === true) {
      out.push(`${indent(depth)}${key};`)
    } else if (Array.isArray(val)) {
      // Array for simple values already represents multi tokens; just join with space
      out.push(`${indent(depth)}${key} = ${val.join(' ')};`)
    } else {
      const str = String(val)
      // Preserve parsed bracket arrays like "[ aa bb ]"
      if (str.startsWith('[') && str.endsWith(']')) {
        out.push(`${indent(depth)}${key} = ${str};`)
      } else {
        out.push(`${indent(depth)}${key} = ${str};`)
      }
    }
  }
}

function serializeNode(node: DtsNode, depth: number, out: string[]): void {
  if (node.name === '/') {
    out.push('/ {')
    serializeProps(node.props as any, (node as any).propsOrder, depth + 1, out)  // 순서 보존
    if (node.children) for (const ch of node.children) serializeNode(ch, depth + 1, out)
    out.push('};')
    return
  }
  out.push(`${indent(depth)}${node.name} {`)
  serializeProps(node.props as any, (node as any).propsOrder, depth + 1, out)  // 순서 보존
  if (node.children) for (const ch of node.children) serializeNode(ch, depth + 1, out)
  out.push(`${indent(depth)}};`)
}

export function dtsMapToDts(map: DtsMap): string {
  const out: string[] = []
  out.push('/dts-v1/;')
  out.push('')
  // Build nodes map and link once (avoid double-adding root children)
  const byPath = new Map<string, DtsNode>()
  for (const n of map.nodes) byPath.set(n.path, { name: n.name, path: n.path, props: n.props, children: [] })
  const rootNode: DtsNode = byPath.get('/') || { name: '/', path: '/', props: undefined, children: [] }
  rootNode.children = []
  for (const n of map.nodes) {
    if (n.path === '/') continue
    const self = byPath.get(n.path)!
    const lastSlash = n.path.lastIndexOf('/')
    const parentPath = lastSlash <= 0 ? '/' : n.path.substring(0, lastSlash)
    const parent = parentPath === '/' ? rootNode : byPath.get(parentPath)
    if (parent) parent.children!.push(self)
  }
  serializeNode(rootNode, 0, out)
  out.push('')
  return out.join('\n')
}


