import React, { useState } from 'react';
import { X, GitBranch } from 'lucide-react';

interface CameraMuxConfigModalProps {
  currentConfig?: {
    mappings: Record<number, number>; // output channel -> input channel
  };
  onSave: (config: { mappings: Record<number, number> }) => void;
  onClose: () => void;
}

export const CameraMuxConfigModal: React.FC<CameraMuxConfigModalProps> = ({
  currentConfig,
  onSave,
  onClose
}) => {
  // Initialize with default 1:1 mapping or current config
  const [mappings, setMappings] = useState<Record<number, number>>(
    currentConfig?.mappings || {
      0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7
    }
  );

  // Channel colors - vibrant and distinguishable
  const channelColors = [
    { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-500' },
    { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-500' },
    { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-500' },
    { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-500' },
    { bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-500' },
    { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-500' },
    { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-500' },
    { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-500' }
  ];

  const handleMappingChange = (outputChannel: number, inputChannel: number) => {
    setMappings(prev => ({
      ...prev,
      [outputChannel]: inputChannel
    }));
  };

  const handleSave = () => {
    onSave({ mappings });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
      <div className="bg-gray-800 rounded-lg p-6 w-[900px] max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-white">Camera Mux Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mux Diagram */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-8">
            {/* Input Channels */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Input Channels (from ISP/Bypass)</h3>
              <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5, 6, 7].map(ch => (
                  <div key={ch} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold ${channelColors[ch].bg}`}>
                      {ch}
                    </div>
                    <span className="text-sm text-gray-300">CAM CH{ch}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mux Box */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="bg-gray-700 border-2 border-yellow-600 rounded-lg p-4 w-full">
                <div className="text-center font-semibold text-yellow-400 mb-4">CAMERA MUX</div>

                {/* Visual Connection Representation */}
                <div className="relative h-[300px]">
                  <svg className="absolute inset-0 w-full h-full">
                    {Object.entries(mappings).map(([output, input]) => {
                      const outputNum = parseInt(output);
                      const inputNum = parseInt(input);
                      const startY = 20 + (inputNum * 35);
                      const endY = 20 + (outputNum * 35);

                      return (
                        <line
                          key={`line-${output}`}
                          x1="20"
                          y1={startY}
                          x2="180"
                          y2={endY}
                          stroke={`rgb(${getColorRGB(channelColors[inputNum].bg)})`}
                          strokeWidth="3"
                          opacity="0.7"
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* Output Channels */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Output Channels (to SVDW/VIN)</h3>
              <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5, 6, 7].map(ch => {
                  const inputCh = mappings[ch];
                  return (
                    <div key={ch} className="flex items-center gap-3">
                      <span className="text-sm text-gray-300 w-20">MUX CH{ch}</span>
                      <select
                        value={inputCh}
                        onChange={(e) => handleMappingChange(ch, parseInt(e.target.value))}
                        className={`bg-gray-700 border-2 ${channelColors[inputCh].border} rounded px-3 py-1 text-white text-sm min-w-[100px]`}
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(input => (
                          <option key={input} value={input}>
                            CAM CH{input}
                          </option>
                        ))}
                      </select>
                      <div className={`w-6 h-6 rounded ${channelColors[inputCh].bg}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* DMA Component Reference */}
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">DMA Component cam-ch Reference</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">SVDW#0:</span>
              <span className="text-white ml-2">CH{mappings[0]}</span>
            </div>
            <div>
              <span className="text-gray-400">SVDW#1:</span>
              <span className="text-white ml-2">CH{mappings[1]}</span>
            </div>
            <div>
              <span className="text-gray-400">SVDW#2:</span>
              <span className="text-white ml-2">CH{mappings[2]}</span>
            </div>
            <div>
              <span className="text-gray-400">SVDW#3:</span>
              <span className="text-white ml-2">CH{mappings[3]}</span>
            </div>
            <div>
              <span className="text-gray-400">VWDMA#0:</span>
              <span className="text-white ml-2">CH{mappings[4]}</span>
            </div>
            <div>
              <span className="text-gray-400">VWDMA#1:</span>
              <span className="text-white ml-2">CH{mappings[5]}</span>
            </div>
            <div>
              <span className="text-gray-400">VIN#0:</span>
              <span className="text-white ml-2">CH{mappings[6]}</span>
            </div>
            <div>
              <span className="text-gray-400">VIN#1:</span>
              <span className="text-white ml-2">CH{mappings[7]}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to extract RGB values from Tailwind color class
function getColorRGB(colorClass: string): string {
  const colorMap: Record<string, string> = {
    'bg-red-500': '239, 68, 68',
    'bg-orange-500': '249, 115, 22',
    'bg-yellow-500': '234, 179, 8',
    'bg-green-500': '34, 197, 94',
    'bg-cyan-500': '6, 182, 212',
    'bg-blue-500': '59, 130, 246',
    'bg-indigo-500': '99, 102, 241',
    'bg-purple-500': '168, 85, 247'
  };
  return colorMap[colorClass] || '156, 163, 175';
}
