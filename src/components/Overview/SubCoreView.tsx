import React, { useState, useRef } from 'react';
import { Camera, Wifi, Settings, ChevronDown, Cpu, Box, Monitor, AlertCircle } from 'lucide-react';

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
  const [ispSelections, setIspSelections] = useState({
    isp0: 'ISP0',
    isp1: 'ISP1',
    isp2: 'ISP2',
    isp3: 'ISP3'
  });

  const deviceColors = ['bg-gray-400', 'bg-gray-400', 'bg-gray-400', 'bg-gray-400'];


  return (
    <div className="w-full h-full">
      {/* Sub Core View Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Sub Core View</h2>
        <p className="text-gray-400">Secondary camera processing path with bypass and auxiliary outputs</p>
      </div>

      {/* Diagram Container */}
      <div ref={containerRef} className="w-full bg-gray-800 rounded-lg p-6">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 relative">

          {/* External Devices Column */}
          <div className="flex flex-col">
            <div className="text-gray-400 text-sm mb-2 text-center">External Devices</div>
            <div className="space-y-3">
              {/* External Device 1 */}
              <div
                className="bg-blue-600 text-white p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => onDeviceClick('mipi0')}
              >
                <div className="flex items-center gap-2 justify-center">
                  <Camera className="w-4 h-4" />
                  <span className="text-xs font-semibold">Device 1</span>
                </div>
              </div>

              {/* External Device 2 */}
              <div
                className="bg-blue-600 text-white p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => onDeviceClick('mipi1')}
              >
                <div className="flex items-center gap-2 justify-center">
                  <Camera className="w-4 h-4" />
                  <span className="text-xs font-semibold">Device 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* MIPI Column */}
          <div className="flex flex-col">
            <div className="text-gray-400 text-sm mb-2 text-center">MIPI CSI</div>
            <div className="space-y-3">
              {/* MIPI0 Block */}
              <div className="bg-purple-600 text-white p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">MIPI0</span>
                  <input
                    type="checkbox"
                    checked={mipi0Enabled}
                    onChange={(e) => setMipi0Enabled(e.target.checked)}
                    className="w-3 h-3"
                  />
                </div>
                <div className="text-xs text-center">CH0-CH3</div>
              </div>

              {/* MIPI1 Block */}
              <div className="bg-purple-600 text-white p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">MIPI1</span>
                  <input
                    type="checkbox"
                    checked={mipi1Enabled}
                    onChange={(e) => setMipi1Enabled(e.target.checked)}
                    className="w-3 h-3"
                  />
                </div>
                <div className="text-xs text-center">CH0-CH3</div>
              </div>
            </div>
          </div>

          {/* ISP Column */}
          <div className="flex flex-col">
            <div className="text-gray-400 text-sm mb-2 text-center">Internal ISP</div>
            <div className="bg-green-600 text-white p-3 rounded-lg">
              <div className="flex items-center gap-1 mb-2 justify-center">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-semibold">ISP</span>
              </div>
              <div className="grid grid-cols-2 gap-1 mb-2">
                <div className="bg-green-700 p-1 rounded text-xs text-center">ISP0</div>
                <div className="bg-green-700 p-1 rounded text-xs text-center">ISP1</div>
                <div className="bg-green-700 p-1 rounded text-xs text-center">ISP2</div>
                <div className="bg-green-700 p-1 rounded text-xs text-center">ISP3</div>
              </div>
              <div className="space-y-1">
                <div className="bg-orange-500 text-white p-1 rounded text-xs text-center">D8 IR</div>
                <div className="bg-orange-500 text-white p-1 rounded text-xs text-center">D9 IR</div>
              </div>
            </div>
          </div>

          {/* Camera Mux */}
          <div className="flex flex-col">
            <div className="text-gray-400 text-sm mb-2 text-center">Multiplexer</div>
            <div className="bg-yellow-500 text-black p-3 rounded-lg">
              <div className="text-xs font-semibold mb-2 text-center">Camera Mux</div>
              <div className="grid grid-cols-2 gap-1">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="bg-yellow-400 p-1 rounded text-xs text-center">
                    CH{i}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SVDW */}
          <div className="flex flex-col">
            <div className="text-gray-400 text-sm mb-2 text-center">SVDW_Wrap</div>
            <div className="bg-amber-600 text-white p-3 rounded-lg">
              <div className="text-xs font-semibold mb-2 text-center">SVDW</div>
              <div className="space-y-1">
                {['SVDW0', 'SVDW1', 'SVDW2', 'SVDW3'].map((svdw) => (
                  <div key={svdw} className="text-xs bg-amber-700 p-1 rounded text-center">
                    {svdw}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs bg-amber-800 p-1 rounded text-center font-semibold">
                Blender
              </div>
            </div>
          </div>

          {/* VIE Wrap */}
          <div className="flex flex-col">
            <div className="text-gray-400 text-sm mb-2 text-center">VIE_Wrap</div>
            <div className="bg-orange-600 text-white p-3 rounded-lg">
              <div className="text-xs font-semibold mb-2 text-center">VIE</div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-xs bg-orange-700 p-1 rounded text-center">VWDMA0</div>
                <div className="text-xs bg-orange-700 p-1 rounded text-center">VWDMA1</div>
                <div className="text-xs bg-orange-700 p-1 rounded text-center">VIN0</div>
                <div className="text-xs bg-orange-700 p-1 rounded text-center">VIN1</div>
              </div>
            </div>
          </div>

          {/* MDW */}
          <div className="flex flex-col">
            <div className="text-gray-400 text-sm mb-2 text-center">MDW_Wrap</div>
            <div className="bg-red-600 text-white p-3 rounded-lg">
              <div className="flex items-center gap-1 mb-2 justify-center">
                <Monitor className="w-3 h-3" />
                <span className="text-xs font-semibold">MDW</span>
              </div>
              <div className="text-xs bg-red-700 p-1 rounded text-center">
                MDW0
              </div>
            </div>
          </div>
        </div>

        {/* CIED - Positioned below the grid */}
        <div className="mt-6 flex justify-center">
          <div className="bg-cyan-600 text-white p-3 rounded-lg inline-block">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">CIED</span>
            </div>
            <div className="text-xs mt-1 text-center">Error Detection</div>
          </div>
        </div>


        {/* Legend */}
        <div className="mt-6 bg-gray-700 p-3 rounded-lg">
          <h3 className="text-white text-sm font-semibold mb-2">Processing Flow</h3>
          <div className="flex flex-wrap gap-4 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-blue-500"></div>
              <span>External → MIPI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-purple-500"></div>
              <span>MIPI → ISP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-green-500"></div>
              <span>ISP → Mux</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-yellow-500"></div>
              <span>Mux → SVDW</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-red-500"></div>
              <span>SVDW → Output</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
