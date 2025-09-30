import type { DtsMap, DtsNode } from '@/types/dts';

/**
 * 카메라 데이터 접근 서비스
 * UI가 JSON 노드를 직접 읽고 쓸 수 있도록 지원
 */
export class CameraDataAccessService {
  /**
   * MIPI 노드 가져오기
   */
  static getMIPINode(dtsMap: DtsMap, mipiId: 'mipi0' | 'mipi1'): DtsNode | undefined {
    return dtsMap.nodes.find(n => 
      n.path.toLowerCase().includes(mipiId) && 
      n.path.toLowerCase().includes('mipi')
    );
  }

  /**
   * MIPI 노드의 속성 가져오기
   */
  static getMIPIProperty(dtsMap: DtsMap, mipiId: 'mipi0' | 'mipi1', propKey: string): any {
    const node = this.getMIPINode(dtsMap, mipiId);
    return node?.props?.[propKey];
  }

  /**
   * MIPI 노드의 속성 업데이트
   */
  static updateMIPIProperty(
    dtsMap: DtsMap, 
    mipiId: 'mipi0' | 'mipi1', 
    propKey: string, 
    value: any
  ): DtsMap {
    const newMap = JSON.parse(JSON.stringify(dtsMap)); // Deep copy
    const node = newMap.nodes.find(n => 
      n.path.toLowerCase().includes(mipiId) && 
      n.path.toLowerCase().includes('mipi')
    );
    
    if (node) {
      if (!node.props) {
        node.props = {};
      }
      node.props[propKey] = value;
      
      // propsOrder도 업데이트
      if (node.propsOrder) {
        const existing = node.propsOrder.find(p => p.key === propKey);
        if (existing) {
          existing.value = value;
        } else {
          node.propsOrder.push({ key: propKey, value });
        }
      }
    }
    
    return newMap;
  }

  /**
   * ISP 노드 가져오기
   */
  static getISPNode(dtsMap: DtsMap, ispId: string): DtsNode | undefined {
    return dtsMap.nodes.find(n => 
      n.path.toLowerCase().includes(ispId) && 
      n.path.toLowerCase().includes('isp')
    );
  }

  /**
   * ISP 노드의 속성 가져오기
   */
  static getISPProperty(dtsMap: DtsMap, ispId: string, propKey: string): any {
    const node = this.getISPNode(dtsMap, ispId);
    return node?.props?.[propKey];
  }

  /**
   * ISP 노드의 속성 업데이트
   */
  static updateISPProperty(
    dtsMap: DtsMap, 
    ispId: string, 
    propKey: string, 
    value: any
  ): DtsMap {
    const newMap = JSON.parse(JSON.stringify(dtsMap)); // Deep copy
    const node = newMap.nodes.find(n => 
      n.path.toLowerCase().includes(ispId) && 
      n.path.toLowerCase().includes('isp')
    );
    
    if (node) {
      if (!node.props) {
        node.props = {};
      }
      node.props[propKey] = value;
      
      // propsOrder도 업데이트
      if (node.propsOrder) {
        const existing = node.propsOrder.find(p => p.key === propKey);
        if (existing) {
          existing.value = value;
        } else {
          node.propsOrder.push({ key: propKey, value });
        }
      }
    }
    
    return newMap;
  }

  /**
   * 모든 MIPI 노드 가져오기
   */
  static getAllMIPINodes(dtsMap: DtsMap): DtsNode[] {
    return dtsMap.nodes.filter(n => 
      n.path.toLowerCase().includes('mipi') && 
      n.path.toLowerCase().includes('csi')
    );
  }

  /**
   * 모든 ISP 노드 가져오기
   */
  static getAllISPNodes(dtsMap: DtsMap): DtsNode[] {
    return dtsMap.nodes.filter(n => 
      n.path.toLowerCase().includes('isp') &&
      !n.path.toLowerCase().includes('display')
    );
  }

  /**
   * 새 노드 추가
   */
  static addNode(dtsMap: DtsMap, node: DtsNode): DtsMap {
    const newMap = JSON.parse(JSON.stringify(dtsMap)); // Deep copy
    newMap.nodes.push(node);
    
    // byPath 업데이트
    if (newMap.byPath) {
      newMap.byPath[node.path] = newMap.nodes.length - 1;
    }
    
    return newMap;
  }

  /**
   * 노드 삭제
   */
  static removeNode(dtsMap: DtsMap, nodePath: string): DtsMap {
    const newMap = JSON.parse(JSON.stringify(dtsMap)); // Deep copy
    newMap.nodes = newMap.nodes.filter(n => n.path !== nodePath);
    
    // byPath 재구성
    newMap.byPath = {};
    newMap.nodes.forEach((node, index) => {
      newMap.byPath![node.path] = index;
    });
    
    return newMap;
  }
}
