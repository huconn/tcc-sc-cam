import React, { useState, useRef } from 'react';
import { Camera, Wifi, Settings, ChevronDown, Cpu, Box, Monitor, AlertCircle } from 'lucide-react';
import { useCameraStore } from '@/store/cameraStore';

interface MainCoreViewProps {
  selectedDevices: {
    mipi0: string[];
    mipi1: string[];
  };
  externalDevices?: {
    mipi0: any[];
    mipi1: any[];
  };
  onDeviceClick: (mipi: 'mipi0' | 'mipi1') => void;
}

// Device type colors mapping
const deviceTypeColors: Record<string, string> = {
  sensor: 'bg-orange-500',
  serializer: 'bg-blue-500',
  deserializer: 'bg-purple-500',
  converter: 'bg-yellow-500',
  soc: 'bg-red-500'
};

export const MainCoreView: React.FC<MainCoreViewProps> = ({
  selectedDevices,
  externalDevices,
  onDeviceClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewMode = useCameraStore(state => state.viewMode);
  const [mipi0Enabled, setMipi0Enabled] = useState(true);
  const [mipi1Enabled, setMipi1Enabled] = useState(false);
  const [ispSelections, setIspSelections] = useState({
    isp0: 'ISP0',
    isp1: 'ISP1', 
    isp2: 'ISP2',
    isp3: 'ISP3'
  });

  const deviceColors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500'];


  const handleIspChange = (isp: string, value: string) => {
    setIspSelections(prev => ({
      ...prev,
      [isp]: value
    }));
  };

  return (
    <div className="w-full h-full">
      {/* System Overview Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          {viewMode === 'unified' ? 'Unified View' : viewMode === 'main' ? 'Main Core View' : 'Sub Core View'}
        </h2>
        <p className="text-gray-400">
          {viewMode === 'unified' ? 'Complete camera system overview' :
           viewMode === 'main' ? 'Primary camera processing path' :
           'Secondary camera processing path'}
        </p>
      </div>

      {/* Diagram Container */}
      <div ref={containerRef} className="w-full bg-gray-800 rounded-lg p-6">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 relative">

          {/* External Devices Column */}
          <div className="flex flex-col">
            <div className="text-gray-400 text-sm mb-2 text-center">External Devices</div>
            <div className="space-y-3">
              {/* External Device 1 - Show in unified and main */}
              {(viewMode === 'unified' || viewMode === 'main') && (
                <div
                  className="bg-blue-600 text-white p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors relative"
                  onClick={() => onDeviceClick('mipi0')}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Camera className="w-4 h-4" />
                    <span className="text-xs font-semibold">Device 1</span>
                  </div>
                  {/* Device type indicators */}
                  <div className="flex gap-1 mt-2 justify-center">
                    {externalDevices?.mipi0 && externalDevices.mipi0.length > 0 ? (
                      externalDevices.mipi0.map((device, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-sm ${deviceTypeColors[device.type] || 'bg-gray-500'}`}
                          title={`${device.name} - ${device.model}`}
                        />
                      ))
                    ) : (
                      // Show 3 black squares when no devices are configured
                      Array.from({ length: 3 }, (_, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-sm bg-gray-900"
                          title="No device configured"
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* External Device 2 - Show in unified and sub */}
              {(viewMode === 'unified' || viewMode === 'sub') && (
                <div
                  className="bg-blue-600 text-white p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors relative"
                  onClick={() => onDeviceClick('mipi1')}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Camera className="w-4 h-4" />
                    <span className="text-xs font-semibold">Device 2</span>
                  </div>
                  {/* Device type indicators */}
                  <div className="flex gap-1 mt-2 justify-center">
                    {externalDevices?.mipi1 && externalDevices.mipi1.length > 0 ? (
                      externalDevices.mipi1.map((device, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-sm ${deviceTypeColors[device.type] || 'bg-gray-500'}`}
                          title={`${device.name} - ${device.model}`}
                        />
                      ))
                    ) : (
                      // Show 3 black squares when no devices are configured
                      Array.from({ length: 3 }, (_, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-sm bg-gray-900"
                          title="No device configured"
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MIPI Column */}
          <div className="flex flex-col">
            <div className="text-gray-400 text-sm mb-2 text-center">MIPI CSI</div>
            <div className="space-y-3">
              {/* MIPI0 Block - Show in unified and main */}
              {(viewMode === 'unified' || viewMode === 'main') && (
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
                  <div className="text-xs text-center">VC0-VC3</div>
                </div>
              )}

              {/* MIPI1 Block - Show in unified and sub */}
              {(viewMode === 'unified' || viewMode === 'sub') && (
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
                  <div className="text-xs text-center">VC0-VC3</div>
                </div>
              )}
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
                {viewMode === 'unified' ? (
                  <>
                    <div className="bg-green-700 p-1 rounded text-xs text-center">ISP0</div>
                    <div className="bg-green-700 p-1 rounded text-xs text-center">ISP1</div>
                    <div className="bg-green-700 p-1 rounded text-xs text-center">ISP2</div>
                    <div className="bg-green-700 p-1 rounded text-xs text-center">ISP3</div>
                  </>
                ) : viewMode === 'main' ? (
                  <>
                    <div className="bg-green-700 p-1 rounded text-xs text-center">ISP0</div>
                    <div className="bg-green-700 p-1 rounded text-xs text-center">ISP1</div>
                  </>
                ) : (
                  <>
                    <div className="bg-green-700 p-1 rounded text-xs text-center">ISP2</div>
                    <div className="bg-green-700 p-1 rounded text-xs text-center">ISP3</div>
                  </>
                )}
              </div>
              {(viewMode === 'unified' || viewMode === 'main') && (
                <div className="space-y-1">
                  <div className="bg-orange-500 text-white p-1 rounded text-xs text-center">D8 IR</div>
                  <div className="bg-orange-500 text-white p-1 rounded text-xs text-center">D9 IR</div>
                </div>
              )}
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
