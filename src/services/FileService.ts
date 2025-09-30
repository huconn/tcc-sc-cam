import type { DtsMap } from '@/types/dts';

/**
 * 파일 I/O 서비스
 * 파일 로드/저장 담당
 */
export class FileService {
  /**
   * DTS/DTB 파일 저장
   */
  static async saveDtsDtb(dtsText: string): Promise<{ dtsPath: string; dtbPath: string }> {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI?.saveDtsDtb) {
      throw new Error('Electron API not available');
    }
    
    const result = await electronAPI.saveDtsDtb(dtsText);
    if (result?.error) {
      throw new Error(result.error);
    }
    
    if (result?.canceled) {
      throw new Error('Save canceled by user');
    }
    
    return {
      dtsPath: result.dtsPath,
      dtbPath: result.dtbPath
    };
  }

  /**
   * JSON 설정 파일 저장 (웹 환경)
   */
  static saveJsonConfig(config: any, filename: string = 'camera-config.json'): void {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * DTS 파일 다운로드 (웹 환경)
   */
  static downloadDts(dtsText: string, filename: string = 'output.dts'): void {
    const blob = new Blob([dtsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
