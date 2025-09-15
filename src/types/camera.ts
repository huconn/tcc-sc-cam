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

export interface ExternalDevice {
  id: string;
  type: DeviceType;
  name: string;
  model: string;
}

export interface CameraConfiguration {
  viewMode: ViewMode;
  devices: Device[];
  connections: Connection[];
  externalDevices?: {
    mipi0: ExternalDevice[];
    mipi1: ExternalDevice[];
  };
  mipiChannels: MIPIChannel[];
  ispConfigs: ISPConfig[];
  cameraMux: CameraMuxConfig;
  svdwConfigs: SVDWConfig[];
  vwdmaConfigs: VWDMAConfig[];
  ciedConfigs: CIEDConfig[];
  mdwConfig: MDWConfig;
}