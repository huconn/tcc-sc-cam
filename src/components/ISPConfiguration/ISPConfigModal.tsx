import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';

interface ISPConfigModalProps {
  ispId: string;
  currentConfig?: {
    cfa?: number;
    sharedMemory?: boolean;
  };
  onSave: (config: { cfa: number; sharedMemory: boolean }) => void;
  onClose: () => void;
}

export const ISPConfigModal: React.FC<ISPConfigModalProps> = ({
  ispId,
  currentConfig,
  onSave,
  onClose
}) => {
  const [config, setConfig] = useState({
    cfa: currentConfig?.cfa ?? 0,
    sharedMemory: currentConfig?.sharedMemory ?? false
  });

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
      <div className="bg-gray-800 rounded-lg p-6 w-[400px]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold text-white">
              {ispId.toUpperCase()} Configuration
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CFA (Color Filter Array)
            </label>
            <select
              value={config.cfa}
              onChange={(e) => setConfig({ ...config, cfa: parseInt(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="0">0: RGGB</option>
              <option value="1">1: Not Used</option>
              <option value="2">2: Not Used</option>
              <option value="3">3: RGBIR</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Shared Memory
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sharedMemory"
                  checked={config.sharedMemory === true}
                  onChange={() => setConfig({ ...config, sharedMemory: true })}
                  className="w-4 h-4"
                />
                <span className="text-white">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sharedMemory"
                  checked={config.sharedMemory === false}
                  onChange={() => setConfig({ ...config, sharedMemory: false })}
                  className="w-4 h-4"
                />
                <span className="text-white">No</span>
              </label>
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};


