import type { DtsMap, DtsNode } from '@/types/dts'
import { loadJSON } from './fileLoader'

export async function loadDtsMap(url: string = '/data/dts-map.json'): Promise<DtsMap> {
  return await loadJSON<DtsMap>(url)
}

export function findNodeByPath(map: DtsMap, nodePath: string): DtsNode | undefined {
  if (map.byPath && nodePath in map.byPath) {
    const idx = map.byPath[nodePath]
    return map.nodes[idx]
  }
  // fallback scan
  return map.nodes.find(n => n.path === nodePath)
}


