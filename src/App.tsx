import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Save, FolderOpen } from 'lucide-react';
import { OverviewPage } from '@/components/Overview/OverviewPage';
import { DtsMapPanel } from '@/components/Tools/DtsMapPanel';
import { ConfigurationSelector } from '@/components/ConfigurationSelector';
import { useCameraStore } from '@/store/cameraStore';
import { DTSGenerator } from '@/utils/dtsGenerator';
import { DtsController } from '@/controllers/DtsController';

export const App: React.FC = () => {
  const { exportConfiguration, loadConfiguration, setOriginalDtsMap } = useCameraStore();
  const debugShowDtsMap = useCameraStore((s: any) => s.debugShowDtsMap as boolean);
  const debugShowResolution = useCameraStore((s: any) => s.debugShowResolution as boolean);
  const debugShowConfigurationSelector = useCameraStore((s: any) => s.debugShowConfigurationSelector as boolean);
  const webLoadInputRef = useRef<HTMLInputElement | null>(null);
  const [appVersion, setAppVersion] = useState<string>('');
  // localStorage에서 이전 선택 복원 (새로고침 시 유지)
  const [currentSoc, setCurrentSoc] = useState<string>(() => {
    return localStorage.getItem('selectedSoc') || '';
  });
  const [currentModule, setCurrentModule] = useState<string>(() => {
    return localStorage.getItem('selectedModule') || '';
  });
  const [showSelector, setShowSelector] = useState<boolean>(false);  // Configuration Selector 표시 (초기값 false)
  const [isElectronApp, setIsElectronApp] = useState<boolean>(() => {
    const w: any = window as any;
    const ua = navigator.userAgent || '';
    const isElectronUA = ua.includes('Electron');
    const isElectronProcess = !!w?.process?.versions?.electron;
    const hasElectronAPI = !!w?.electronAPI?.getAppVersion;
    return isElectronUA || isElectronProcess || hasElectronAPI;
  });
  const [browserInfo, setBrowserInfo] = useState({
    resolution: '0x0',
    scale: '100%',
    devicePixelRatio: 1
  });
  const [dtsMapVisible, setDtsMapVisible] = useState<boolean>(true);  // DTS Map 표시 상태 (초기값 true)

  // Debug: DTS Map 표시 상태 로그
  useEffect(() => {
    console.log('[DTS Map Debug]', {
      debugShowDtsMap,
      dtsMapVisible,
      shouldShow: debugShowDtsMap && dtsMapVisible
    });
  }, [debugShowDtsMap, dtsMapVisible]);

  useEffect(() => {
    // Get app version when component mounts
    const getVersion = async () => {
      // Check if we're in Electron environment
      const electronAPI = (window as any).electronAPI;

      if (electronAPI?.getAppVersion) {
        try {
          const version = await electronAPI.getAppVersion();
          setAppVersion(version);
          setIsElectronApp(true);
        } catch (error) {
          console.error('Failed to get app version:', error);
          setAppVersion('0.0.0'); // Fallback to base version
          setIsElectronApp(false);
        }
      } else {
        // Running in browser or electronAPI not available
        setAppVersion('0.0.0'); // Use base version for dev
        setIsElectronApp(false);
      }
    };

    getVersion();
  }, []);

  // Electron 환경에서는 main.cjs의 'close' 이벤트에서 localStorage 정리
  // 브라우저 환경에서는 localStorage 유지 (개발용)

  // Auto-load default SoC/Module if selector is disabled
  useEffect(() => {
    const autoLoadDefault = async () => {
      if (!debugShowConfigurationSelector && !currentSoc && !currentModule) {
        try {
          // Load soc-profiles.json
          const response = await fetch('/config/soc-profiles.json');
          const profiles = await response.json();
          
          // Find first enabled SoC
          const firstEnabledSoc = Object.entries(profiles.profiles).find(
            ([_, profile]: [string, any]) => profile.enabled
          );
          
          if (firstEnabledSoc) {
            const [socKey, socProfile] = firstEnabledSoc as [string, any];
            
            // Find first enabled module
            const firstEnabledModule = Object.entries(socProfile.modules).find(
              ([_, module]: [string, any]) => module.enabled
            );
            
            if (firstEnabledModule) {
              const [moduleKey] = firstEnabledModule;
              console.log(`Auto-loading: ${socKey} / ${moduleKey}`);
              setCurrentSoc(socKey);
              setCurrentModule(moduleKey);
              // localStorage에도 저장 (세션 유지)
              localStorage.setItem('selectedSoc', socKey);
              localStorage.setItem('selectedModule', moduleKey);
            }
          }
        } catch (error) {
          console.error('Failed to auto-load default SoC/Module:', error);
        }
      }
    };
    
    autoLoadDefault();
  }, [debugShowConfigurationSelector, currentSoc, currentModule]);

  // Update browser info (resolution, scale, device pixel ratio)
  useEffect(() => {
    const updateBrowserInfo = () => {
      const resolution = `${screen.width}x${screen.height}`;
      const scale = Math.round((window.outerWidth / window.innerWidth) * 100);
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      setBrowserInfo({
        resolution,
        scale: `${scale}%`,
        devicePixelRatio
      });
    };

    // Initial update
    updateBrowserInfo();

    // Listen for resize events
    window.addEventListener('resize', updateBrowserInfo);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateBrowserInfo);
    };
  }, []);

  // Keyboard shortcut for DTS Map toggle (Ctrl+Shift+D)
  // debugShowDtsMap이 true일 때만 토글 가능
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        if (debugShowDtsMap) {
          setDtsMapVisible(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [debugShowDtsMap]);

  const handleExportDTS = () => {
    const config = exportConfiguration();
    const generator = new DTSGenerator(config);

    const mainDTS = generator.generateMainCoreDTS();
    const subDTS = generator.generateSubCoreDTS();

    // Create and download main core DTS
    const mainBlob = new Blob([mainDTS], { type: 'text/plain' });
    const mainUrl = URL.createObjectURL(mainBlob);
    const mainLink = document.createElement('a');
    mainLink.href = mainUrl;
    mainLink.download = 'main-core.dts';
    mainLink.click();

    // Create and download sub core DTS
    const subBlob = new Blob([subDTS], { type: 'text/plain' });
    const subUrl = URL.createObjectURL(subBlob);
    const subLink = document.createElement('a');
    subLink.href = subUrl;
    subLink.download = 'sub-core.dts';
    subLink.click();
  };

  const handleSaveConfig = async () => {
    const state = useCameraStore.getState();
    const { originalDtsMap } = state as any;
    
    if (!originalDtsMap) {
      alert('No DTS map loaded. Load DTB/DTS/JSON first.');
      return;
    }
    
    try {
      const cameraConfig = state.exportConfiguration();
      
      if (isElectronApp) {
        // Electron: Save DTS/DTB files
        const result = await DtsController.saveCameraConfig(originalDtsMap, cameraConfig);
        alert(`Saved:\nDTS: ${result.dtsPath}\nDTB: ${result.dtbPath}`);
      } else {
        // Web: Download DTS file
        DtsController.downloadCameraConfig(originalDtsMap, cameraConfig);
      }
    } catch (error) {
      console.error(error);
      alert(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLoadDTB = async () => {
    // Web: only allow loading DTS/JSON into dtsMap
    if (!isElectronApp) {
      setOriginalDtsMap?.(undefined);
      webLoadInputRef.current?.click();
      return;
    }
    
    // Electron: allow DTB/DTS/JSON
    try {
      setOriginalDtsMap?.(undefined);
      const { originalDtsMap, cameraConfig, socType } = await DtsController.loadDtbAndExtractCamera();
      setOriginalDtsMap?.(originalDtsMap);
      loadConfiguration(cameraConfig);
      console.log(`DTB loaded for SoC: ${socType}`);
    } catch (error) {
      console.error(error);
      alert(`Failed to load DTB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleWebLoadDtsOrJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    const lower = file.name.toLowerCase();
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (lower.endsWith('.json')) {
          const map = JSON.parse(text);
          setOriginalDtsMap?.(map);
        } else if (lower.endsWith('.dts')) {
          // parse in browser
          import('@/utils/dtsParse').then(mod => {
            const map = mod.parseDtsToMap(text);
            setOriginalDtsMap?.(map);
          });
        } else {
          alert('Web: please select a .dts or .json file.');
        }
      } catch (err) {
        console.error('Failed to load map:', err);
        alert('Failed to load file.');
      }
    };
    reader.readAsText(file);
  };

  const handleLoadConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const lower = file.name.toLowerCase();
      if (!lower.endsWith('.json')) {
        alert('This button only loads JSON configuration files. Use "Load DTB" for .dtb/.dts.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          loadConfiguration(config);
        } catch (error) {
          console.error('Failed to load configuration:', error);
          alert('Failed to load configuration file. Please select a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  // (Removed Load Map web-only flow per request)

  const handleConfigurationSelect = (soc: string, module: string) => {
    console.log(`Configuration selected: ${soc} / ${module}`);
    setCurrentSoc(soc);
    setCurrentModule(module);
    setShowSelector(false);
    
    // localStorage에 저장 (새로고침 시 유지)
    localStorage.setItem('selectedSoc', soc);
    localStorage.setItem('selectedModule', module);
  };

  // 팝업 표시 조건
  // 1. debugShowConfigurationSelector가 true이고
  // 2. (localStorage에 저장된 값이 없거나 showSelector가 true일 때)
  const hasStoredSelection = localStorage.getItem('selectedSoc') && localStorage.getItem('selectedModule');
  const shouldShowSelector = debugShowConfigurationSelector && (!hasStoredSelection || showSelector);
  
  // 디버깅 로그 및 강제 초기화 (임시)
  useEffect(() => {
    console.log('=== Selector Debug ===');
    console.log('debugShowConfigurationSelector:', debugShowConfigurationSelector);
    console.log('hasStoredSelection:', !!hasStoredSelection);
    console.log('storedSoc:', localStorage.getItem('selectedSoc'));
    console.log('storedModule:', localStorage.getItem('selectedModule'));
    console.log('currentSoc:', currentSoc);
    console.log('currentModule:', currentModule);
    console.log('showSelector:', showSelector);
    console.log('shouldShowSelector:', shouldShowSelector);
    console.log('=====================');
    
    // 🔥 임시: localStorage 강제 초기화 (테스트용 - 확인 후 다시 주석 처리)
    // UNCOMMENT BELOW TO TEST FIRST RUN:
    // localStorage.removeItem('selectedSoc');
    // localStorage.removeItem('selectedModule');
  }, [debugShowConfigurationSelector, hasStoredSelection, currentSoc, currentModule, showSelector, shouldShowSelector]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Configuration Selector */}
      {shouldShowSelector && (
        <ConfigurationSelector onSelect={handleConfigurationSelect} />
      )}
      {/* Header */}
      <header className="bg-gray-850 border-b border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-[10px]">
            <h1 className="text-xl font-bold text-gray-100">
              Telechips SOC Configuration Tool{currentModule ? ` - ${currentModule.charAt(0).toUpperCase() + currentModule.slice(1)}` : ''}
            </h1>
            <span className="text-xs text-gray-500">{currentSoc ? currentSoc.toUpperCase() : ''}</span>
            {debugShowConfigurationSelector && currentSoc && currentModule && (
              <button
                onClick={() => {
                  setShowSelector(true);
                  setCurrentSoc('');
                  setCurrentModule('');
                  // localStorage 초기화 (재선택 가능하도록)
                  localStorage.removeItem('selectedSoc');
                  localStorage.removeItem('selectedModule');
                }}
                className="text-xs text-gray-400 hover:text-gray-200 underline"
              >
                Change SoC/Module
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Hidden input for web-only load (DTS/JSON) */}
            <input
              ref={webLoadInputRef}
              type="file"
              accept=".dts,.json"
              className="hidden"
              onChange={handleWebLoadDtsOrJson}
            />
            <button
              onClick={handleLoadDTB}
              className="btn-secondary flex items-center gap-2"
              title={isElectronApp ? 'Load DTB and convert to JSON' : 'Load DTS/JSON into map'}
            >
              <FolderOpen className="w-4 h-4" />
              {isElectronApp ? 'Load DTB' : 'Load DTS'}
            </button>
            <button
              onClick={handleSaveConfig}
              className="btn-secondary flex items-center gap-2"
              title="Save DTS/DTB"
            >
              <Save className="w-4 h-4" />
              Save DTB
            </button>
            <label className="btn-secondary flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Load Config
              <input
                type="file"
                accept=".json"
                onChange={handleLoadConfig}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExportDTS}
              className="btn-primary flex items-center gap-2"
              title="Export DTS Files"
            >
              <Download className="w-4 h-4" />
              Export DTS
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Configuration Area */}
        <div className="flex-1 flex flex-col">
          {/* Module Content - 현재 선택된 모듈에 따라 다른 UI 표시 */}
          <div className="flex-1 overflow-auto p-0">
            {currentModule === 'camera' ? (
              <OverviewPage />
            ) : currentModule === 'pin' ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <p className="text-xl mb-2">Pin Configuration</p>
                  <p className="text-sm">Coming Soon</p>
                </div>
              </div>
            ) : currentModule === 'power' ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <p className="text-xl mb-2">Power Configuration</p>
                  <p className="text-sm">Coming Soon</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <p className="text-xl mb-2">No Module Selected</p>
                  <p className="text-sm">Please select SoC and Module</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* DTS Map side panel (only when debug flag enabled and visible) */}
        {debugShowDtsMap && dtsMapVisible && <DtsMapPanel />}
      </div>

      {/* Version Display - Bottom Right Corner */}
      {appVersion && (
        <div className="fixed bottom-3 right-3 bg-gray-800/80 backdrop-blur-sm text-gray-400 text-xs px-2 py-1 rounded border border-gray-700/50">
          v{appVersion}
        </div>
      )}

      {/* Browser Info - Bottom Left Corner, always on top when debug flag enabled */}
      {debugShowResolution && (
        <div className="fixed bottom-3 left-3 z-[1000] bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded px-3 py-2 text-[11px] leading-4 text-gray-200 shadow-lg">
          <span className="text-gray-400">Resolution:</span> {browserInfo.resolution}
          <span className="mx-2" />
          <span className="text-gray-400">Scale:</span> {browserInfo.scale}
          <span className="mx-2" />
          <span className="text-gray-400">DPR:</span> {browserInfo.devicePixelRatio}
        </div>
      )}
    </div>
  );
};