import { useState, useEffect } from 'react';

/**
 * Electron 환경 및 API 접근을 관리하는 Hook
 * 
 * @returns Electron 환경 여부와 API 객체
 * 
 * @example
 * ```tsx
 * const { isElectron, api, version } = useElectronAPI();
 * 
 * if (isElectron) {
 *   const appVersion = await api.getAppVersion();
 *   const result = await api.readResourceFile('config.json');
 * }
 * ```
 */
export interface ElectronAPI {
  getAppVersion?: () => Promise<string>;
  readResourceFile?: (filePath: string) => Promise<{ content?: string; error?: string }>;
  // 필요한 다른 Electron API 메서드들을 여기에 추가
}

export interface UseElectronAPIResult {
  /** Electron 환경 여부 */
  isElectron: boolean;
  /** Electron API 객체 (Electron 환경이 아니면 undefined) */
  api: ElectronAPI | undefined;
  /** 앱 버전 (로드 완료 후) */
  version: string;
}

export function useElectronAPI(): UseElectronAPIResult {
  const [isElectron, setIsElectron] = useState<boolean>(false);
  const [api, setApi] = useState<ElectronAPI | undefined>(undefined);
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    // Check if running in Electron environment
    const checkElectronEnvironment = () => {
      if (typeof window === 'undefined') {
        return false;
      }

      const w: any = window as any;
      const ua = navigator.userAgent || '';
      
      // Multiple checks for robustness
      const isElectronUA = ua.includes('Electron');
      const isElectronProcess = !!w?.process?.versions?.electron;
      const hasElectronAPI = !!w?.electronAPI?.getAppVersion;
      
      return isElectronUA || isElectronProcess || hasElectronAPI;
    };

    const isElectronEnv = checkElectronEnvironment();
    setIsElectron(isElectronEnv);

    if (isElectronEnv) {
      const w: any = window as any;
      setApi(w.electronAPI);

      // Try to get app version
      if (w.electronAPI?.getAppVersion) {
        w.electronAPI.getAppVersion()
          .then((v: string) => setVersion(v))
          .catch((error: Error) => {
            console.error('Failed to get app version:', error);
            setVersion('0.0.0');
          });
      }
    } else {
      // Browser environment - use base version
      setVersion('0.0.0');
    }
  }, []);

  return { isElectron, api, version };
}

