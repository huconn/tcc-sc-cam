import { DtsService } from '@/services/DtsService';
import { FileService } from '@/services/FileService';
import { DataModelService } from '@/services/DataModelService';
import { DtsOverlayService } from '@/services/DtsOverlayService';
import { SocProfileService } from '@/services/SocProfileService';
import type { DtsMap } from '@/types/dts';
import type { CameraConfiguration } from '@/types/camera';
import type { SocConfiguration } from '@/types/modules';

/**
 * DTS 컨트롤러
 * DTS/DTB 파일 관리 및 모듈별 데이터 변환 비즈니스 로직 담당
 */
export class DtsController {
  /**
   * DTB 파일 로드 및 SoC 설정 추출 (확장 가능 구조)
   */
  static async loadDtbAndExtractConfig(): Promise<{
    originalDtsMap: DtsMap;
    socConfig: SocConfiguration;
  }> {
    try {
      // 1. 프로파일 로드 (최초 1회)
      await SocProfileService.loadProfiles();
      
      // 2. DTB → JSON 변환
      const originalDtsMap = await DtsService.dtbToJson();
      console.log('DTB loaded and converted to JSON');
      
      // 3. SoC 타입 감지
      const socType = SocProfileService.detectSocType(originalDtsMap);
      console.log(`Detected SoC type: ${socType}`);
      
      // 4. 활성화된 모듈별 데이터 추출
      const enabledModules = SocProfileService.getEnabledModules(socType);
      console.log(`Enabled modules: ${enabledModules.join(', ')}`);
      
      const socConfig: SocConfiguration = {
        socType,
        modules: {}
      };
      
      // 5. 각 모듈별 데이터 추출
      for (const module of enabledModules) {
        if (module === 'camera') {
          const cameraConfig = await DataModelService.extractCameraConfig(originalDtsMap, socType);
          socConfig.modules.camera = cameraConfig;
          console.log('Camera configuration extracted');
        }
        // 향후 추가:
        // else if (module === 'pin') { ... }
        // else if (module === 'power') { ... }
      }
      
      return { originalDtsMap, socConfig };
    } catch (error) {
      console.error('Failed to load DTB and extract config:', error);
      throw new Error(`Failed to load DTB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * DTB 파일 로드 및 카메라 데이터 추출 (기존 호환성)
   */
  static async loadDtbAndExtractCamera(): Promise<{
    originalDtsMap: DtsMap;
    cameraConfig: CameraConfiguration;
    socType: string;
  }> {
    const { originalDtsMap, socConfig } = await this.loadDtbAndExtractConfig();
    
    if (!socConfig.modules.camera) {
      throw new Error('Camera module not found in SoC configuration');
    }
    
    return {
      originalDtsMap,
      cameraConfig: socConfig.modules.camera,
      socType: socConfig.socType
    };
  }

  /**
   * 카메라 설정을 DTS/DTB로 저장
   */
  static async saveCameraConfig(
    originalDtsMap: DtsMap,
    cameraConfig: CameraConfiguration
  ): Promise<{ dtsPath: string; dtbPath: string }> {
    try {
      console.log('📤 Saving camera configuration...');
      
      // 1. 카메라 설정을 원본 DTS에 오버라이트
      const finalDts = DtsOverlayService.overlayCameraConfig(originalDtsMap, cameraConfig);
      console.log('✅ Camera DTS overlayed on original DTS');
      
      // 2. DTS/DTB 저장
      const result = await FileService.saveDtsDtb(finalDts);
      console.log('✅ DTS/DTB saved successfully');
      
      return result;
    } catch (error) {
      console.error('Failed to save camera config:', error);
      throw new Error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 웹 환경에서 카메라 DTS 다운로드
   */
  static downloadCameraConfig(
    originalDtsMap: DtsMap,
    cameraConfig: CameraConfiguration,
    filename: string = 'camera-config.dts'
  ): void {
    try {
      // 카메라 설정을 원본 DTS에 오버라이트
      const finalDts = DtsOverlayService.overlayCameraConfig(originalDtsMap, cameraConfig);
      
      // DTS 다운로드
      FileService.downloadDts(finalDts, filename);
      console.log('✅ Camera DTS downloaded');
    } catch (error) {
      console.error('Failed to download camera DTS:', error);
      throw new Error(`Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
