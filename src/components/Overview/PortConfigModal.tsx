import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';

interface PortConfigModalProps {
  portId: string;
  portType: 'input' | 'output';
  deviceName: string;
  currentConfig?: any;
  onSave: (config: any) => void;
  onClose: () => void;
}

export const PortConfigModal: React.FC<PortConfigModalProps> = ({
  portId,
  portType,
  deviceName,
  currentConfig,
  onSave,
  onClose
}) => {
  const [config, setConfig] = useState({
    enabled: currentConfig?.enabled ?? true,
    dataType: currentConfig?.dataType || 'MIPI-CSI2',
    virtualChannel: currentConfig?.virtualChannel || 'CH0',
    dataLanes: currentConfig?.dataLanes || 4,
    pixelFormat: currentConfig?.pixelFormat || 'RAW10',
    resolution: currentConfig?.resolution || '1920x1080',
    frameRate: currentConfig?.frameRate || 30,
    ...currentConfig
  });

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-bold text-white">
              {deviceName} - Port {portId} Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Port Enable */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Enable Port</label>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="w-4 h-4"
            />
          </div>

          {/* Data Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Data Type</label>
            <select
              value={config.dataType}
              onChange={(e) => setConfig({ ...config, dataType: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="MIPI-CSI2">MIPI-CSI2</option>
              <option value="PARALLEL">Parallel</option>
              <option value="LVDS">LVDS</option>
              <option value="BT656">BT.656</option>
            </select>
          </div>

          {/* Virtual Channel (for MIPI) */}
          {config.dataType === 'MIPI-CSI2' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Virtual Channel</label>
              <select
                value={config.virtualChannel}
                onChange={(e) => setConfig({ ...config, virtualChannel: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="CH0">CH0</option>
                <option value="CH1">CH1</option>
                <option value="CH2">CH2</option>
                <option value="CH3">CH3</option>
              </select>
            </div>
          )}

          {/* Data Lanes (for MIPI) */}
          {config.dataType === 'MIPI-CSI2' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data Lanes</label>
              <select
                value={config.dataLanes}
                onChange={(e) => setConfig({ ...config, dataLanes: parseInt(e.target.value) })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="1">1 Lane</option>
                <option value="2">2 Lanes</option>
                <option value="4">4 Lanes</option>
              </select>
            </div>
          )}

          {/* Pixel Format */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Pixel Format</label>
            <select
              value={config.pixelFormat}
              onChange={(e) => setConfig({ ...config, pixelFormat: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="RAW8">RAW8</option>
              <option value="RAW10">RAW10</option>
              <option value="RAW12">RAW12</option>
              <option value="RAW14">RAW14</option>
              <option value="YUV422">YUV422</option>
              <option value="RGB888">RGB888</option>
            </select>
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
            <select
              value={config.resolution}
              onChange={(e) => setConfig({ ...config, resolution: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="640x480">640x480 (VGA)</option>
              <option value="1280x720">1280x720 (HD)</option>
              <option value="1920x1080">1920x1080 (FHD)</option>
              <option value="2560x1440">2560x1440 (QHD)</option>
              <option value="3840x2160">3840x2160 (4K)</option>
            </select>
          </div>

          {/* Frame Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Frame Rate (fps)</label>
            <input
              type="number"
              value={config.frameRate}
              onChange={(e) => setConfig({ ...config, frameRate: parseInt(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              min="1"
              max="120"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};