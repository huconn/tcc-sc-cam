import type { CameraConfiguration } from './camera';

/**
 * 모듈 타입 정의
 */
export type ModuleType = 'camera' | 'pin' | 'power' | 'clock' | 'peripheral';

/**
 * Pin 설정 (향후 구현)
 */
export interface PinConfiguration {
  socType: string;
  pins: Array<{
    id: string;
    name: string;
    function: string;
    pullUp?: boolean;
    pullDown?: boolean;
    driveStrength?: number;
  }>;
  groups: Array<{
    id: string;
    name: string;
    pins: string[];
  }>;
}

/**
 * Power 설정 (향후 구현)
 */
export interface PowerConfiguration {
  socType: string;
  domains: Array<{
    id: string;
    name: string;
    voltage: number;
    enabled: boolean;
  }>;
  rails: Array<{
    id: string;
    name: string;
    domain: string;
  }>;
}

/**
 * 모듈별 설정 통합 타입
 */
export type ModuleConfiguration = 
  | { type: 'camera'; config: CameraConfiguration }
  | { type: 'pin'; config: PinConfiguration }
  | { type: 'power'; config: PowerConfiguration };

/**
 * 전체 SoC 설정
 */
export interface SocConfiguration {
  socType: string;
  modules: {
    camera?: CameraConfiguration;
    pin?: PinConfiguration;
    power?: PowerConfiguration;
  };
}
