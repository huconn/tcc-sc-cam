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
  /** 화면 해상도 (예: "1920x1080") */
  resolution: string;
  /** 화면 스케일 비율 (예: "125%") */
  scale: string;
  /** Device Pixel Ratio */
  dpr: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        resolution: '0x0',
        scale: '100%',
        dpr: 1
      };
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: `${screen.width}x${screen.height}`,
      scale: `${Math.round((window.outerWidth / window.innerWidth) * 100)}%`,
      dpr: window.devicePixelRatio || 1
    };
  });

  useEffect(() => {
    // Handler to call on window resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: `${screen.width}x${screen.height}`,
        scale: `${Math.round((window.outerWidth / window.innerWidth) * 100)}%`,
        dpr: window.devicePixelRatio || 1
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}

