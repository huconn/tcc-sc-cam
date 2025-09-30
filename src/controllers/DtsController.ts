import { DtsService } from '@/services/DtsService';
import { FileService } from '@/services/FileService';
import { DataModelService } from '@/services/DataModelService';
import { DtsOverlayService } from '@/services/DtsOverlayService';
import type { DtsMap } from '@/types/dts';
import type { CameraConfiguration } from '@/types/camera';

/**
 * DTS 컨트롤러
 * DTS/DTB 파일 관리 및 카메라 데이터 변환 비즈니스 로직 담당
 */
export class DtsController {
  /**
   * DTB 파일 로드 및 카메라 데이터 추출
   */
  static async loadDtbAndExtractCamera(): Promise<{
    originalDtsMap: DtsMap;
    cameraConfig: CameraConfiguration;
  }> {
    try {
      // 1. DTB → JSON 변환
      const originalDtsMap = await DtsService.dtbToJson();
      console.log('✅ DTB loaded and converted to JSON');
      
      // 2. JSON에서 카메라 데이터 추출
      const cameraConfig = DataModelService.extractCameraConfig(originalDtsMap);
      console.log('✅ Camera configuration extracted:', cameraConfig);
      
      return { originalDtsMap, cameraConfig };
    } catch (error) {
      console.error('Failed to load DTB and extract camera data:', error);
      throw new Error(`Failed to load DTB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
