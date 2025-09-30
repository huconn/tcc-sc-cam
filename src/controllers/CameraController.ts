import { ValidationService, type ValidationResult } from '@/services/ValidationService';
import { useCameraStore } from '@/store/cameraStore';
import type { MIPIChannel, ISPConfig, CameraMuxConfig, SVDWConfig, CameraConfiguration } from '@/types/camera';

/**
 * 카메라 컨트롤러
 * 카메라 설정 관련 비즈니스 로직 담당
 */
export class CameraController {
  /**
   * 모든 MIPI 채널 가져오기
   */
  static getMIPIChannels(): MIPIChannel[] {
    const store = useCameraStore.getState();
    return store.mipiChannels;
  }

  /**
   * 특정 MIPI 채널 가져오기
   */
  static getMIPIChannel(id: string): MIPIChannel | undefined {
    const store = useCameraStore.getState();
    return store.mipiChannels.find(m => m.id === id);
  }

  /**
   * MIPI 채널의 특정 속성 가져오기
   */
  static getMIPIProperty(id: string, property: keyof MIPIChannel): any {
    const channel = this.getMIPIChannel(id);
    return channel?.[property];
  }

  /**
   * 모든 ISP 설정 가져오기
   */
  static getISPConfigs(): ISPConfig[] {
    const store = useCameraStore.getState();
    return store.ispConfigs;
  }

  /**
   * 특정 ISP 설정 가져오기
   */
  static getISPConfig(id: string): ISPConfig | undefined {
    const store = useCameraStore.getState();
    return store.ispConfigs.find(i => i.id === id);
  }

  /**
   * ISP 설정의 특정 속성 가져오기
   */
  static getISPProperty(id: string, property: keyof ISPConfig): any {
    const config = this.getISPConfig(id);
    return config?.[property];
  }

  /**
   * 카메라 멀티플렉서 설정 가져오기
   */
  static getCameraMux(): CameraMuxConfig {
    const store = useCameraStore.getState();
    return store.cameraMux;
  }

  /**
   * 전체 카메라 설정 가져오기
   */
  static getCameraConfiguration(): CameraConfiguration {
    const store = useCameraStore.getState();
    return store.exportConfiguration();
  }

  /**
   * MIPI 채널 업데이트 (검증 포함)
   */
  static updateMIPIChannel(id: string, updates: Partial<MIPIChannel>): ValidationResult {
    const store = useCameraStore.getState();
    const currentChannel = store.mipiChannels.find(m => m.id === id);
    
    if (!currentChannel) {
      return {
        isValid: false,
        errors: [{ field: 'id', message: 'MIPI channel not found', code: 'CHANNEL_NOT_FOUND' }],
        warnings: []
      };
    }

    const updatedChannel = { ...currentChannel, ...updates };
    const validation = ValidationService.validateMIPIChannel(updatedChannel);

    if (validation.isValid) {
      store.updateMIPIChannel(id, updates);
    }

    return validation;
  }

  /**
   * ISP 설정 업데이트 (검증 포함)
   */
  static updateISPConfig(id: string, updates: Partial<ISPConfig>): ValidationResult {
    const store = useCameraStore.getState();
    const currentISP = store.ispConfigs.find(i => i.id === id);
    
    if (!currentISP) {
      return {
        isValid: false,
        errors: [{ field: 'id', message: 'ISP config not found', code: 'ISP_NOT_FOUND' }],
        warnings: []
      };
    }

    const updatedISP = { ...currentISP, ...updates };
    const validation = ValidationService.validateISPConfig(updatedISP);

    if (validation.isValid) {
      store.updateISPConfig(id, updates);
    }

    return validation;
  }

  /**
   * 카메라 멀티플렉서 업데이트 (검증 포함)
   */
  static updateCameraMux(updates: Partial<CameraMuxConfig>): ValidationResult {
    const store = useCameraStore.getState();
    const updatedMux = { ...store.cameraMux, ...updates };
    const validation = ValidationService.validateCameraMux(updatedMux);

    if (validation.isValid) {
      store.updateCameraMux(updates);
    }

    return validation;
  }

  /**
   * 전체 설정 검증
   */
  static validateCurrentConfiguration(): ValidationResult {
    const store = useCameraStore.getState();
    const config = store.exportConfiguration();
    return ValidationService.validateConfiguration(config);
  }

  /**
   * 설정 충돌 검사
   */
  static checkConfigurationConflicts(): ValidationResult {
    const store = useCameraStore.getState();
    const errors: any[] = [];
    const warnings: any[] = [];

    // MIPI 채널과 ISP 매핑 검사
    const enabledMIPI = store.mipiChannels.filter(m => m.enabled);
    const enabledISP = store.ispConfigs.filter(i => i.enabled);

    // MIPI0-CH0 → ISP0, MIPI1-CH0 → ISP0 충돌 검사
    const mipi0Ch0 = enabledMIPI.find(m => m.id === 'mipi0' && m.virtualChannels >= 1);
    const mipi1Ch0 = enabledMIPI.find(m => m.id === 'mipi1' && m.virtualChannels >= 1);
    const isp0 = enabledISP.find(i => i.id === 'isp0');

    if (mipi0Ch0 && mipi1Ch0 && isp0) {
      warnings.push({
        field: 'isp0',
        message: 'ISP0 is shared between MIPI0-CH0 and MIPI1-CH0',
        code: 'ISP_SHARING_WARNING'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 설정 초기화
   */
  static resetConfiguration(): void {
    const store = useCameraStore.getState();
    store.loadConfiguration({
      viewMode: 'unified',
      devices: [],
      connections: [],
      externalDevices: { mipi0: [], mipi1: [] },
      mipiChannels: [
        { id: 'mipi0', name: 'MIPI0', enabled: false, core: 'none', virtualChannels: 1, dataLanes: 4, hsSettle: 0, interleaveMode: false, pixelMode: '1' },
        { id: 'mipi1', name: 'MIPI1', enabled: false, core: 'none', virtualChannels: 1, dataLanes: 4, hsSettle: 0, interleaveMode: false, pixelMode: '1' }
      ],
      ispConfigs: [
        { id: 'isp0', name: 'ISP0', enabled: false, core: 'none', cfa: 0, memorySharing: false, bypassMode: false },
        { id: 'isp1', name: 'ISP1', enabled: false, core: 'none', cfa: 0, memorySharing: false, bypassMode: false },
        { id: 'isp2', name: 'ISP2', enabled: false, core: 'none', cfa: 0, memorySharing: false, bypassMode: false },
        { id: 'isp3', name: 'ISP3', enabled: false, core: 'none', cfa: 0, memorySharing: false, bypassMode: false }
      ],
      cameraMux: { id: 'cam-mux', inputs: [], outputs: [], mappings: [] },
      svdwConfigs: [
        { id: 'svdw0', name: 'SVDW Grabber 0', enabled: false, type: 'grabber' },
        { id: 'svdw1', name: 'SVDW Grabber 1', enabled: false, type: 'grabber' },
        { id: 'svdw2', name: 'SVDW Grabber 2', enabled: false, type: 'grabber' },
        { id: 'svdw3', name: 'SVDW Grabber 3', enabled: false, type: 'grabber' },
        { id: 'svdw-blender', name: 'SVDW Blender', enabled: false, type: 'blender', inputPorts: [] }
      ],
      vwdmaConfigs: [
        { id: 'vwdma0', name: 'VWDMA0', enabled: false, irEnabled: false },
        { id: 'vwdma1', name: 'VWDMA1', enabled: false, irEnabled: false }
      ],
      ciedConfigs: Array.from({ length: 10 }, (_, i) => ({
        id: `cied${i}`,
        name: `CIED${i}`,
        channel: i,
        enabled: false,
        windows: [],
        format: 'RGB' as const
      })),
      mdwConfig: { id: 'mdw', enabled: false, axiReadOutstanding: 8 }
    });
  }
}
