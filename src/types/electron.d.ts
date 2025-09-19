export interface ElectronAPI {
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  saveFile: (fileName: string, content: string) => Promise<void>;
  loadFile: () => Promise<{ filePath: string; content: string } | null>;
  exportDTS: (config: any) => Promise<void>;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};