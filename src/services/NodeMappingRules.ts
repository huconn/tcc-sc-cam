import type { DtsMap, DtsNode } from '@/types/dts';

/**
 * 노드 매핑 규칙 서비스
 * DTS JSON 노드를 CameraConfiguration의 어느 필드에 매핑할지 정의
 */
export class NodeMappingRules {
  /**
   * MIPI 노드 판별
   */
  static isMIPINode(node: DtsNode): boolean {
    const path = node.path.toLowerCase();
    const compatible = String(node.props?.compatible || '').toLowerCase();
    
    return (
      (path.includes('mipi') && path.includes('csi')) ||
      compatible.includes('mipi-csi')
    );
  }

  /**
   * ISP 노드 판별
   */
  static isISPNode(node: DtsNode): boolean {
    const path = node.path.toLowerCase();
    
    return (
      path.includes('isp') && 
      !path.includes('display') &&
      /isp\d+/.test(path)  // isp0, isp1, isp2, isp3만
    );
  }

  /**
   * I2C 채널 노드 판별
   */
  static isI2CNode(node: DtsNode): boolean {
    const path = node.path.toLowerCase();
    return /i2c@[0-9a-fx]+/.test(path);
  }

  /**
   * External Device 노드 판별
   */
  static isExternalDeviceNode(node: DtsNode): boolean {
    const compatible = String(node.props?.compatible || '').toLowerCase();
    const nodeName = node.name.toLowerCase();
    
    // Camera Sensor 패턴
    const sensorPatterns = [
      'ar0',      // AR0147, AR0231, AR0820, etc.
      'arxxxx',   // arxxxx, arxxxx_1, etc.
      'imx',      // IMX219, IMX424, etc.
      'ov',       // OV5640, etc.
      'cxd'       // CXD5700, etc.
    ];
    
    // Serializer/Deserializer 패턴
    const serdesPatterns = [
      'max967',   // MAX96701, MAX96717, etc. (Serializer)
      'max928',   // MAX9286, etc. (Deserializer)
      'max927',   // MAX9275, etc.
      'max929',   // MAX9295, etc.
      'max9671'   // MAX96712, etc.
    ];
    
    const isSensor = sensorPatterns.some(p => compatible.includes(p) || nodeName.includes(p));
    const isSerdes = serdesPatterns.some(p => compatible.includes(p) || nodeName.includes(p));
    const isExternalDevice = isSensor || isSerdes;
    
    // 디버그 로그 (매우 많은 로그가 나올 수 있으므로 조건부)
    if (isExternalDevice || compatible.includes('ar') || compatible.includes('max') || nodeName.includes('ar') || nodeName.includes('max')) {
      console.log(`[NodeMappingRules] External Device 판별: ${node.name} - compatible: "${compatible}", nodeName: "${nodeName}" -> ${isExternalDevice ? 'MATCH' : 'NO MATCH'}`);
      if (isSensor) console.log(`  -> Sensor 패턴 매치`);
      if (isSerdes) console.log(`  -> SerDes 패턴 매치`);
    }
    
    return isExternalDevice;
  }

  /**
   * Aliases에서 I2C 채널 번호 추출
   */
  static extractI2CChannelNumber(dtsMap: DtsMap, i2cPath: string): number {
    // aliases 노드 찾기
    const aliasesNode = dtsMap.nodes.find(n => 
      n.path === '/aliases' || n.name === 'aliases'
    );
    
    if (!aliasesNode?.props) {
      // Aliases가 없으면 주소에서 추정
      return this.guessI2CChannelFromAddress(i2cPath);
    }
    
    // aliases에서 i2c0, i2c1, ... 매핑 찾기
    for (const [key, value] of Object.entries(aliasesNode.props)) {
      if (key.startsWith('i2c') && String(value).includes(i2cPath)) {
        const match = key.match(/i2c(\d+)/);
        if (match) {
          return parseInt(match[1]);
        }
      }
    }
    
    return this.guessI2CChannelFromAddress(i2cPath);
  }

  /**
   * I2C 주소에서 채널 번호 추정
   */
  private static guessI2CChannelFromAddress(i2cPath: string): number {
    // i2c@16300000 → 0x16300000
    // i2c@16310000 → 0x16310000
    // ...
    // i2c@16370000 → 0x16370000
    const match = i2cPath.match(/i2c@([0-9a-fx]+)/i);
    if (match) {
      const addr = parseInt(match[1], 16);
      const baseAddr = 0x16300000;
      const offset = 0x10000;
      const channel = (addr - baseAddr) / offset;
      if (channel >= 0 && channel < 16) {
        return channel;
      }
    }
    return 0;
  }

  /**
   * SVDW 노드 판별
   */
  static isSVDWNode(node: DtsNode): boolean {
    const path = node.path.toLowerCase();
    return path.includes('svdw');
  }

  /**
   * VWDMA 노드 판별
   */
  static isVWDMANode(node: DtsNode): boolean {
    const path = node.path.toLowerCase();
    return path.includes('vwdma');
  }

  /**
   * CIED 노드 판별
   */
  static isCIEDNode(node: DtsNode): boolean {
    const path = node.path.toLowerCase();
    return path.includes('cied');
  }

  /**
   * MDW 노드 판별
   */
  static isMDWNode(node: DtsNode): boolean {
    const path = node.path.toLowerCase();
    return path.includes('mdw');
  }

  /**
   * 노드가 카메라 관련인지 판별 (전체)
   */
  static isCameraRelatedNode(node: DtsNode): boolean {
    return (
      this.isMIPINode(node) ||
      this.isISPNode(node) ||
      this.isI2CNode(node) ||
      this.isSVDWNode(node) ||
      this.isVWDMANode(node) ||
      this.isCIEDNode(node) ||
      this.isMDWNode(node) ||
      this.isExternalDeviceNode(node)
    );
  }
}
