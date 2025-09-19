import React, { useState, useEffect } from 'react';
import { Download, Upload, Save } from 'lucide-react';
import { OverviewPage } from '@/components/Overview/OverviewPage';
import { useCameraStore } from '@/store/cameraStore';
import { DTSGenerator } from '@/utils/dtsGenerator';

export const App: React.FC = () => {
  const { exportConfiguration, loadConfiguration } = useCameraStore();
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    // Get app version when component mounts
    const getVersion = async () => {
      // Check if we're in Electron environment
      const electronAPI = (window as any).electronAPI;

      if (electronAPI?.getAppVersion) {
        try {
          const version = await electronAPI.getAppVersion();
          setAppVersion(version);
        } catch (error) {
          console.error('Failed to get app version:', error);
          setAppVersion('0.0.0'); // Fallback to base version
        }
      } else {
        // Running in browser or electronAPI not available
        setAppVersion('0.0.0'); // Use base version for dev
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

  const handleSaveConfig = () => {
    const config = exportConfiguration();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'camera-config.json';
    link.click();
  };

  const handleLoadConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          loadConfiguration(config);
        } catch (error) {
          console.error('Failed to load configuration:', error);
          alert('Failed to load configuration file');
        }
      };
      reader.readAsText(file);
    }
  };

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
            <button
              onClick={handleSaveConfig}
              className="btn-secondary flex items-center gap-2"
              title="Save Configuration"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <label className="btn-secondary flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Load
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