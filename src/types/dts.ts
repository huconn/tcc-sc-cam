export interface DtsNodePropertyMap {
  [key: string]: unknown
}

export interface DtsNodeProperty {
  key: string
  value: unknown
}

export interface DtsNode {
  path: string
  name: string
  props?: DtsNodePropertyMap
  propsOrder?: DtsNodeProperty[]  // 순서 보존용
  children?: DtsNode[]
}

export interface DtsMap {
  root?: string
  nodes: DtsNode[]
  byPath?: Record<string, number>
  _originalDtsText?: string  // 원본 DTS 텍스트 (DTB 변환 시 포함)
}


