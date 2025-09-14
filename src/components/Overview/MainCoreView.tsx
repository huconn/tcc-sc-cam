import React, { useState, useRef } from 'react';
import { Camera, Wifi, Settings, ChevronDown } from 'lucide-react';
import { ConnectionLines, ConnectionPoint } from './ConnectionLines';

interface MainCoreViewProps {
  selectedDevices: {
    mipi0: string[];
    mipi1: string[];
  };
  onDeviceClick: (mipi: 'mipi0' | 'mipi1') => void;
}

export const MainCoreView: React.FC<MainCoreViewProps> = ({ 
  selectedDevices, 
  onDeviceClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mipi0Enabled, setMipi0Enabled] = useState(true);
  const [mipi1Enabled, setMipi1Enabled] = useState(false);
  const [ispSelections, setIspSelections] = useState({
    isp0: 'ISP0',
    isp1: 'ISP1', 
    isp2: 'ISP2',
    isp3: 'ISP3'
  });

  const deviceColors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500'];

  // 연결선 정의
  const connections = [
    { from: 'external-devices-mipi0', to: 'mipi0', color: '#3b82f6', strokeWidth: 3 },
    { from: 'mipi0', to: 'camera-mux', color: '#8b5cf6', strokeWidth: 3 },
    { from: 'camera-mux', to: 'svdw', color: '#eab308', strokeWidth: 3 },
  ];

  const handleIspChange = (isp: string, value: string) => {
    setIspSelections(prev => ({
      ...prev,
      [isp]: value
    }));
  };

  return (
    <div className="w-full h-full">
      {/* Main Core View Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Main Core View</h2>
        <p className="text-gray-400">Primary camera processing path with ISP and SVDW</p>
      </div>

      {/* Diagram Container */}
      <div ref={containerRef} className="relative w-full h-full min-h-[600px] bg-gray-800 rounded-lg p-8">
        
        {/* External Devices - MIPI0 */}
        <ConnectionPoint id="external-devices-mipi0" position="right">
          <div className="absolute left-8 top-16">
            <div 
              className="bg-blue-600 text-white p-4 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
              onClick={() => onDeviceClick('mipi0')}
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
                    selectedDevices.mipi0.includes(`device${index}`) 
                      ? 'ring-2 ring-white' 
                      : 'opacity-50'
                  }`}
                />
              ))}
            </div>
            </div>
          </div>
        </ConnectionPoint>

        {/* MIPI0 Block */}
        <ConnectionPoint id="mipi0" position="right">
          <div className="absolute left-48 top-16">
            <div className="bg-purple-600 text-white p-4 rounded-lg w-32">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">MIPI0</span>
              <input
                type="checkbox"
                checked={mipi0Enabled}
                onChange={(e) => setMipi0Enabled(e.target.checked)}
                className="w-4 h-4"
              />
            </div>
            <div className="text-xs mb-2">I2C12</div>
            <div className="space-y-1">
              {['ISP0', 'ISP1', 'ISP2', 'ISP3'].map((isp, index) => (
                <div key={isp} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <select
                    value={ispSelections[`isp${index}` as keyof typeof ispSelections]}
                    onChange={(e) => handleIspChange(`isp${index}` as keyof typeof ispSelections, e.target.value)}
                    className="bg-purple-700 text-white text-xs px-1 py-0.5 rounded border-0"
                  >
                    <option value="ISP0">ISP0</option>
                    <option value="ISP1">ISP1</option>
                    <option value="ISP2">ISP2</option>
                    <option value="ISP3">ISP3</option>
                    <option value="Bypass">Bypass</option>
                  </select>
                </div>
              ))}
            </div>
            </div>
          </div>
        </ConnectionPoint>

        {/* IR Blocks */}
        <div className="absolute left-80 top-24">
          <div className="bg-orange-500 text-white p-2 rounded text-xs">IR0</div>
        </div>
        <div className="absolute left-80 top-40">
          <div className="bg-orange-500 text-white p-2 rounded text-xs">IR1</div>
        </div>

        {/* Camera Mux */}
        <ConnectionPoint id="camera-mux" position="right">
          <div className="absolute left-96 top-16">
            <div className="bg-yellow-500 text-black p-4 rounded-lg w-40">
            <div className="font-semibold mb-2">Camera Mux</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="bg-yellow-400 p-1 rounded text-center">
                  CAM CH{i}
                </div>
              ))}
            </div>
            </div>
          </div>
        </ConnectionPoint>

        {/* SVDW */}
        <ConnectionPoint id="svdw" position="left">
          <div className="absolute right-32 top-16">
            <div className="bg-yellow-600 text-white p-4 rounded-lg w-32">
            <div className="font-semibold mb-2">SVDW</div>
            <div className="space-y-1">
              {['Grabber0', 'Grabber1', 'Grabber2', 'Grabber3'].map((grabber, index) => (
                <div key={grabber} className="text-xs bg-yellow-700 p-1 rounded text-center">
                  {grabber}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs bg-yellow-700 p-1 rounded text-center">
              Blender
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
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>External Device (Selected)</span>
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
              <div className="w-3 h-3 bg-yellow-600 rounded"></div>
              <span>SVDW (Smart Video Display Window)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
