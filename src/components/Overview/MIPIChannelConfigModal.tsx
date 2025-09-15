import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';

interface MIPIChannelConfigModalProps {
  mipiId: string;
  channelId: number;
  currentConfig?: {
    pixelMode?: number;
    virtualChannel?: number;
  };
  onSave: (config: { pixelMode: number; virtualChannel: number }) => void;
  onClose: () => void;
}

export const MIPIChannelConfigModal: React.FC<MIPIChannelConfigModalProps> = ({
  mipiId,
  channelId,
  currentConfig,
  onSave,
  onClose
}) => {
  const [config, setConfig] = useState({
    pixelMode: currentConfig?.pixelMode ?? 0,
    virtualChannel: currentConfig?.virtualChannel ?? channelId
  });

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
      <div className="bg-gray-800 rounded-lg p-6 w-[450px]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold text-white">
              {mipiId.toUpperCase()} - OUT CH{channelId} Configuration
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
          {/* Pixel Mode Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pixel Mode
            </label>
            <select
              value={config.pixelMode}
              onChange={(e) => setConfig({ ...config, pixelMode: parseInt(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="0">0: Single Pixel Mode</option>
              <option value="1">1: Dual Pixel Mode (RAW8/10/12, YUV422)</option>
              <option value="2">2: Quad Pixel Mode (RAW8/10/12)</option>
              <option value="3">3: Invalid</option>
            </select>
          </div>

          {/* Virtual Channel Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Virtual Channel
            </label>
            <div className="flex gap-4">
              {[0, 1, 2, 3].map(vc => (
                <label key={vc} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="virtualChannel"
                    value={vc}
                    checked={config.virtualChannel === vc}
                    onChange={() => setConfig({ ...config, virtualChannel: vc })}
                    className="w-4 h-4"
                  />
                  <span className="text-white">VC{vc}</span>
                </label>
              ))}
            </div>
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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};