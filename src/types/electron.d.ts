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
  convertDTB: (inPath?: string) => Promise<{ canceled?: boolean; inputPath?: string; outPath?: string; jsonText?: string; error?: string }>;
  saveDtsDtb: (dtsText: string) => Promise<{ canceled?: boolean; dtsPath?: string; dtbPath?: string; error?: string }>;
  getAppVersion: () => Promise<string>;
  readResourceFile: (filePath: string) => Promise<{ content?: string; error?: string }>;
  getZoomFactor: () => number;
  setZoomFactor: (factor: number) => void;
  getZoomLevel: () => number;
  saveZoomLevel: (zoomFactor: number) => Promise<{ success?: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};