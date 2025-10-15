import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';
import { getChannelBgClass, getChannelHex } from '@/utils/channelPalette';
import { useCameraStore } from '@/store/cameraStore';

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
  const debugShowLayoutBorders = useCameraStore((s: any) => s.debugShowLayoutBorders ?? false);
  
  // Initialize with default 1:1 mapping or current config
  const [mappings, setMappings] = useState<Record<number, number>>(
    currentConfig?.mappings || {
      0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7
    }
  );

  // Input channel labels: 0-7 maps to MIPI0-0~3, MIPI1-0~3
  const getInputLabel = (ch: number): string => {
    if (ch <= 3) return `MIPI0-${ch}`;
    return `MIPI1-${ch - 4}`;
  };

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
      <div className={`bg-gray-800 rounded-lg p-6 w-[700px] max-h-[80vh] overflow-auto relative ${debugShowLayoutBorders ? 'debug' : ''}`}>
        {debugShowLayoutBorders && (
          <span className="absolute -top-3 -left-3 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded z-10">MUX-CONFIG-MODAL</span>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-white">Camera Mux Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Layout: Input - Mux (Combobox) - Output as Table */}
        <div className={`bg-gray-900 rounded-lg p-4 mb-4 relative ${debugShowLayoutBorders ? 'debug' : ''}`}>
          {debugShowLayoutBorders && (
            <span className="absolute -top-3 -left-3 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded z-10">TABLE-CONTAINER</span>
          )}
          
          <table className="w-full">
            <thead>
              <tr>
                <th className={`text-sm font-bold text-white py-3 px-2 text-center relative border-b-2 border-gray-600 ${debugShowLayoutBorders ? 'debug-cyan' : ''}`}>
                  {debugShowLayoutBorders && (
                    <span className="absolute -top-2 -left-2 bg-cyan-600 text-white text-[9px] px-1 py-0.5 rounded z-10">TH-INPUT</span>
                  )}
                  INPUT CHANNEL
                </th>
                <th className={`text-sm font-bold text-white py-3 px-2 text-center relative border-b-2 border-gray-600 ${debugShowLayoutBorders ? 'debug-yellow' : ''}`}>
                  {debugShowLayoutBorders && (
                    <span className="absolute -top-2 -left-2 bg-yellow-600 text-white text-[9px] px-1 py-0.5 rounded z-10">TH-MUX</span>
                  )}
                  MUX MIPI
                </th>
                <th className={`text-sm font-bold text-white py-3 px-2 text-center relative border-b-2 border-gray-600 w-12`}>
                  {/* Arrow column header - empty */}
                </th>
                <th className={`text-sm font-bold text-white py-3 px-2 text-center relative border-b-2 border-gray-600 ${debugShowLayoutBorders ? 'debug-green' : ''}`}>
                  {debugShowLayoutBorders && (
                    <span className="absolute -top-2 -left-2 bg-green-600 text-white text-[9px] px-1 py-0.5 rounded z-10">TH-OUTPUT</span>
                  )}
                  OUTPUT CHANNEL
                </th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(ch => {
                const inputCh = mappings[ch];
                return (
                  <tr key={ch}>
                    {/* Input Channel */}
                    <td className={`py-1.5 relative ${debugShowLayoutBorders ? 'debug-cyan' : ''}`}>
                      {debugShowLayoutBorders && (
                        <span className="absolute top-0 left-0 bg-cyan-500 text-white text-[8px] px-0.5 rounded z-10">IN-{ch}</span>
                      )}
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-300 w-16 text-center">{getInputLabel(ch)}</span>
                        <div 
                          className={`w-12 h-10 rounded flex items-center justify-center text-black font-bold text-sm ${getChannelBgClass(ch)}`}
                          style={{ backgroundColor: getChannelHex(ch) }}
                        >
                          CH{ch}
                        </div>
                      </div>
                    </td>
                    
                    {/* Mux Mipi Combobox */}
                    <td className={`py-1.5 px-2 relative text-center ${debugShowLayoutBorders ? 'debug-yellow' : ''}`}>
                      {debugShowLayoutBorders && (
                        <span className="absolute top-0 left-0 bg-yellow-500 text-white text-[8px] px-0.5 rounded z-10">MUX-{ch}</span>
                      )}
                      <div className="flex items-center justify-center">
                        <select
                          value={inputCh}
                          onChange={(e) => handleMappingChange(ch, parseInt(e.target.value))}
                          className="bg-gray-700 border-2 rounded px-3 py-2 text-white text-base font-semibold focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ borderColor: getChannelHex(inputCh), width: 'auto', minWidth: '120px' }}
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7].map(input => (
                            <option key={input} value={input} className="font-semibold">
                              {getInputLabel(input)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    
                    {/* Arrow */}
                    <td className="py-1.5 px-1 text-center">
                      <span className="text-white text-xl font-bold">→</span>
                    </td>
                    
                    {/* Output Channel */}
                    <td className={`py-1.5 relative ${debugShowLayoutBorders ? 'debug-green' : ''}`}>
                      {debugShowLayoutBorders && (
                        <span className="absolute top-0 left-0 bg-green-500 text-white text-[8px] px-0.5 rounded z-10">OUT-{ch}</span>
                      )}
                      <div className="flex items-center justify-center gap-2">
                        <div 
                          className={`w-12 h-10 rounded flex items-center justify-center text-black font-bold text-sm ${getChannelBgClass(inputCh)}`}
                          style={{ backgroundColor: getChannelHex(inputCh) }}
                        >
                          CH{inputCh}
                        </div>
                        <span className="text-sm text-gray-300 w-16 text-center">CAM CH{ch}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors min-w-[80px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors min-w-[80px]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
