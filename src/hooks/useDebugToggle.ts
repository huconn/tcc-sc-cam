import { useState, useEffect } from 'react';

/**
 * 디버그 기능의 토글 동작을 관리하는 Custom Hook
 * 
 * @param config - 디버그 토글 설정
 * @param config.key - 키보드 단축키 (예: 'D', 'L')
 * @param config.featureEnabled - Feature flag (store의 초기값)
 * @param config.storeSetter - Store setter 함수 (옵션)
 * @param config.modifiers - 키 조합 (기본값: Ctrl+Shift)
 * @param config.debugName - 디버깅용 이름
 * 
 * @returns [visible, setVisible] - 현재 표시 상태와 setter 함수
 * 
 * @example
 * ```tsx
 * const [dtsMapVisible] = useDebugToggle({
 *   key: 'D',
 *   featureEnabled: debugShowDtsMap,
 *   storeSetter: setDebugShowLayoutBorders,
 *   debugName: 'DTS Map'
 * });
 * ```
 */
export interface DebugToggleConfig {
  /** 키보드 단축키 (대문자, 예: 'D', 'L') */
  key: string;
  /** Feature flag - store의 초기값 */
  featureEnabled: boolean;
  /** Store setter 함수 (옵션) */
  storeSetter?: (value: boolean) => void;
  /** 키 조합 설정 */
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  };
  /** 디버깅용 이름 */
  debugName: string;
}

export function useDebugToggle(config: DebugToggleConfig): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const {
    key,
    featureEnabled,
    storeSetter,
    modifiers = { ctrl: true, shift: true },
    debugName
  } = config;

  // Local state for toggle visibility
  const [visible, setVisible] = useState<boolean>(true);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check modifiers
      const ctrlMatch = modifiers.ctrl === undefined || event.ctrlKey === modifiers.ctrl;
      const shiftMatch = modifiers.shift === undefined || event.shiftKey === modifiers.shift;
      const altMatch = modifiers.alt === undefined || event.altKey === modifiers.alt;
      
      if (ctrlMatch && shiftMatch && altMatch && event.key === key) {
        event.preventDefault();
        
        console.log(`[${debugName}] Shortcut pressed. Feature enabled:`, featureEnabled);
        
        if (featureEnabled) {
          setVisible(prev => {
            console.log(`[${debugName}] Toggling from`, prev, 'to', !prev);
            return !prev;
          });
        } else {
          console.log(`[${debugName}] Toggle blocked - feature is disabled`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, featureEnabled, modifiers, debugName]);

  // Sync visible state to store if setter is provided
  useEffect(() => {
    if (storeSetter && featureEnabled) {
      // Only sync when feature is enabled
      storeSetter(visible);
      console.log(`[${debugName}] Synced to store:`, visible);
    }
    // Don't force false when feature is disabled - let initial value persist
  }, [visible, featureEnabled, storeSetter, debugName]);

  // Debug logging
  useEffect(() => {
    console.log(`[${debugName} Debug]`, {
      featureEnabled,
      visible,
      shouldShow: featureEnabled && visible
    });
  }, [featureEnabled, visible, debugName]);

  return [visible, setVisible];
}

