/**
 * File loader utility
 * Handles file loading in both browser and Electron environments
 */

declare global {
  interface Window {
    electronAPI?: {
      readResourceFile: (filePath: string) => Promise<{ content?: string; error?: string }>;
    };
  }
}

/**
 * Check if running in Electron environment
 */
export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
}

/**
 * Load file content
 * Uses IPC in Electron, fetch in browser
 */
export async function loadFile(filePath: string): Promise<string> {
  if (isElectron() && window.electronAPI?.readResourceFile) {
    // Electron environment - use IPC
    const result = await window.electronAPI.readResourceFile(filePath);
    if (result.error) {
      throw new Error(result.error);
    }
    return result.content || '';
  } else {
    // Browser environment - use fetch
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  }
}

/**
 * Load JSON file
 */
export async function loadJSON<T = any>(filePath: string): Promise<T> {
  const content = await loadFile(filePath);
  return JSON.parse(content);
}

