export type ViewMode = 'unified' | 'main' | 'sub';

export type DeviceType = 'sensor' | 'serializer' | 'deserializer' | 'converter' | 'soc' | 'external-isp';

export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  i2cAddress?: string;
  i2cChannel?: string;
  gpioReset?: string;
  gpioPower?: string;
  properties: Record<string, any>;
  position: { x: number; y: number };
}

export interface Connection {
  id: string;
  sourceId: string;
  sourcePort: string;
  targetId: string;
  targetPort: string;
}

export interface MIPIChannel {
  id: string;
  name: string;
  enabled: boolean;
  core: 'main' | 'sub' | 'none';
  virtualChannels: number;
  dataLanes: number;
  hsSettle: number;
  interleaveMode: boolean;
  pixelMode: string;
}

export interface ISPConfig {
  id: string;
  name: string;
  enabled: boolean;
  core: 'main' | 'sub' | 'none';
  cfa: 0 | 1 | 2 | 3; // 0: RGGB, 3: RGBIR
  memorySharing: boolean;
  bypassMode: boolean;
}

export interface CameraMuxConfig {
  id: string;
  inputs: string[];
  outputs: string[];
  mappings: Array<{
    input: string;
    output: string;
  }>;
}

export interface SVDWConfig {
  id: string;
  name: string;
  enabled: boolean;
  type: 'grabber' | 'blender';
  inputPorts?: string[];
}

export interface VWDMAConfig {
  id: string;
  name: string;
  enabled: boolean;
  irEnabled: boolean;
  irEncoding?: string;
}

export interface CIEDConfig {
  id: string;
  name: string;
  channel: number;
  enabled: boolean;
  windows: Array<{
    id: string;
    rect: { x: number; y: number; width: number; height: number };
    errorMode: 'dark' | 'bright' | 'frozen' | 'solid' | 'phase';
    threshold: number;
  }>;
  format: 'RGB' | 'YUV444' | 'YUV422';
}

export interface MDWConfig {
  id: string;
  enabled: boolean;
  axiReadOutstanding: number;
  axiWriteOutstanding: number;
  defaultColor: string;
  fisheyeMode: boolean;
  colorIrEnable: boolean;
  yuvStandard: 'BT.601' | 'BT.709' | 'BT.2020';
}

export interface I2CChannelConfig {
  id: string;                  // 'i2c@1c070000'
  name: string;                // 'I2C0', 'I2C1', ...
  channelNumber: number;       // 0~15
  compatible: string;          // 'telechips,tcc807x-i2c-v3'
  reg: number[];              // 레지스터 주소
  interrupts: number[];
  clockFrequency: number;      // 400000 (400kHz)
  portMux: number;
  status: 'okay' | 'disabled';
  retryCount?: number;
  cmdTimeout?: number;
  pinctrlNames?: string[];
  pinctrl0?: string;
  pinctrl1?: string;
  // I2C 채널 내부의 디바이스들 (자식 노드)
  devices: ExternalDevice[];   // ← I2C 버스에 연결된 디바이스들
}

export interface PortEndpoint {
  remoteEndpoint?: string;    // phandle 참조
  ioDirection: 'input' | 'output';
  channel?: number;
  phandle?: string;
}

export interface Port {
  id: string;                 // 'port@0', 'port@1', ...
  reg: number;                // Port 번호
  endpoint: PortEndpoint;
}

export interface ExternalDevice {
  id: string;
  type: DeviceType;
  name: string;
  model: string;
  // DTS 속성들
  status?: 'okay' | 'disabled';
  compatible?: string;         // "tcc-onnn,arxxxx"
  reg?: string;               // I2C 주소 "0x50"
  pwdGpios?: string;          // Power down GPIOs
  broadcastingMode?: boolean; // Deserializer용
  ports?: Port[];             // Port 연결 정보
  // UI 전용 속성
  i2cAddress?: string;        // UI 표시용 (deprecated, reg 사용)
  i2cChannel?: string;        // UI 표시용
  gpioReset?: string;
  gpioPower?: string;
  properties?: Record<string, any>;
}

export interface CameraConfiguration {
  viewMode: ViewMode;
  devices: Device[];
  connections: Connection[];
  externalDevices?: {
    mipi0: ExternalDevice[];
    mipi1: ExternalDevice[];
  };
  // I2C 설정
  i2cChannels?: I2CChannelConfig[];  // 사용 가능한 I2C 채널 목록 (DTB에서 추출)
  i2cMain?: number;                  // MIPI0용 I2C 채널 번호 (기본값: 12)
  i2cSub?: number;                   // MIPI1용 I2C 채널 번호 (기본값: 13)
  // 카메라 하드웨어 설정
  mipiChannels: MIPIChannel[];
  ispConfigs: ISPConfig[];
  cameraMux: CameraMuxConfig;
  svdwConfigs: SVDWConfig[];
  vwdmaConfigs: VWDMAConfig[];
  ciedConfigs: CIEDConfig[];
  mdwConfig: MDWConfig;
}