import type { DtsMap, DtsNode } from '@/types/dts'

export async function loadDtsMap(url: string = '/data/dts-map.json'): Promise<DtsMap> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load DTS map: ${res.status}`)
  return res.json()
}

export function findNodeByPath(map: DtsMap, nodePath: string): DtsNode | undefined {
  if (map.byPath && nodePath in map.byPath) {
    const idx = map.byPath[nodePath]
    return map.nodes[idx]
  }
  // fallback scan
  return map.nodes.find(n => n.path === nodePath)
}


