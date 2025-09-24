export interface DtsNodePropertyMap {
  [key: string]: unknown
}

export interface DtsNode {
  path: string
  name: string
  props?: DtsNodePropertyMap
  children?: DtsNode[]
}

export interface DtsMap {
  root?: string
  nodes: DtsNode[]
  byPath?: Record<string, number>
}


