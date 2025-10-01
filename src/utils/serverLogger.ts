/**
 * Server Logger Utility
 * Renderer process에서 main process로 로그를 전송하는 유틸리티
 */

interface LogData {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

class ServerLogger {
  private isElectronApp: boolean;

  constructor() {
    this.isElectronApp = this.checkElectronEnvironment();
  }

  private checkElectronEnvironment(): boolean {
    const w: any = window as any;
    const ua = navigator.userAgent || '';
    const isElectronUA = ua.includes('Electron');
    const isElectronProcess = !!w?.process?.versions?.electron;
    const hasElectronAPI = !!w?.electronAPI?.getAppVersion;
    return isElectronUA || isElectronProcess || hasElectronAPI;
  }

  private async sendToServer(level: LogData['level'], message: string, data?: any): Promise<void> {
    if (!this.isElectronApp) {
      // 브라우저 환경에서는 일반 console.log 사용
      console.log(`[${level.toUpperCase()}] ${message}`, data || '');
      return;
    }

    try {
      // Electron 환경에서는 IPC로 main process에 전송
      await (window as any).electronAPI?.logToServer?.(level, message, data);
    } catch (error) {
      // IPC 실패 시 브라우저 콘솔로 폴백
      console.error('Failed to send log to server:', error);
      console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    }
  }

  info(message: string, data?: any): void {
    this.sendToServer('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.sendToServer('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.sendToServer('error', message, data);
  }

  debug(message: string, data?: any): void {
    this.sendToServer('debug', message, data);
  }
}

// 싱글톤 인스턴스
export const serverLogger = new ServerLogger();
