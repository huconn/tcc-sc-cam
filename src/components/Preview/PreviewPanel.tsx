import React, { useState, useMemo } from 'react';
import { Download, Copy, Eye, Code, FileText } from 'lucide-react';
import { useCameraStore } from '@/store/cameraStore';
import { DTSGenerator } from '@/utils/dtsGenerator';

export const PreviewPanel: React.FC = () => {
  const { exportConfiguration } = useCameraStore();
  const [activeView, setActiveView] = useState<'main-dts' | 'sub-dts' | 'json'>('main-dts');

  const config = useMemo(() => exportConfiguration(), [exportConfiguration]);
  
  const generator = useMemo(() => new DTSGenerator(config), [config]);
  
  const mainDTS = useMemo(() => generator.generateMainCoreDTS(), [generator]);
  const subDTS = useMemo(() => generator.generateSubCoreDTS(), [generator]);
  const jsonConfig = useMemo(() => JSON.stringify(config, null, 2), [config]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getCurrentContent = () => {
    switch (activeView) {
      case 'main-dts':
        return mainDTS;
      case 'sub-dts':
        return subDTS;
      case 'json':
        return jsonConfig;
      default:
        return '';
    }
  };

  const getCurrentFilename = () => {
    switch (activeView) {
      case 'main-dts':
        return 'main-core.dts';
      case 'sub-dts':
        return 'sub-core.dts';
      case 'json':
        return 'camera-config.json';
      default:
        return 'file.txt';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-100">Configuration Preview</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(getCurrentContent())}
              className="btn-secondary flex items-center gap-2"
              title="Copy to Clipboard"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button
              onClick={() => handleDownload(getCurrentContent(), getCurrentFilename())}
              className="btn-primary flex items-center gap-2"
              title="Download File"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-gray-800 border-b border-gray-700 p-2">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveView('main-dts')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeView === 'main-dts' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            Main Core DTS
          </button>
          <button
            onClick={() => setActiveView('sub-dts')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeView === 'sub-dts' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            Sub Core DTS
          </button>
          <button
            onClick={() => setActiveView('json')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeView === 'json' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Code className="w-4 h-4" />
            JSON Config
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full bg-gray-900">
          <pre className="h-full overflow-auto p-4 text-sm text-gray-100 font-mono whitespace-pre-wrap">
            {getCurrentContent()}
          </pre>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-800 border-t border-gray-700 p-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            {activeView === 'main-dts' && 'Main Core Device Tree Source'}
            {activeView === 'sub-dts' && 'Sub Core Device Tree Source'}
            {activeView === 'json' && 'Camera Configuration JSON'}
          </span>
          <span>
            {getCurrentContent().length} characters
          </span>
        </div>
      </div>
    </div>
  );
};
