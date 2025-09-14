import React, { useState, useRef } from 'react';
import { Camera, Wifi, Settings, ChevronDown } from 'lucide-react';
import { ConnectionLines, ConnectionPoint } from './ConnectionLines';

interface SubCoreViewProps {
  selectedDevices: {
    mipi0: string[];
    mipi1: string[];
  };
  onDeviceClick: (mipi: 'mipi0' | 'mipi1') => void;
}

export const SubCoreView: React.FC<SubCoreViewProps> = ({ 
  selectedDevices, 
  onDeviceClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mipi0Enabled, setMipi0Enabled] = useState(false);
  const [mipi1Enabled, setMipi1Enabled] = useState(true);

  const deviceColors = ['bg-gray-400', 'bg-gray-400', 'bg-gray-400', 'bg-gray-400'];

  // 연결선 정의
  const connections = [
    { from: 'external-devices-mipi1', to: 'mipi1', color: '#9ca3af', strokeWidth: 3 },
    { from: 'mipi1', to: 'camera-mux-sub', color: '#8b5cf6', strokeWidth: 3 },
    { from: 'camera-mux-sub', to: 'output-modules', color: '#eab308', strokeWidth: 3 },
    { from: 'camera-mux-sub', to: 'cied', color: '#16a34a', strokeWidth: 2 },
  ];

  return (
    <div className="w-full h-full">
      {/* Sub Core View Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Sub Core View</h2>
        <p className="text-gray-400">Secondary camera processing path with bypass and auxiliary outputs</p>
      </div>

      {/* Diagram Container */}
      <div ref={containerRef} className="relative w-full h-full min-h-[600px] bg-gray-800 rounded-lg p-8">
        
        {/* External Devices - MIPI1 */}
        <ConnectionPoint id="external-devices-mipi1" position="right">
          <div className="absolute left-8 top-16">
            <div 
              className="bg-blue-600 text-white p-4 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
              onClick={() => onDeviceClick('mipi1')}
            >
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-5 h-5" />
              <span className="font-semibold">External Devices</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {deviceColors.map((color, index) => (
                <div 
                  key={index}
                  className={`w-8 h-8 rounded ${color} ${
                    selectedDevices.mipi1.includes(`device${index}`) 
                      ? 'ring-2 ring-white' 
                      : 'opacity-50'
                  }`}
                />
              ))}
            </div>
            </div>
          </div>
        </ConnectionPoint>

        {/* MIPI1 Block */}
        <ConnectionPoint id="mipi1" position="right">
          <div className="absolute left-48 top-16">
            <div className="bg-purple-600 text-white p-4 rounded-lg w-32">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">MIPI1</span>
              <input
                type="checkbox"
                checked={mipi1Enabled}
                onChange={(e) => setMipi1Enabled(e.target.checked)}
                className="w-4 h-4"
              />
            </div>
            <div className="text-xs mb-2">I2C13</div>
            <div className="space-y-1">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-xs">Bypass</span>
                </div>
              ))}
            </div>
            </div>
          </div>
        </ConnectionPoint>

        {/* Camera Mux */}
        <ConnectionPoint id="camera-mux-sub" position="right">
          <div className="absolute left-96 top-16">
            <div className="bg-yellow-500 text-black p-4 rounded-lg w-40">
              <div className="font-semibold mb-2">Camera Mux</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className={`p-1 rounded text-center ${
                    i >= 4 ? 'bg-yellow-400' : 'bg-gray-300'
                  }`}>
                    CAM CH{i}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ConnectionPoint>

        {/* Output Modules */}
        <ConnectionPoint id="output-modules" position="left">
          <div className="absolute right-32 top-16">
            <div className="space-y-4">
            {/* VWDMA0 */}
            <div className="bg-green-500 text-white p-3 rounded-lg w-24">
              <div className="font-semibold text-sm mb-1">VWDMA0</div>
              <div className="text-xs">IR</div>
            </div>

            {/* VWDMA1 */}
            <div className="bg-green-500 text-white p-3 rounded-lg w-24">
              <div className="font-semibold text-sm mb-1">VWDMA1</div>
              <div className="text-xs">IR</div>
            </div>

            {/* VIN0 */}
            <div className="bg-blue-500 text-white p-3 rounded-lg w-24">
              <div className="font-semibold text-sm">VIN0</div>
            </div>

            {/* VIN1 */}
            <div className="bg-blue-500 text-white p-3 rounded-lg w-24">
              <div className="font-semibold text-sm">VIN1</div>
            </div>

            {/* MDW */}
            <div className="bg-purple-500 text-white p-3 rounded-lg w-24">
              <div className="font-semibold text-sm">MDW</div>
            </div>
            </div>
          </div>
        </ConnectionPoint>

        {/* CIED */}
        <ConnectionPoint id="cied" position="left">
          <div className="absolute right-32 bottom-16">
            <div className="bg-green-600 text-white p-4 rounded-lg">
            <div className="font-semibold mb-2">CIED</div>
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="bg-green-700 w-6 h-6 rounded text-xs flex items-center justify-center">
                  {i}
                </div>
              ))}
            </div>
            </div>
          </div>
        </ConnectionPoint>

        {/* Dynamic Connection Lines */}
        <ConnectionLines connections={connections} containerRef={containerRef} />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-700 p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Legend</h3>
          <div className="space-y-1 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>External Device (Unselected)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded"></div>
              <span>MIPI Interface</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Camera Mux</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>VWDMA (Video Write DMA)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>VIN (Video Input)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span>CIED (Camera Input Event Detector)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
