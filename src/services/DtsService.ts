import type { DtsMap } from '@/types/dts';
import { dtsMapToDts } from '@/utils/dtsSerialize';

/**
 * DTS 변환 서비스
 * DTB ↔ DTS ↔ JSON 변환 담당
 */
export class DtsService {
  /**
   * JSON 맵을 DTS 텍스트로 변환
   */
  static jsonToDts(dtsMap: DtsMap): string {
    return dtsMapToDts(dtsMap);
  }

  /**
   * DTS 텍스트를 JSON 맵으로 변환
   */
  static dtsToJson(dtsText: string): DtsMap {
    // TODO: 구현 필요
    throw new Error('Not implemented yet');
  }

  /**
   * DTB를 JSON으로 변환 (Electron IPC 호출)
   */
  static async dtbToJson(dtbPath?: string): Promise<DtsMap> {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI?.convertDTB) {
      throw new Error('Electron API not available');
    }
    
    const result = await electronAPI.convertDTB(dtbPath);
    if (result?.error) {
      throw new Error(result.error);
    }
    
    if (!result?.jsonText) {
      throw new Error('No JSON data returned');
    }
    
    return JSON.parse(result.jsonText);
  }
}
