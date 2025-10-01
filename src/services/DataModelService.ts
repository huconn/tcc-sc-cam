import type { DtsMap, DtsNode } from '@/types/dts';
import type { CameraConfiguration } from '@/types/camera';
import { NodeMappingRules } from './NodeMappingRules';
import { serverLogger } from '@/utils/serverLogger';

interface CameraMappingRules {
  version: string;
  socType: string;
  module: string;
  description: string;
  nodeMappings: any;
}

/**
 * 데이터 모델 서비스
 * JSON과 카메라 데이터의 역할을 명확히 정의
 */
export class DataModelService {
  private static cameraMappingCache: Map<string, CameraMappingRules> = new Map();

  /**
   * Camera Mapping 파일 로드
   */
  static async loadCameraMapping(socType: string): Promise<CameraMappingRules> {
    // 캐시 확인
    if (this.cameraMappingCache.has(socType)) {
      return this.cameraMappingCache.get(socType)!;
    }

    try {
      const path = `/config/${socType}/camera-mapping.json`;
      const response = await fetch(path);
      
      if (!response.ok) {
        throw new Error(`Failed to load camera mapping for ${socType}: ${response.statusText}`);
      }
      
      const mappingRules: CameraMappingRules = await response.json();
      
      // 검증
      if (mappingRules.socType !== socType) {
        console.warn(`SoC type mismatch: expected ${socType}, got ${mappingRules.socType}`);
      }
      
      // 캐시 저장
      this.cameraMappingCache.set(socType, mappingRules);
      console.log(`Camera mapping loaded for ${socType}`, mappingRules);
      
      return mappingRules;
    } catch (error) {
      console.error(`Failed to load camera mapping for ${socType}:`, error);
      throw error;
    }
  }

  /**
   * 원본 JSON에서 CameraConfiguration 추출 (핵심 기능)
   * 
   * @param originalJson - DTS JSON 맵
   * @param socType - SoC 타입 (tcc807x, tcc805x 등)
   * 
   * 노드 매핑 규칙은 camera-mapping.json에서 로드
   */
  static async extractCameraConfig(originalJson: DtsMap, socType: string): Promise<CameraConfiguration> {
    // 매핑 파일 로드
    await this.loadCameraMapping(socType);
    console.log(`Extracting camera config using mapping rules for ${socType}`);
    
    // 기존 로직은 그대로 유지 (추후 동적 매핑 적용 예정)
    const config: CameraConfiguration = {
      viewMode: 'unified',
      devices: [],
      connections: [],
      externalDevices: { mipi0: [], mipi1: [] },
      mipiChannels: [],
      ispConfigs: [],
      cameraMux: { id: 'cam-mux', inputs: [], outputs: [], mappings: [] },
      svdwConfigs: [],
      vwdmaConfigs: [],
      ciedConfigs: [],
      mdwConfig: {
        id: 'mdw',
        enabled: false,
        axiReadOutstanding: 8,
        axiWriteOutstanding: 8,
        defaultColor: '#000000',
        fisheyeMode: false,
        colorIrEnable: false,
        yuvStandard: 'BT.601'
      }
    };

    // MIPI 채널 추출 (NodeMappingRules 사용)
    const mipiNodes = originalJson.nodes.filter(n => NodeMappingRules.isMIPINode(n));
    for (const node of mipiNodes) {
      const mipiConfig = this.parseMIPINode(node);
      if (mipiConfig) {
        config.mipiChannels.push(mipiConfig);
      }
    }

    // ISP 설정 추출 (NodeMappingRules 사용)
    const ispNodes = originalJson.nodes.filter(n => NodeMappingRules.isISPNode(n));
    for (const node of ispNodes) {
      const ispConfig = this.parseISPNode(node);
      if (ispConfig) {
        config.ispConfigs.push(ispConfig);
      }
    }

    // SVDW 설정 추출
    const svdwNodes = originalJson.nodes.filter(n => 
      n.path.toLowerCase().includes('svdw')
    );
    for (const node of svdwNodes) {
      const svdwConfig = this.parseSVDWNode(node);
      if (svdwConfig) {
        config.svdwConfigs.push(svdwConfig);
      }
    }

    // VWDMA 설정 추출
    const vwdmaNodes = originalJson.nodes.filter(n => 
      n.path.toLowerCase().includes('vwdma')
    );
    for (const node of vwdmaNodes) {
      const vwdmaConfig = this.parseVWDMANode(node);
      if (vwdmaConfig) {
        config.vwdmaConfigs.push(vwdmaConfig);
      }
    }

    // CIED 설정 추출
    const ciedNodes = originalJson.nodes.filter(n => 
      n.path.toLowerCase().includes('cied')
    );
    for (const node of ciedNodes) {
      const ciedConfig = this.parseCIEDNode(node);
      if (ciedConfig) {
        config.ciedConfigs.push(ciedConfig);
      }
    }

    // MDW 설정 추출
    const mdwNode = originalJson.nodes.find(n => 
      n.path.toLowerCase().includes('mdw')
    );
    if (mdwNode) {
      config.mdwConfig = this.parseMDWNode(mdwNode);
    }

    // I2C 채널 추출 (NodeMappingRules 사용, 자식 노드인 External Devices 포함)
    const i2cNodes = originalJson.nodes.filter(n => NodeMappingRules.isI2CNode(n));
    serverLogger.info(`[DataModelService] 전체 노드 수: ${originalJson.nodes.length}`);
    serverLogger.info(`[DataModelService] I2C 노드 발견: ${i2cNodes.length}개`);
    i2cNodes.forEach((node, index) => {
      serverLogger.info(`  I2C[${index}]: ${node.name} (${node.path})`);
    });
    
    config.i2cChannels = i2cNodes.map(node => 
      this.parseI2CNode(node, originalJson)
    ).filter(Boolean) as any[];

    // Debug log: I2C channels parsed
    try {
      const i2cSummary = (config.i2cChannels || []).map((ch: any) => ({
        channelNumber: ch.channelNumber,
        status: ch.status,
        deviceCount: Array.isArray(ch.devices) ? ch.devices.length : 0
      }));
      serverLogger.info('[DataModelService] i2cChannels parsed:', i2cSummary);
    } catch {}

    // External Devices는 I2C 채널에서 가져옴
    // UI에서 사용하기 편하도록 MIPI별로 재구성
    const mipi0Devices: any[] = [];
    const mipi1Devices: any[] = [];
    
    serverLogger.info(`[DataModelService] i2cMain: ${config.i2cMain || 12}, i2cSub: ${config.i2cSub || 13}`);
    
    // i2cMain 채널의 디바이스들 → mipi0
    const i2cMainChannel = config.i2cChannels?.find(i2c => i2c.channelNumber === (config.i2cMain || 12));
    if (i2cMainChannel) {
      serverLogger.info(`[DataModelService] i2cMain 채널 발견: 채널${i2cMainChannel.channelNumber}, 디바이스 ${i2cMainChannel.devices?.length || 0}개`);
      
      // 각 디바이스의 상태 확인
      i2cMainChannel.devices?.forEach((device, index) => {
        serverLogger.info(`    Device[${index}] ${device.name}: status="${device.status}"`);
      });
      
      const okDevices = i2cMainChannel.devices?.filter(d => d.status === 'okay') || [];
      serverLogger.info(`[DataModelService] mipi0용 okay 디바이스: ${okDevices.length}개`);
      mipi0Devices.push(...okDevices);
    } else {
      serverLogger.warn(`[DataModelService] i2cMain 채널 ${config.i2cMain || 12}를 찾을 수 없음`);
    }
    
    // i2cSub 채널의 디바이스들 → mipi1
    const i2cSubChannel = config.i2cChannels?.find(i2c => i2c.channelNumber === (config.i2cSub || 13));
    if (i2cSubChannel) {
      serverLogger.info(`[DataModelService] i2cSub 채널 발견: 채널${i2cSubChannel.channelNumber}, 디바이스 ${i2cSubChannel.devices?.length || 0}개`);
      const okDevices = i2cSubChannel.devices?.filter(d => d.status === 'okay') || [];
      serverLogger.info(`[DataModelService] mipi1용 okay 디바이스: ${okDevices.length}개`);
      mipi1Devices.push(...okDevices);
    } else {
      serverLogger.warn(`[DataModelService] i2cSub 채널 ${config.i2cSub || 13}를 찾을 수 없음`);
    }
    
    config.externalDevices = {
      mipi0: mipi0Devices,
      mipi1: mipi1Devices
    };

    // Debug log: External devices mapped to MIPI
    try {
      const countByType = (arr: any[]) => arr.reduce((acc: any, d: any) => {
        const t = d?.type || 'unknown';
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {});
      console.log('[DataModelService] externalDevices.mipi0:', {
        total: mipi0Devices.length,
        byType: countByType(mipi0Devices)
      });
      console.log('[DataModelService] externalDevices.mipi1:', {
        total: mipi1Devices.length,
        byType: countByType(mipi1Devices)
      });
      
      // 상세 로그: 실제 저장되는 externalDevices 구조 (서버 콘솔로 전송)
      serverLogger.info('[DataModelService] externalDevices 저장 구조:', config.externalDevices);
      
      // 각 디바이스의 상세 정보 로그 (서버 콘솔로 전송)
      if (mipi0Devices.length > 0) {
        serverLogger.info('[DataModelService] mipi0 디바이스 상세 정보:');
        mipi0Devices.forEach((device, index) => {
          serverLogger.info(`  [${index}] ${device.name}:`, {
            id: device.id,
            type: device.type,
            compatible: device.compatible,
            reg: device.reg,
            status: device.status,
            ports: device.ports ? `${device.ports.length} ports` : 'no ports'
          });
        });
      }
      
      if (mipi1Devices.length > 0) {
        serverLogger.info('[DataModelService] mipi1 디바이스 상세 정보:');
        mipi1Devices.forEach((device, index) => {
          serverLogger.info(`  [${index}] ${device.name}:`, {
            id: device.id,
            type: device.type,
            compatible: device.compatible,
            reg: device.reg,
            status: device.status,
            ports: device.ports ? `${device.ports.length} ports` : 'no ports'
          });
        });
      }
    } catch {}

    return config;
  }

  /**
   * MIPI 노드 파싱
   */
  private static parseMIPINode(node: DtsNode): any {
    const props = node.props || {};
    const nodeName = node.name.toLowerCase();
    const id = nodeName.includes('mipi0') ? 'mipi0' : 'mipi1';
    
    return {
      id,
      name: id.toUpperCase(),
      enabled: props.status === 'okay',
      core: this.determineCore(node),
      virtualChannels: Number(props['num-channel']) || 1,
      dataLanes: Number(props['data-lanes']) || 4,
      hsSettle: Number(props['hs-settle']) || 0,
      interleaveMode: props['interleave-mode'] === 1,
      pixelMode: String(props['pixel-mode'] || '1')
    };
  }

  /**
   * ISP 노드 파싱
   */
  private static parseISPNode(node: DtsNode): any {
    const props = node.props || {};
    const nodeName = node.name.toLowerCase();
    
    // isp0, isp1, isp2, isp3 추출
    const match = nodeName.match(/isp(\d+)/);
    if (!match) return null;
    
    const id = `isp${match[1]}`;
    
    return {
      id,
      name: id.toUpperCase(),
      enabled: props.status === 'okay',
      core: this.determineCore(node),
      cfa: Number(props.cfa) || 0,
      memorySharing: props['memory-sharing'] === 1,
      bypassMode: props['bypass-mode'] === 1
    };
  }

  /**
   * SVDW 노드 파싱
   */
  private static parseSVDWNode(node: DtsNode): any {
    const props = node.props || {};
    const nodeName = node.name.toLowerCase();
    
    const match = nodeName.match(/svdw[_-]?(\d+|blender)/);
    if (!match) return null;
    
    const id = match[1] === 'blender' ? 'svdw-blender' : `svdw${match[1]}`;
    const type = match[1] === 'blender' ? 'blender' : 'grabber';
    
    return {
      id,
      name: node.name,
      enabled: props.status === 'okay',
      type,
      inputPorts: []
    };
  }

  /**
   * VWDMA 노드 파싱
   */
  private static parseVWDMANode(node: DtsNode): any {
    const props = node.props || {};
    const nodeName = node.name.toLowerCase();
    
    const match = nodeName.match(/vwdma(\d+)/);
    if (!match) return null;
    
    const id = `vwdma${match[1]}`;
    
    return {
      id,
      name: id.toUpperCase(),
      enabled: props.status === 'okay',
      irEnabled: props['ir-enabled'] === 1
    };
  }

  /**
   * CIED 노드 파싱
   */
  private static parseCIEDNode(node: DtsNode): any {
    const props = node.props || {};
    const nodeName = node.name.toLowerCase();
    
    const match = nodeName.match(/cied(\d+)/);
    if (!match) return null;
    
    const channel = Number(match[1]);
    
    return {
      id: `cied${channel}`,
      name: `CIED${channel}`,
      channel,
      enabled: props.status === 'okay',
      windows: [],
      format: props.format || 'RGB'
    };
  }

  /**
   * MDW 노드 파싱
   */
  private static parseMDWNode(node: DtsNode): any {
    const props = node.props || {};
    
    return {
      id: 'mdw',
      enabled: props.status === 'okay',
      axiReadOutstanding: Number(props['axi-read-outstanding']) || 8,
      axiWriteOutstanding: Number(props['axi-write-outstanding']) || 8,
      defaultColor: props['default-color'] || '#000000',
      fisheyeMode: props['fisheye-mode'] === 1,
      colorIrEnable: props['color-ir-enable'] === 1,
      yuvStandard: props['yuv-standard'] || 'BT.601'
    };
  }

  /**
   * 코어 판단 (main/sub/none)
   */
  private static determineCore(node: DtsNode): 'main' | 'sub' | 'none' {
    const props = node.props || {};
    const path = node.path.toLowerCase();
    
    // TODO: 실제 DTS 구조에 맞게 판단 로직 구현
    if (props.core === 'main') return 'main';
    if (props.core === 'sub') return 'sub';
    if (path.includes('maincore')) return 'main';
    if (path.includes('subcore')) return 'sub';
    
    return 'none';
  }

  /**
   * I2C 채널 노드 파싱 (자식 노드인 External Device 포함)
   */
  private static parseI2CNode(node: DtsNode, dtsMap: DtsMap): any {
    const props = node.props || {};
    const nodeName = node.name.toLowerCase();
    
    // i2c@1c070000 형태에서 주소 추출
    const match = nodeName.match(/i2c@([0-9a-fx]+)/);
    if (!match) return null;
    
    // Aliases에서 채널 번호 추출
    const channelNumber = NodeMappingRules.extractI2CChannelNumber(dtsMap, node.path);
    
    // I2C 채널의 자식 노드들 (External Devices) 찾기
    const childDevices = dtsMap.nodes.filter(n => 
      n.path.startsWith(node.path + '/') &&
      NodeMappingRules.isExternalDeviceNode(n)
    );
    
    serverLogger.info(`[DataModelService] I2C 채널 ${channelNumber} (${node.path})에서 자식 디바이스 찾기:`);
    serverLogger.info(`  - ${node.path}로 시작하는 노드: ${dtsMap.nodes.filter(n => n.path.startsWith(node.path + '/')).length}개`);
    serverLogger.info(`  - External Device로 판별된 노드: ${childDevices.length}개`);
    childDevices.forEach((device, index) => {
      serverLogger.info(`    [${index}] ${device.name} (${device.path}) - compatible: ${device.props?.compatible}`);
    });
    
    const devices = childDevices.map(deviceNode => 
      this.parseExternalDeviceNode(deviceNode, dtsMap.nodes)
    ).filter(Boolean);
    
    return {
      id: node.name,
      name: `I2C${channelNumber}`,
      channelNumber,
      compatible: props.compatible || 'telechips,tcc807x-i2c-v3',
      reg: Array.isArray(props.reg) ? props.reg : [],
      interrupts: Array.isArray(props.interrupts) ? props.interrupts : [],
      clockFrequency: Number(props['clock-frequency']) || 400000,
      portMux: Number(props['port-mux']) || 0,
      status: props.status === 'okay' ? 'okay' : 'disabled',
      retryCount: Number(props['retry-count']),
      cmdTimeout: Number(props['cmd-timeout']),
      pinctrlNames: props['pinctrl-names'],
      pinctrl0: props['pinctrl-0'],
      pinctrl1: props['pinctrl-1'],
      devices  // ← I2C 내부의 External Devices
    };
  }


  /**
   * External Device 노드 파싱
   */
  private static parseExternalDeviceNode(node: DtsNode, allNodes: DtsNode[]): any {
    const props = node.props || {};
    const compatible = String(props.compatible || '');
    
    // compatible 값에서 따옴표 제거
    const cleanCompatible = compatible.replace(/['"]/g, '').trim();
    
    // 타입 판단
    let type: 'sensor' | 'serializer' | 'deserializer' | 'external-isp' = 'sensor';
    if (cleanCompatible.includes('max967') || cleanCompatible.includes('serializer')) {
      type = 'serializer';
    } else if (cleanCompatible.includes('max928') || cleanCompatible.includes('deserializer')) {
      type = 'deserializer';
    }
    
    // 모델명 추출
    const modelMatch = cleanCompatible.match(/tcc-[^,]+,(.+)/);
    const model = modelMatch ? modelMatch[1] : node.name;
    
    // Ports 파싱 (전체 노드 리스트 전달)
    const ports = this.parsePortsFromNode(node, allNodes);
    
    // status 처리: 원본 DTS의 status 값에서 따옴표 제거
    const rawStatus = props.status;
    const cleanStatus = typeof rawStatus === 'string' ? rawStatus.replace(/['"]/g, '').trim() : rawStatus;
    const status = cleanStatus === 'okay' ? 'okay' : 'disabled';
    
    // 디버그: 원본 status 값 로그
    console.log(`[parseExternalDeviceNode] ${node.name}: rawStatus="${rawStatus}" -> cleanStatus="${cleanStatus}" -> status="${status}"`);
    
    // 기타 속성들도 따옴표 제거
    const cleanReg = typeof props.reg === 'string' ? props.reg.replace(/['"]/g, '').trim() : props.reg;
    const cleanPwdGpios = typeof props['pwd-gpios'] === 'string' ? props['pwd-gpios'].replace(/['"]/g, '').trim() : props['pwd-gpios'];
    
    return {
      id: node.name,
      type,
      name: node.name.split('@')[0],
      model,
      status,
      compatible: cleanCompatible,
      reg: cleanReg,
      pwdGpios: cleanPwdGpios,
      broadcastingMode: props['broadcasting-mode'] === true || props['broadcasting-mode'] === '',
      ports
    };
  }

  /**
   * Ports 파싱
   * DTS 파서가 노드를 평탄화하므로, allNodes에서 path 기반으로 자식 노드를 찾아야 함
   */
  private static parsePortsFromNode(node: DtsNode, allNodes: DtsNode[]): any[] {
    const ports: any[] = [];
    
    // 현재 노드의 path를 기준으로 자식 노드들 찾기
    const basePath = node.path;
    
    // 단일 'port' 노드 찾기
    const portNode = allNodes.find(n => n.path === `${basePath}/port`);
    if (portNode) {
      // port의 endpoint 노드 찾기
      const endpointNodes = allNodes.filter(n => 
        n.path.startsWith(`${basePath}/port/`) && n.name.startsWith('endpoint')
      );
      
      endpointNodes.forEach(endpointNode => {
        const props = endpointNode.props || {};
        ports.push({
          name: endpointNode.name,
          remoteEndpoint: props['remote-endpoint'],
          ioDirection: typeof props['io-direction'] === 'string' 
            ? props['io-direction'].replace(/['"]/g, '').trim() 
            : props['io-direction'],
          phandle: props.phandle
        });
      });
    }

    // 'ports' 노드 찾기 (복수형 - deserializer에서 사용)
    const portsNode = allNodes.find(n => n.path === `${basePath}/ports`);
    if (portsNode) {
      // ports 아래의 port@N 노드들 찾기
      const portChildNodes = allNodes.filter(n => 
        n.path.startsWith(`${basePath}/ports/port@`)
      );
      
      // port@N별로 그룹핑
      const portPaths = new Set(portChildNodes.map(n => {
        const match = n.path.match(/^(.*\/port@\d+)/);
        return match ? match[1] : null;
      }).filter(Boolean));
      
      portPaths.forEach(portPath => {
        const portName = portPath?.split('/').pop(); // "port@0"
        const portNumber = portName?.split('@')[1]; // "0"
        
        // 해당 port@N의 endpoint들 찾기
        const endpointNodes = allNodes.filter(n => 
          n.path.startsWith(`${portPath}/`) && n.name.startsWith('endpoint')
        );
        
        endpointNodes.forEach(endpointNode => {
          const props = endpointNode.props || {};
          ports.push({
            name: `${portName}/${endpointNode.name}`,
            portNumber,
            remoteEndpoint: props['remote-endpoint'],
            ioDirection: typeof props['io-direction'] === 'string' 
              ? props['io-direction'].replace(/['"]/g, '').trim() 
              : props['io-direction'],
            phandle: props.phandle
          });
        });
      });
    }

    serverLogger.info(`[parsePortsFromNode] ${node.name}: ${ports.length} ports parsed`);
    if (ports.length > 0) {
      serverLogger.info(`[parsePortsFromNode] ports:`, ports);
    }

    return ports;
  }

  /**
   * CameraConfiguration을 카메라 데이터 JSON으로 변환
   */
  static configToCameraJson(config: CameraConfiguration): DtsMap {
    const nodes: DtsNode[] = [];
    
    // MIPI 채널을 DTS 노드로 변환
    for (const mipi of config.mipiChannels) {
      if (mipi.enabled) {
        nodes.push({
          path: `/soc/${mipi.id}`,
          name: `${mipi.id}: mipi-csi@0`,
          props: {
            compatible: 'telechips,mipi-csi',
            status: 'okay',
            'num-channel': mipi.virtualChannels,
            'data-lanes': mipi.dataLanes,
            'hs-settle': mipi.hsSettle,
            'interleave-mode': mipi.interleaveMode ? 1 : 0,
            'pixel-mode': mipi.pixelMode
          },
          propsOrder: [
            { key: 'compatible', value: 'telechips,mipi-csi' },
            { key: 'status', value: 'okay' },
            { key: 'num-channel', value: mipi.virtualChannels },
            { key: 'data-lanes', value: mipi.dataLanes },
            { key: 'hs-settle', value: mipi.hsSettle },
            { key: 'interleave-mode', value: mipi.interleaveMode ? 1 : 0 },
            { key: 'pixel-mode', value: mipi.pixelMode }
          ]
        });
      }
    }
    
    // ISP 설정을 DTS 노드로 변환
    for (const isp of config.ispConfigs) {
      if (isp.enabled) {
        nodes.push({
          path: `/soc/${isp.id}`,
          name: `${isp.id}: isp@0`,
          props: {
            compatible: 'telechips,isp',
            status: 'okay',
            cfa: isp.cfa,
            'memory-sharing': isp.memorySharing ? 1 : 0,
            'bypass-mode': isp.bypassMode ? 1 : 0
          },
          propsOrder: [
            { key: 'compatible', value: 'telechips,isp' },
            { key: 'status', value: 'okay' },
            { key: 'cfa', value: isp.cfa },
            { key: 'memory-sharing', value: isp.memorySharing ? 1 : 0 },
            { key: 'bypass-mode', value: isp.bypassMode ? 1 : 0 }
          ]
        });
      }
    }
    
    return {
      root: '/',
      nodes,
      byPath: this.createByPathMap(nodes)
    };
  }

  /**
   * CameraConfiguration을 DTS 텍스트로 변환 (핵심 기능)
   */
  static configToDts(config: CameraConfiguration): string {
    const lines: string[] = [];
    
    lines.push('/* Camera Configuration DTS */');
    lines.push('/* Auto-generated from UI settings */');
    lines.push('');
    
    // MIPI 채널 DTS 생성
    for (const mipi of config.mipiChannels) {
      if (mipi.enabled) {
        lines.push(`&${mipi.id} {`);
        lines.push(`\tstatus = "okay";`);
        lines.push(`\tnum-channel = <${mipi.virtualChannels}>;`);
        lines.push(`\tdata-lanes = <${mipi.dataLanes}>;`);
        lines.push(`\ths-settle = <${mipi.hsSettle}>;`);
        lines.push(`\tinterleave-mode = <${mipi.interleaveMode ? 1 : 0}>;`);
        lines.push(`\tpixel-mode = <${mipi.pixelMode}>;`);
        lines.push('};');
        lines.push('');
      }
    }
    
    // ISP 설정 DTS 생성
    for (const isp of config.ispConfigs) {
      if (isp.enabled) {
        lines.push(`&${isp.id} {`);
        lines.push(`\tstatus = "okay";`);
        lines.push(`\tcfa = <${isp.cfa}>;`);
        lines.push(`\tmemory-sharing = <${isp.memorySharing ? 1 : 0}>;`);
        lines.push(`\tbypass-mode = <${isp.bypassMode ? 1 : 0}>;`);
        lines.push('};');
        lines.push('');
      }
    }
    
    // SVDW 설정 DTS 생성
    for (const svdw of config.svdwConfigs) {
      if (svdw.enabled) {
        lines.push(`&${svdw.id} {`);
        lines.push(`\tstatus = "okay";`);
        if (svdw.type === 'blender' && svdw.inputPorts && svdw.inputPorts.length > 0) {
          lines.push(`\tinput-ports = <${svdw.inputPorts.join(' ')}>;`);
        }
        lines.push('};');
        lines.push('');
      }
    }
    
    // VWDMA 설정 DTS 생성
    for (const vwdma of config.vwdmaConfigs) {
      if (vwdma.enabled) {
        lines.push(`&${vwdma.id} {`);
        lines.push(`\tstatus = "okay";`);
        lines.push(`\tir-enabled = <${vwdma.irEnabled ? 1 : 0}>;`);
        lines.push('};');
        lines.push('');
      }
    }
    
    // CIED 설정 DTS 생성
    for (const cied of config.ciedConfigs) {
      if (cied.enabled) {
        lines.push(`&${cied.id} {`);
        lines.push(`\tstatus = "okay";`);
        lines.push(`\tformat = "${cied.format}";`);
        // TODO: windows 설정 추가
        lines.push('};');
        lines.push('');
      }
    }
    
    // MDW 설정 DTS 생성
    if (config.mdwConfig.enabled) {
      lines.push(`&mdw {`);
      lines.push(`\tstatus = "okay";`);
      lines.push(`\taxi-read-outstanding = <${config.mdwConfig.axiReadOutstanding}>;`);
      lines.push(`\taxi-write-outstanding = <${config.mdwConfig.axiWriteOutstanding}>;`);
      lines.push(`\tdefault-color = "${config.mdwConfig.defaultColor}";`);
      lines.push(`\tfisheye-mode = <${config.mdwConfig.fisheyeMode ? 1 : 0}>;`);
      lines.push(`\tcolor-ir-enable = <${config.mdwConfig.colorIrEnable ? 1 : 0}>;`);
      lines.push(`\tyuv-standard = "${config.mdwConfig.yuvStandard}";`);
      lines.push('};');
      lines.push('');
    }
    
    // I2C 채널 DTS 생성 (선택된 채널 + 내부 External Devices)
    if (config.i2cChannels) {
      const usedChannels = new Set([config.i2cMain, config.i2cSub]);
      
      for (const i2c of config.i2cChannels) {
        if (usedChannels.has(i2c.channelNumber)) {
          lines.push(`&${i2c.id} {`);
          lines.push(`\tstatus = "okay";`);
          lines.push(`\tclock-frequency = <${i2c.clockFrequency}>;`);
          if (i2c.retryCount) {
            lines.push(`\tretry-count = <${i2c.retryCount}>;`);
          }
          if (i2c.cmdTimeout) {
            lines.push(`\tcmd-timeout = <${i2c.cmdTimeout}>;`);
          }
          lines.push('');
          
          // I2C 내부의 External Devices 생성
          for (const device of i2c.devices) {
            if (device.status === 'okay') {
              lines.push(`\t${device.id} {`);
              lines.push(`\t\tstatus = "okay";`);
              if (device.compatible) {
                lines.push(`\t\tcompatible = "${device.compatible}";`);
              }
              if (device.reg) {
                lines.push(`\t\treg = <${device.reg}>;`);
              }
              if (device.pwdGpios) {
                lines.push(`\t\tpwd-gpios = <${device.pwdGpios}>;`);
              }
              if (device.broadcastingMode) {
                lines.push(`\t\tbroadcasting-mode;`);
              }
              
              // Ports 생성
              if (device.ports && device.ports.length > 0) {
                lines.push(`\t\tports {`);
                lines.push(`\t\t\t#address-cells = <0x01>;`);
                lines.push(`\t\t\t#size-cells = <0x00>;`);
                lines.push('');
                
                for (const port of device.ports) {
                  lines.push(`\t\t\t${port.id} {`);
                  lines.push(`\t\t\t\treg = <${port.reg}>;`);
                  lines.push('');
                  lines.push(`\t\t\t\tendpoint {`);
                  if (port.endpoint.remoteEndpoint) {
                    lines.push(`\t\t\t\t\tremote-endpoint = <${port.endpoint.remoteEndpoint}>;`);
                  }
                  lines.push(`\t\t\t\t\tio-direction = "${port.endpoint.ioDirection}";`);
                  if (port.endpoint.channel !== undefined) {
                    lines.push(`\t\t\t\t\tchannel = <${port.endpoint.channel}>;`);
                  }
                  if (port.endpoint.phandle) {
                    lines.push(`\t\t\t\t\tphandle = <${port.endpoint.phandle}>;`);
                  }
                  lines.push(`\t\t\t\t};`);
                  lines.push(`\t\t\t};`);
                  lines.push('');
                }
                
                lines.push(`\t\t};`);
              }
              
              lines.push(`\t};`);
              lines.push('');
            }
          }
          
          lines.push('};');
          lines.push('');
        }
      }
    }
    
    return lines.join('\n');
  }


  /**
   * byPath 맵 생성
   */
  private static createByPathMap(nodes: DtsNode[]): Record<string, number> {
    const byPath: Record<string, number> = {};
    nodes.forEach((node, index) => {
      byPath[node.path] = index;
    });
    return byPath;
  }
}
