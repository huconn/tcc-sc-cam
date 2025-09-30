import type { DtsMap } from '@/types/dts';
import type { CameraConfiguration } from '@/types/camera';
import { DataModelService } from './DataModelService';

/**
 * DTS 오버라이트 서비스
 * 원본 DTS에 카메라 설정을 오버라이트
 */
export class DtsOverlayService {
  /**
   * 원본 DTS에 카메라 설정 오버라이트 (핵심 기능)
   */
  static overlayCameraConfig(
    originalDtsMap: DtsMap, 
    cameraConfig: CameraConfiguration
  ): string {
    // 1. 카메라 설정을 DTS 텍스트로 변환
    const cameraDts = DataModelService.configToDts(cameraConfig);
    
    // 2. 원본 DTS 맵을 텍스트로 변환
    const originalDts = this.dtsMapToText(originalDtsMap);
    
    // 3. 카메라 설정을 원본 DTS에 오버라이트
    return this.mergeDtsText(originalDts, cameraDts);
  }

  /**
   * DTS 맵을 텍스트로 변환
   */
  private static dtsMapToText(dtsMap: DtsMap): string {
    // TODO: dtsMapToDts 함수 사용
    const { dtsMapToDts } = require('@/utils/dtsSerialize');
    return dtsMapToDts(dtsMap);
  }

  /**
   * 두 DTS 텍스트를 병합 (카메라 설정이 원본을 오버라이트)
   */
  private static mergeDtsText(originalDts: string, cameraDts: string): string {
    const lines = originalDts.split('\n');
    const cameraLines = cameraDts.split('\n');
    
    // 카메라 관련 노드들을 찾아서 교체
    const result: string[] = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // 카메라 관련 노드 시작 감지
      if (this.isCameraNodeStart(line)) {
        // 원본 카메라 노드 건너뛰기
        i = this.skipCameraNode(lines, i);
        
        // 새로운 카메라 설정 삽입
        result.push(...cameraLines);
        result.push(''); // 빈 줄 추가
      } else {
        result.push(line);
        i++;
      }
    }
    
    return result.join('\n');
  }

  /**
   * 카메라 노드 시작인지 확인
   */
  private static isCameraNodeStart(line: string): boolean {
    const cameraKeywords = ['mipi', 'csi', 'isp', 'camera', 'sensor', 'svdw', 'vwdma', 'cied', 'mdw'];
    const trimmedLine = line.trim();
    
    return cameraKeywords.some(keyword => 
      trimmedLine.includes(`&${keyword}`) || 
      trimmedLine.includes(`${keyword}:`)
    );
  }

  /**
   * 카메라 노드 끝까지 건너뛰기
   */
  private static skipCameraNode(lines: string[], startIndex: number): number {
    let i = startIndex;
    let braceCount = 0;
    let foundOpeningBrace = false;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // 여는 중괄호 찾기
      if (line.includes('{')) {
        foundOpeningBrace = true;
        braceCount++;
      }
      
      // 닫는 중괄호 찾기
      if (line.includes('}')) {
        braceCount--;
        if (foundOpeningBrace && braceCount === 0) {
          return i + 1; // 다음 줄부터
        }
      }
      
      i++;
    }
    
    return i;
  }

  /**
   * 카메라 설정만으로 DTS 생성 (테스트용)
   */
  static generateCameraOnlyDTS(cameraConfig: CameraConfiguration): string {
    const cameraDts = DataModelService.configToDts(cameraConfig);
    
    // 기본 DTS 헤더 추가
    const header = [
      '/dts-v1/;',
      '',
      '/ {',
      '\tcompatible = "telechips,tcc807x";',
      '',
      '\t/* Camera Configuration */'
    ];
    
    const footer = [
      '};',
      ''
    ];
    
    return [
      ...header,
      cameraDts,
      ...footer
    ].join('\n');
  }
}
