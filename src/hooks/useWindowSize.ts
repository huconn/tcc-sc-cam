import { useState, useEffect } from 'react';

/**
 * 브라우저 창 크기와 해상도 정보를 추적하는 Hook
 * 
 * @returns 창 크기, 해상도, 스케일, DPR 정보
 * 
 * @example
 * ```tsx
 * const { width, height, resolution, scale, dpr } = useWindowSize();
 * console.log(`Window: ${width}x${height}, Screen: ${resolution}`);
 * ```
 */
export interface WindowSize {
  /** 브라우저 창 너비 */
  width: number;
  /** 브라우저 창 높이 */
  height: number;
  /** 화면 해상도 (예: "1920x1080") - 물리적 해상도 */
  resolution: string;
  /** 논리적 해상도 (예: "1280x720") - CSS 해상도 */
  logicalResolution: string;
  /** 화면 스케일 비율 (예: "125%") - OS 디스플레이 설정 */
  scale: string;
  /** Device Pixel Ratio - OS 스케일 반영 */
  dpr: number;
  /** 브라우저 줌 레벨 (예: "120%") - Ctrl+/- */
  zoom: string;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        resolution: '0x0',
        logicalResolution: '0x0',
        scale: '100%',
        dpr: 1,
        zoom: '100%'
      };
    }

    const dpr = window.devicePixelRatio || 1;
    const osScale = Math.round(dpr * 100);
    
    // 논리적 해상도 (CSS 픽셀)
    const logicalWidth = screen.width;
    const logicalHeight = screen.height;
    
    // 물리적 해상도 (실제 픽셀) = 논리적 해상도 × DPR
    const physicalWidth = Math.round(logicalWidth * dpr);
    const physicalHeight = Math.round(logicalHeight * dpr);
    
    // 브라우저 줌 계산: Electron webFrame API 사용
    let browserZoom = 100;
    if (window.electronAPI?.getZoomFactor) {
      try {
        const zoomFactor = window.electronAPI.getZoomFactor();
        browserZoom = Math.round(zoomFactor * 100);
      } catch (e) {
        // Fallback to 100%
        browserZoom = 100;
      }
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: `${physicalWidth}x${physicalHeight}`,
      logicalResolution: `${logicalWidth}x${logicalHeight}`,
      scale: `${osScale}%`,
      dpr: dpr,
      zoom: `${browserZoom}%`
    };
  });

  useEffect(() => {
    // Handler to call on window resize
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const osScale = Math.round(dpr * 100);
      
      // 논리적 해상도 (CSS 픽셀)
      const logicalWidth = screen.width;
      const logicalHeight = screen.height;
      
      // 물리적 해상도 (실제 픽셀) = 논리적 해상도 × DPR
      const physicalWidth = Math.round(logicalWidth * dpr);
      const physicalHeight = Math.round(logicalHeight * dpr);
      
      // 브라우저 줌 계산: Electron webFrame API 사용
      let browserZoom = 100;
      if (window.electronAPI?.getZoomFactor) {
        try {
          const zoomFactor = window.electronAPI.getZoomFactor();
          browserZoom = Math.round(zoomFactor * 100);
        } catch (e) {
          // Fallback to 100%
          browserZoom = 100;
        }
      }

      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: `${physicalWidth}x${physicalHeight}`,
        logicalResolution: `${logicalWidth}x${logicalHeight}`,
        scale: `${osScale}%`,
        dpr: dpr,
        zoom: `${browserZoom}%`
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Poll zoom factor every 500ms to detect Ctrl+/- changes
    // (Electron doesn't fire resize event on zoom)
    let lastZoomFactor = 1;
    const zoomCheckInterval = setInterval(() => {
      if (window.electronAPI?.getZoomFactor) {
        try {
          const currentZoomFactor = window.electronAPI.getZoomFactor();
          if (currentZoomFactor !== lastZoomFactor) {
            lastZoomFactor = currentZoomFactor;
            
            // Save zoom level to persistent storage
            if (window.electronAPI?.saveZoomLevel) {
              window.electronAPI.saveZoomLevel(currentZoomFactor).catch(err => {
                console.error('Failed to save zoom level:', err);
              });
            }
            
            handleResize();
          }
        } catch (e) {
          // Ignore errors
        }
      }
    }, 500);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(zoomCheckInterval);
    };
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}

