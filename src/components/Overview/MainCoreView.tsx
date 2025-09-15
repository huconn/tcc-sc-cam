import React, { useState, useRef } from 'react';
import { Camera, Wifi, Settings, ChevronDown, Cpu, Box, Monitor, AlertCircle } from 'lucide-react';
import { useCameraStore } from '@/store/cameraStore';
import { PortConfigModal } from './PortConfigModal';

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
  const [portConfigModal, setPortConfigModal] = useState<{
    show: boolean;
    portId: string;
    portType: 'input' | 'output';
    deviceName: string;
  } | null>(null);
  const [portConfigs, setPortConfigs] = useState<Record<string, any>>({});

  const deviceColors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500'];


  const handleIspChange = (isp: string, value: string) => {
    setIspSelections(prev => ({
      ...prev,
      [isp]: value
    }));
  };

  const handlePortClick = (portId: string, portType: 'input' | 'output', deviceName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPortConfigModal({
      show: true,
      portId,
      portType,
      deviceName
    });
  };

  const handlePortConfigSave = (portId: string, config: any) => {
    setPortConfigs(prev => ({
      ...prev,
      [portId]: config
    }));
  };

  return (
    <div className="w-full h-full">
      {/* Diagram Container */}
      <div ref={containerRef} className="w-full h-full bg-gray-800 rounded-lg p-6">

        {/* Main Layout Container */}
        <div className="flex gap-8">

          {/* Left side: 2x2 Grid for Devices and MIPI */}
          <div className="grid grid-cols-2 gap-4">

            {/* Row 1: Device 1 (0,0) and MIPI0 (1,0) */}
            {(viewMode === 'unified' || viewMode === 'main') && (
              <>
                {/* Device 1 at (0,0) - Vertically centered */}
                <div className="flex items-center justify-center h-[160px]">
                  <div
                    className="bg-blue-600 text-white p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors relative w-[140px] h-[80px]"
                    onClick={() => onDeviceClick('mipi0')}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Camera className="w-4 h-4" />
                    <span className="text-xs font-semibold">Device 1</span>
                  </div>
                  {/* Device type indicators */}
                  <div className="flex gap-1 mt-2 justify-center">
                    {externalDevices?.mipi0 &&
                     ((externalDevices.mipi0.devices && externalDevices.mipi0.devices.length > 0) ||
                      (Array.isArray(externalDevices.mipi0) && externalDevices.mipi0.length > 0)) ? (
                      (externalDevices.mipi0.devices || externalDevices.mipi0).map((device: any, index: number) => (
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
                  {/* Output port */}
                  <div
                    className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white cursor-pointer hover:bg-green-600 z-10"
                    onClick={(e) => handlePortClick('device1-out', 'output', 'Device 1', e)}
                    title="Output Port"
                  />
                  </div>
                </div>

                {/* MIPI0 at (1,0) */}
                <div className="bg-purple-600 text-white p-3 rounded-lg relative w-[140px] h-[160px] flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold">MIPI0</span>
                    <input
                      type="checkbox"
                      checked={mipi0Enabled}
                      onChange={(e) => setMipi0Enabled(e.target.checked)}
                      className="w-3 h-3"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-around">
                    <div className="text-xs bg-purple-700 rounded px-2 py-1 text-center">VC0</div>
                    <div className="text-xs bg-purple-700 rounded px-2 py-1 text-center">VC1</div>
                    <div className="text-xs bg-purple-700 rounded px-2 py-1 text-center">VC2</div>
                    <div className="text-xs bg-purple-700 rounded px-2 py-1 text-center">VC3</div>
                  </div>
                  {/* Input port */}
                  <div
                    className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-pointer hover:bg-blue-600 z-10"
                    onClick={(e) => handlePortClick('mipi0-in', 'input', 'MIPI0', e)}
                    title="Input Port"
                  />
                  {/* Output ports for Virtual Channels */}
                  <div className="absolute -right-2 top-0 h-full flex flex-col justify-around py-4">
                    {['VC0', 'VC1', 'VC2', 'VC3'].map((vc, index) => (
                      <div
                        key={vc}
                        className="w-3 h-3 bg-green-500 rounded-full border border-white cursor-pointer hover:bg-green-600 z-10"
                        onClick={(e) => handlePortClick(`mipi0-${vc}`, 'output', `MIPI0 ${vc}`, e)}
                        title={`${vc} Output`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Row 2: Device 2 (0,1) and MIPI1 (1,1) */}
            {(viewMode === 'unified' || viewMode === 'sub') && (
              <>
                {/* Device 2 at (0,1) - Vertically centered */}
                <div className="flex items-center justify-center h-[160px]">
                  <div
                    className="bg-blue-600 text-white p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors relative w-[140px] h-[80px]"
                    onClick={() => onDeviceClick('mipi1')}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Camera className="w-4 h-4" />
                    <span className="text-xs font-semibold">Device 2</span>
                  </div>
                  {/* Device type indicators */}
                  <div className="flex gap-1 mt-2 justify-center">
                    {externalDevices?.mipi1 &&
                     ((externalDevices.mipi1.devices && externalDevices.mipi1.devices.length > 0) ||
                      (Array.isArray(externalDevices.mipi1) && externalDevices.mipi1.length > 0)) ? (
                      (externalDevices.mipi1.devices || externalDevices.mipi1).map((device: any, index: number) => (
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
                  {/* Output port */}
                  <div
                    className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white cursor-pointer hover:bg-green-600 z-10"
                    onClick={(e) => handlePortClick('device2-out', 'output', 'Device 2', e)}
                    title="Output Port"
                  />
                  </div>
                </div>

                {/* MIPI1 at (1,1) */}
                <div className="bg-purple-600 text-white p-3 rounded-lg relative w-[140px] h-[160px] flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold">MIPI1</span>
                    <input
                      type="checkbox"
                      checked={mipi1Enabled}
                      onChange={(e) => setMipi1Enabled(e.target.checked)}
                      className="w-3 h-3"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-around">
                    <div className="text-xs bg-purple-700 rounded px-2 py-1 text-center">VC0</div>
                    <div className="text-xs bg-purple-700 rounded px-2 py-1 text-center">VC1</div>
                    <div className="text-xs bg-purple-700 rounded px-2 py-1 text-center">VC2</div>
                    <div className="text-xs bg-purple-700 rounded px-2 py-1 text-center">VC3</div>
                  </div>
                  {/* Input port */}
                  <div
                    className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-pointer hover:bg-blue-600 z-10"
                    onClick={(e) => handlePortClick('mipi1-in', 'input', 'MIPI1', e)}
                    title="Input Port"
                  />
                  {/* Output ports for Virtual Channels */}
                  <div className="absolute -right-2 top-0 h-full flex flex-col justify-around py-4">
                    {['VC0', 'VC1', 'VC2', 'VC3'].map((vc, index) => (
                      <div
                        key={vc}
                        className="w-3 h-3 bg-green-500 rounded-full border border-white cursor-pointer hover:bg-green-600 z-10"
                        onClick={(e) => handlePortClick(`mipi1-${vc}`, 'output', `MIPI1 ${vc}`, e)}
                        title={`${vc} Output`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right side: Rest of the blocks in a row */}
          <div className="flex gap-4">
            {/* ISP Column */}
            <div className="flex flex-col items-center">
              <div className="text-gray-400 text-sm mb-2 text-center w-full">Internal ISP</div>
              <div className="bg-green-600 text-white p-3 rounded-lg w-[140px] min-h-[120px]">
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
          <div className="flex flex-col items-center">
            <div className="text-gray-400 text-sm mb-2 text-center w-full">Multiplexer</div>
            <div className="bg-yellow-500 text-black p-3 rounded-lg w-[140px] min-h-[120px]">
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
          <div className="flex flex-col items-center">
            <div className="text-gray-400 text-sm mb-2 text-center w-full">SVDW_Wrap</div>
            <div className="bg-amber-600 text-white p-3 rounded-lg w-[140px] min-h-[150px]">
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
          <div className="flex flex-col items-center">
            <div className="text-gray-400 text-sm mb-2 text-center w-full">VIE_Wrap</div>
            <div className="bg-orange-600 text-white p-3 rounded-lg w-[140px] min-h-[100px]">
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
          <div className="flex flex-col items-center">
            <div className="text-gray-400 text-sm mb-2 text-center w-full">MDW_Wrap</div>
            <div className="bg-red-600 text-white p-3 rounded-lg w-[140px] min-h-[80px]">
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
        </div>

        {/* CIED - Positioned below the grid */}
        <div className="mt-6 flex justify-center">
          <div className="bg-cyan-600 text-white p-3 rounded-lg w-[140px] h-[60px] flex flex-col items-center justify-center">
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

      {/* Port Configuration Modal */}
      {portConfigModal?.show && (
        <PortConfigModal
          portId={portConfigModal.portId}
          portType={portConfigModal.portType}
          deviceName={portConfigModal.deviceName}
          currentConfig={portConfigs[portConfigModal.portId]}
          onSave={(config) => {
            handlePortConfigSave(portConfigModal.portId, config);
            setPortConfigModal(null);
          }}
          onClose={() => setPortConfigModal(null)}
        />
      )}
    </div>
  );
};
