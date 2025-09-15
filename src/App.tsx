import React, { useState } from 'react';
import { Download, Upload, Save, FileText, Settings } from 'lucide-react';
import { ViewModeSelector } from '@/components/ViewModeSelector';
import { MIPIPanel } from '@/components/MIPIConfiguration/MIPIPanel';
import { ISPPanel } from '@/components/ISPConfiguration/ISPPanel';
import { CameraMuxPanel } from '@/components/CameraMux/CameraMuxPanel';
import { PreviewPanel } from '@/components/Preview/PreviewPanel';
import { OverviewPage } from '@/components/Overview/OverviewPage';
import { useCameraStore } from '@/store/cameraStore';
import { DTSGenerator } from '@/utils/dtsGenerator';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'mipi' | 'isp' | 'mux' | 'preview'>('overview');
  const { exportConfiguration, loadConfiguration } = useCameraStore();

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
          <div className="flex items-center gap-4">
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

      {/* View Mode Selector */}
      <ViewModeSelector />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Configuration Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-gray-800 border-b border-gray-700">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'overview' ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('mipi')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'mipi' ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                MIPI CSI
              </button>
              <button
                onClick={() => setActiveTab('isp')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'isp' ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ISP
              </button>
              <button
                onClick={() => setActiveTab('mux')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'mux' ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Camera Mux
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'preview' ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className={`flex-1 overflow-auto ${activeTab === 'preview' || activeTab === 'overview' ? 'p-0' : 'p-4'}`}>
            {activeTab === 'overview' && <OverviewPage />}
            {activeTab === 'mipi' && <MIPIPanel />}
            {activeTab === 'isp' && <ISPPanel />}
            {activeTab === 'mux' && <CameraMuxPanel />}
            {activeTab === 'preview' && <PreviewPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};