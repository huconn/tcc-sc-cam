import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Save, FolderOpen } from 'lucide-react';
import { OverviewPage } from '@/components/Overview/OverviewPage';
import { DtsMapPanel } from '@/components/Overview/DtsMapPanel';
import { useCameraStore } from '@/store/cameraStore';
import { DTSGenerator } from '@/utils/dtsGenerator';
import { dtsMapToDts } from '@/utils/dtsSerialize';

export const App: React.FC = () => {
  const { exportConfiguration, loadConfiguration, setDtsMap, setLoadedDtsText } = useCameraStore();
  const debugShowDtsMap = useCameraStore(s => (s as any).debugShowDtsMap as boolean);
  const webLoadInputRef = useRef<HTMLInputElement | null>(null);
  const [appVersion, setAppVersion] = useState<string>('');
  const [isElectronApp, setIsElectronApp] = useState<boolean>(() => {
    const w: any = window as any;
    const ua = navigator.userAgent || '';
    const isElectronUA = ua.includes('Electron');
    const isElectronProcess = !!w?.process?.versions?.electron;
    const hasElectronAPI = !!w?.electronAPI?.getAppVersion;
    return isElectronUA || isElectronProcess || hasElectronAPI;
  });

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
    const electronAPI = (window as any).electronAPI;
    const state = useCameraStore.getState();
    const { dtsMap, loadedDtsText } = state as any;
    if (!dtsMap && !loadedDtsText) {
      alert('No DTS map loaded. Load DTB/DTS/JSON first.');
      return;
    }
    try {
      const dtsText = loadedDtsText || dtsMapToDts(dtsMap as any);
      if (isElectronApp && electronAPI?.saveDtsDtb) {
        const res = await electronAPI.saveDtsDtb(dtsText);
        if (res?.error) {
          console.error(res.error);
          alert('Failed to save DTS/DTB.');
        } else if (!res?.canceled) {
          alert(`Saved:\nDTS: ${res.dtsPath}\nDTB: ${res.dtbPath}`);
        }
      } else {
        // Web fallback: download only DTS
        const blob = new Blob([dtsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'output.dts';
        link.click();
      }
    } catch (e) {
      console.error(e);
      alert('Unexpected error while generating DTS.');
    }
  };

  const handleLoadDTB = async () => {
    const electronAPI = (window as any).electronAPI;
    // Web: only allow loading DTS/JSON into dtsMap
    if (!isElectronApp || !electronAPI?.convertDTB) {
      // Clear previous map before loading new
      setDtsMap?.(undefined);
      setLoadedDtsText?.(undefined);
      webLoadInputRef.current?.click();
      return;
    }
    // Electron: allow DTB/DTS/JSON
    try {
      // Clear previous map before loading new
      setDtsMap?.(undefined);
      setLoadedDtsText?.(undefined);
      const res = await electronAPI.convertDTB();
      if (res?.error) {
        console.error(res.error);
        alert('Failed to load/convert file. See console for details.');
        return;
      }
      if (res?.canceled) return;
      if (res?.jsonText && setDtsMap) {
        try {
          const dataMap = JSON.parse(res.jsonText);
          setDtsMap(dataMap);
        } catch (e) {
          console.error('Failed to parse returned JSON text', e);
        }
      }
      if (res?.dtsText && setLoadedDtsText) {
        setLoadedDtsText(res.dtsText);
      } else {
        setLoadedDtsText?.(undefined);
      }
    } catch (e) {
      console.error(e);
      alert('Unexpected error while loading file.');
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
          setDtsMap?.(map);
        } else if (lower.endsWith('.dts')) {
          // parse in browser
          import('@/utils/dtsParse').then(mod => {
            const map = mod.parseDtsToMap(text);
            setDtsMap?.(map);
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

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-850 border-b border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-[10px]">
            <h1 className="text-xl font-bold text-gray-100">Telechips SOC Configuration Tool - Camera</h1>
            <span className="text-xs text-gray-500">TCC807x (Dolphin5)</span>
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
          {/* Overview Content - Always shown */}
          <div className="flex-1 overflow-auto p-0">
            <OverviewPage />
          </div>
        </div>
        {/* DTS Map side panel (only when debug flag enabled) */}
        {debugShowDtsMap && <DtsMapPanel />}
      </div>

      {/* Version Display - Bottom Right Corner */}
      {appVersion && (
        <div className="fixed bottom-3 right-3 bg-gray-800/80 backdrop-blur-sm text-gray-400 text-xs px-2 py-1 rounded border border-gray-700/50">
          v{appVersion}
        </div>
      )}
    </div>
  );
};