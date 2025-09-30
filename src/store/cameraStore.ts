import { create } from 'zustand';
import type { DtsMap } from '@/types/dts';
import {
  CameraConfiguration,
  ViewMode,
  Device,
  Connection,
  MIPIChannel,
  ISPConfig,
  CameraMuxConfig,
  SVDWConfig,
  VWDMAConfig,
  CIEDConfig,
  MDWConfig
} from '@/types/camera';

interface CameraStore extends CameraConfiguration {
  setViewMode: (mode: ViewMode) => void;
  addDevice: (device: Device) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  removeDevice: (id: string) => void;
  setExternalDevices: (mipi: 'mipi0' | 'mipi1', devices: any[]) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;
  updateMIPIChannel: (id: string, updates: Partial<MIPIChannel>) => void;
  updateISPConfig: (id: string, updates: Partial<ISPConfig>) => void;
  updateCameraMux: (updates: Partial<CameraMuxConfig>) => void;
  updateSVDWConfig: (id: string, updates: Partial<SVDWConfig>) => void;
  updateVWDMAConfig: (id: string, updates: Partial<VWDMAConfig>) => void;
  updateCIEDConfig: (id: string, updates: Partial<CIEDConfig>) => void;
  updateMDWConfig: (updates: Partial<MDWConfig>) => void;
  loadConfiguration: (config: CameraConfiguration) => void;
  exportConfiguration: () => CameraConfiguration;
  // 원본 DTS map (전체 데이터, 읽기 전용)
  originalDtsMap?: DtsMap;
  setOriginalDtsMap?: (map: DtsMap | undefined) => void;
  // I2C selections for MIPI blocks
  i2cMain?: number;
  i2cSub?: number;
  setI2cMain?: (n: number) => void;
  setI2cSub?: (n: number) => void;
  // Global UI debug flags
  debugMainCoreViewHorizontalForceOutputs?: boolean;
  setDebugMainCoreViewHorizontalForceOutputs?: (v: boolean) => void;
  debugShowLayoutBorders?: boolean;
  setDebugShowLayoutBorders?: (v: boolean) => void;
  debugShowResolution?: boolean;
  setDebugShowResolution?: (v: boolean) => void;
}

const initialState: CameraConfiguration = {
  viewMode: 'unified',
  devices: [],
  connections: [],
  externalDevices: {
    mipi0: [],
    mipi1: []
  },
  i2cMain: 12,
  i2cSub: 13,
  mipiChannels: [
    {
      id: 'mipi0',
      name: 'MIPI0',
      enabled: false,
      core: 'none',
      virtualChannels: 1,
      dataLanes: 4,
      hsSettle: 0,
      interleaveMode: false,
      pixelMode: '1'
    },
    {
      id: 'mipi1',
      name: 'MIPI1',
      enabled: false,
      core: 'none',
      virtualChannels: 1,
      dataLanes: 4,
      hsSettle: 0,
      interleaveMode: false,
      pixelMode: '1'
    },
  ],
  ispConfigs: [
    { id: 'isp0', name: 'ISP0', enabled: false, core: 'none', cfa: 0, memorySharing: false, bypassMode: false },
    { id: 'isp1', name: 'ISP1', enabled: false, core: 'none', cfa: 0, memorySharing: false, bypassMode: false },
    { id: 'isp2', name: 'ISP2', enabled: false, core: 'none', cfa: 0, memorySharing: false, bypassMode: false },
    { id: 'isp3', name: 'ISP3', enabled: false, core: 'none', cfa: 0, memorySharing: false, bypassMode: false },
  ],
  cameraMux: {
    id: 'cam-mux',
    inputs: [],
    outputs: [],
    mappings: []
  },
  svdwConfigs: [
    { id: 'svdw0', name: 'SVDW Grabber 0', enabled: false, type: 'grabber' },
    { id: 'svdw1', name: 'SVDW Grabber 1', enabled: false, type: 'grabber' },
    { id: 'svdw2', name: 'SVDW Grabber 2', enabled: false, type: 'grabber' },
    { id: 'svdw3', name: 'SVDW Grabber 3', enabled: false, type: 'grabber' },
    { id: 'svdw-blender', name: 'SVDW Blender', enabled: false, type: 'blender', inputPorts: [] },
  ],
  vwdmaConfigs: [
    { id: 'vwdma0', name: 'VWDMA0', enabled: false, irEnabled: false },
    { id: 'vwdma1', name: 'VWDMA1', enabled: false, irEnabled: false },
  ],
  ciedConfigs: Array.from({ length: 10 }, (_, i) => ({
    id: `cied${i}`,
    name: `CIED${i}`,
    channel: i,
    enabled: false,
    windows: [],
    format: 'RGB' as const,
  })),
  mdwConfig: {
    id: 'mdw',
    enabled: false,
    axiReadOutstanding: 8,
    axiWriteOutstanding: 8,
    defaultColor: '#000000',
    fisheyeMode: false,
    colorIrEnable: false,
    yuvStandard: 'BT.601',
  },
};

export const useCameraStore = create<CameraStore>((set) => ({
  ...initialState,
  originalDtsMap: undefined,

  // for debugging  ================================================
  // MainCoreViewHorizontal: force OUT->SVDW/Video lines horizontal
  debugMainCoreViewHorizontalForceOutputs: false,

  // Global debug: show layout guide borders for all components
  debugShowLayoutBorders: false,

  // Show browser resolution and scale info
  debugShowResolution: true,

  // selectMainCoreOperations: 1 : current view, 2 : operations selector
  debugSelectMainCoreOperations: 2,

  // selectSubCoreOperations: 1 : current view, 2 : operations selector
  debugSelectSubCoreOperations: 2,

  // Show Dts Map for debugging
  debugShowDtsMap: true,

  // ==============================================================

  setViewMode: (mode) => set({ viewMode: mode }),

  addDevice: (device) => set((state) => ({
    devices: [...state.devices, device]
  })),

  updateDevice: (id, updates) => set((state) => ({
    devices: state.devices.map(d => d.id === id ? { ...d, ...updates } : d)
  })),

  removeDevice: (id) => set((state) => ({
    devices: state.devices.filter(d => d.id !== id),
    connections: state.connections.filter(c => c.sourceId !== id && c.targetId !== id)
  })),

  setExternalDevices: (mipi, devices) => set((state) => ({
    externalDevices: {
      ...state.externalDevices,
      [mipi]: devices
    }
  })),

  addConnection: (connection) => set((state) => ({
    connections: [...state.connections, connection]
  })),

  removeConnection: (id) => set((state) => ({
    connections: state.connections.filter(c => c.id !== id)
  })),

  updateMIPIChannel: (id, updates) => set((state) => ({
    mipiChannels: state.mipiChannels.map(m => m.id === id ? { ...m, ...updates } : m)
  })),

  updateISPConfig: (id, updates) => set((state) => ({
    ispConfigs: state.ispConfigs.map(i => i.id === id ? { ...i, ...updates } : i)
  })),

  updateCameraMux: (updates) => set((state) => ({
    cameraMux: { ...state.cameraMux, ...updates }
  })),

  updateSVDWConfig: (id, updates) => set((state) => ({
    svdwConfigs: state.svdwConfigs.map(s => s.id === id ? { ...s, ...updates } : s)
  })),

  updateVWDMAConfig: (id, updates) => set((state) => ({
    vwdmaConfigs: state.vwdmaConfigs.map(v => v.id === id ? { ...v, ...updates } : v)
  })),

  updateCIEDConfig: (id, updates) => set((state) => ({
    ciedConfigs: state.ciedConfigs.map(c => c.id === id ? { ...c, ...updates } : c)
  })),

  updateMDWConfig: (updates) => set((state) => ({
    mdwConfig: { ...state.mdwConfig, ...updates }
  })),

  loadConfiguration: (config) => set(config),

  exportConfiguration: () => {
    const state = useCameraStore.getState();
    return {
      viewMode: state.viewMode,
      devices: state.devices,
      connections: state.connections,
      externalDevices: state.externalDevices,
      i2cMain: state.i2cMain,
      i2cSub: state.i2cSub,
      mipiChannels: state.mipiChannels,
      ispConfigs: state.ispConfigs,
      cameraMux: state.cameraMux,
      svdwConfigs: state.svdwConfigs,
      vwdmaConfigs: state.vwdmaConfigs,
      ciedConfigs: state.ciedConfigs,
      mdwConfig: state.mdwConfig,
    };
  },

  setOriginalDtsMap: (map) => set({ originalDtsMap: map }),

  setI2cMain: (n) => set({ i2cMain: n }),
  setI2cSub: (n) => set({ i2cSub: n }),
  setDebugMainCoreViewHorizontalForceOutputs: (v) => set({ debugMainCoreViewHorizontalForceOutputs: v }),
  setDebugShowLayoutBorders: (v) => set({ debugShowLayoutBorders: v }),
  setDebugShowResolution: (v) => set({ debugShowResolution: v }),
}));