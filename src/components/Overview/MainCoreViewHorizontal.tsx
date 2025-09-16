import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Monitor, 
  AlertCircle, 
  MoreHorizontal,
  Zap,
  Cpu,
  Network,
  Settings,
  Eye,
  Layers,
  Activity,
  Wifi,
  HardDrive,
  Video,
  Image,
  Filter,
  ArrowRight,
  ArrowDown,
  Circle,
  Square,
  Triangle,
  Hexagon
} from 'lucide-react';
import { useCameraStore } from '@/store/cameraStore';
import { ISPConfigModal } from './ISPConfigModal';
import { MIPIChannelConfigModal } from './MIPIChannelConfigModal';
import { CameraMuxConfigModal } from './CameraMuxConfigModal';
import { SVDWBlock } from '@/components/SVDW/SVDWBlock';
import { VideoOutputsSection } from '@/components/VideoPipeline/VideoOutputsSection';
import { CIEDBar } from '@/components/CIED/CIEDBar';

interface MainCoreViewHorizontalProps {
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

type ChannelMode = 'isp0' | 'isp1' | 'isp2' | 'isp3' | 'bypass';

interface ISPConfig {
  cfa: number;
  sharedMemory: boolean;
}

export const MainCoreViewHorizontal: React.FC<MainCoreViewHorizontalProps> = ({
  selectedDevices,
  externalDevices,
  onDeviceClick
}) => {
  const viewMode = useCameraStore(state => state.viewMode);
  const rightColRef = useRef<HTMLDivElement>(null);
  const [ciedTopOffset, setCiedTopOffset] = useState<number>(0);
  const ciedRef = useRef<HTMLDivElement>(null);
  const [paddingBottom, setPaddingBottom] = useState<number>(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateOnce = () => {
      const h = rightColRef.current?.getBoundingClientRect().height || 0;
      const top = h + 8;
      setCiedTopOffset(top);
      const legendH = legendRef.current?.getBoundingClientRect().height || 80;
      setPaddingBottom(legendH + 8);
    };
    const update = () => requestAnimationFrame(updateOnce);
    update();
    const ro = new ResizeObserver(update);
    if (rightColRef.current) ro.observe(rightColRef.current);
    if (legendRef.current) ro.observe(legendRef.current as Element);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  // Channel configurations for each MIPI
  const [mipi0Channels, setMipi0Channels] = useState<ChannelMode[]>(['isp0', 'bypass', 'isp2', 'bypass']);
  const [mipi1Channels, setMipi1Channels] = useState<ChannelMode[]>(['bypass', 'isp1', 'bypass', 'isp3']);

  // ISP configurations
  const [ispConfigs, setIspConfigs] = useState<Record<string, ISPConfig>>({
    isp0: { cfa: 0, sharedMemory: false },
    isp1: { cfa: 0, sharedMemory: false },
    isp2: { cfa: 0, sharedMemory: false },
    isp3: { cfa: 0, sharedMemory: false }
  });

  const [showISPConfig, setShowISPConfig] = useState<string | null>(null);
  const [showMIPIConfig, setShowMIPIConfig] = useState<{
    mipi: string;
    channel: number;
  } | null>(null);
  const [mipiChannelConfigs, setMipiChannelConfigs] = useState<Record<string, any>>({});
  const [showCameraMuxConfig, setShowCameraMuxConfig] = useState(false);
  const [cameraMuxConfig, setCameraMuxConfig] = useState<{ mappings: Record<number, number> }>({
    mappings: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 }
  });

  // Channel colors - more vibrant and visible
  const channelColors = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f97316', // orange-500
    '#eab308', // yellow-500
    '#a855f7', // purple-500
    '#06b6d4', // cyan-500
    '#ec4899', // pink-500
    '#ef4444', // red-500
  ];

  const channelColorClasses = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-cyan-500',
    'bg-pink-500',
    'bg-red-500',
  ];

  // Handle channel mode change
  const handleChannelChange = (mipi: 'mipi0' | 'mipi1', channelIndex: number, mode: ChannelMode) => {
    if (mipi === 'mipi0') {
      const newChannels = [...mipi0Channels];

      // If switching to an ISP that's already used by mipi1, force mipi1 to bypass
      if (mode.startsWith('isp') && mipi1Channels[channelIndex] === mode) {
        const newMipi1Channels = [...mipi1Channels];
        newMipi1Channels[channelIndex] = 'bypass';
        setMipi1Channels(newMipi1Channels);
      }

      newChannels[channelIndex] = mode;
      setMipi0Channels(newChannels);
    } else {
      const newChannels = [...mipi1Channels];

      // If switching to an ISP that's already used by mipi0, force mipi0 to bypass
      if (mode.startsWith('isp') && mipi0Channels[channelIndex] === mode) {
        const newMipi0Channels = [...mipi0Channels];
        newMipi0Channels[channelIndex] = 'bypass';
        setMipi0Channels(newMipi0Channels);
      }

      newChannels[channelIndex] = mode;
      setMipi1Channels(newChannels);
    }
  };

  const handleISPConfigSave = (ispId: string, config: ISPConfig) => {
    setIspConfigs(prev => ({
      ...prev,
      [ispId]: config
    }));
  };

  const handleMIPIChannelConfigSave = (mipi: string, channel: number, config: any) => {
    const key = `${mipi}-ch${channel}`;
    setMipiChannelConfigs(prev => ({
      ...prev,
      [key]: config
    }));
  };

  // Get available options for a channel
  const getAvailableOptions = (mipi: 'mipi0' | 'mipi1', channelIndex: number): ChannelMode[] => {
    const ispOptions: ChannelMode[] = [`isp${channelIndex}` as ChannelMode, 'bypass'];
    const otherMipiChannels = mipi === 'mipi0' ? mipi1Channels : mipi0Channels;

    // If the other MIPI is using the ISP for this channel, don't include it as an option
    if (otherMipiChannels[channelIndex] === `isp${channelIndex}`) {
      return ['bypass'];
    }

    return ispOptions;
  };

  const shouldShowMipi0 = viewMode === 'unified' || viewMode === 'main';
  const shouldShowMipi1 = viewMode === 'unified' || viewMode === 'sub';

  // Calculate which channels to show based on view mode
  const getActiveChannels = () => {
    const channels = [];
    if (shouldShowMipi0) {
      mipi0Channels.forEach((mode, idx) => {
        channels.push({ mipi: 'mipi0', index: idx, mode, globalIndex: idx });
      });
    }
    if (shouldShowMipi1) {
      mipi1Channels.forEach((mode, idx) => {
        const globalIdx = shouldShowMipi0 ? idx + 4 : idx;
        channels.push({ mipi: 'mipi1', index: idx, mode, globalIndex: globalIdx });
      });
    }
    return channels;
  };

  const activeChannels = getActiveChannels();

  return (
    <div className="w-full h-full bg-gray-800 rounded-lg p-6 overflow-auto">
      <div className="min-w-[1600px]">
        {/* Main Horizontal Layout */}
        <div ref={mainRef} className="relative bg-gray-900 rounded-lg p-8 flex flex-col" style={{ paddingBottom: '250px' }}>
          <div className="flex items-start gap-12 relative">

            {/* Column 1: External Devices */}
            <div className="flex flex-col gap-8">
              {shouldShowMipi0 && (
                <div
                  className="bg-gray-700 border-2 border-gray-500 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors w-[140px]"
                  onClick={() => onDeviceClick('mipi0')}
                >
                  <div className="text-center font-semibold text-sm mb-2 text-gray-200">External Devices</div>
                  <div className="flex gap-1 justify-center">
                    {externalDevices?.mipi0 &&
                     ((externalDevices.mipi0.devices && externalDevices.mipi0.devices.length > 0) ||
                      (Array.isArray(externalDevices.mipi0) && externalDevices.mipi0.length > 0)) ? (
                      (externalDevices.mipi0.devices || externalDevices.mipi0).slice(0, 4).map((device: any, index: number) => (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded ${deviceTypeColors[device.type] || 'bg-gray-500'}`}
                          title={`${device.name} - ${device.model}`}
                        />
                      ))
                    ) : (
                      [0, 1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded bg-gray-500"
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {shouldShowMipi1 && (
                <div
                  className="bg-gray-700 border-2 border-gray-500 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors w-[140px]"
                  onClick={() => onDeviceClick('mipi1')}
                >
                  <div className="text-center font-semibold text-sm mb-2 text-gray-200">External Devices</div>
                  <div className="flex gap-1 justify-center">
                    {externalDevices?.mipi1 &&
                     ((externalDevices.mipi1.devices && externalDevices.mipi1.devices.length > 0) ||
                      (Array.isArray(externalDevices.mipi1) && externalDevices.mipi1.length > 0)) ? (
                      (externalDevices.mipi1.devices || externalDevices.mipi1).slice(0, 4).map((device: any, index: number) => (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded ${deviceTypeColors[device.type] || 'bg-gray-500'}`}
                          title={`${device.name} - ${device.model}`}
                        />
                      ))
                    ) : (
                      [4, 5, 6, 7].map(i => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded bg-gray-500"
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: MIPI Blocks */}
            <div className="flex flex-col gap-8" id="mipi-column">
              {shouldShowMipi0 && (
                <div className="bg-gray-700 border-2 border-purple-500 rounded-lg p-4 w-[140px] relative" id="mipi0-block">
                  <div className="text-center font-semibold text-sm text-purple-400">MIPI0</div>
                  <div className="text-center text-xs text-gray-400 mb-2">MAIN</div>
                  <select className="w-full text-xs bg-gray-600 text-gray-200 border border-gray-500 rounded px-1 py-0.5 mb-2">
                    <option>I2C12</option>
                  </select>
                  <div className="space-y-2">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between" data-channel={`mipi0-${i}`}>
                        <span className="text-xs text-gray-400">CH{i}</span>
                        <div
                          className={`w-4 h-4 rounded ${channelColorClasses[i]} cursor-pointer hover:ring-2 hover:ring-white transition-all`}
                          onClick={() => setShowMIPIConfig({ mipi: 'mipi0', channel: i })}
                          title={`Configure MIPI0 CH${i}`}
                          data-anchor={`mipi0-ch${i}`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shouldShowMipi1 && (
                <div className="bg-gray-700 border-2 border-purple-500 rounded-lg p-4 w-[140px] relative" id="mipi1-block">
                  <div className="text-center font-semibold text-sm text-purple-400">MIPI1</div>
                  <div className="text-center text-xs text-gray-400 mb-2">SUB</div>
                  <select className="w-full text-xs bg-gray-600 text-gray-200 border border-gray-500 rounded px-1 py-0.5 mb-2">
                    <option>I2C13</option>
                  </select>
                  <div className="space-y-2">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between" data-channel={`mipi1-${i}`}>
                        <span className="text-xs text-gray-400">CH{i}</span>
                        <div
                          className={`w-4 h-4 rounded ${channelColorClasses[i + 4]} cursor-pointer hover:ring-2 hover:ring-white transition-all`}
                          onClick={() => setShowMIPIConfig({ mipi: 'mipi1', channel: i })}
                          title={`Configure MIPI1 CH${i}`}
                          data-anchor={`mipi1-ch${i}`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: ISP/Bypass Selectors (positioned on lines) */}
            <div className="relative w-[300px]" style={{ height: '400px' }}>
              {/* Connection lines will be drawn here */}
              <svg className="absolute inset-0" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {activeChannels.map((ch, idx) => {
                  // Fixed positioning for MIPI side
                  // MIPI0 block starts at y=0, MIPI1 block starts at y=170 (when both shown)
                  const mipiBlockY = ch.mipi === 'mipi0' ? 0 : (shouldShowMipi0 ? 170 : 0);
                  // Header + select box height is about 60px, then channels start
                  const channelStartY = 60;
                  const channelSpacing = 28; // Space between each channel
                  const mipiY = mipiBlockY + channelStartY + (ch.index * channelSpacing) + 8; // +8 to center on the dot

                  // Fixed positioning for Camera Mux side
                  // Camera Mux has fixed height of 320px, channels distributed evenly
                  const muxTotalHeight = 280; // Usable height for channels
                  const muxStartY = 50; // Starting Y position for first channel
                  const muxSpacing = muxTotalHeight / Math.max(activeChannels.length - 1, 1);
                  const muxY = muxStartY + (idx * muxSpacing);

                  return (
                    <line
                      key={`line-${idx}`}
                      x1="0"
                      y1={mipiY}
                      x2="300"
                      y2={muxY}
                      stroke={channelColors[ch.globalIndex]}
                      strokeWidth="3"
                      strokeOpacity="0.8"
                    />
                  );
                })}
              </svg>

              {/* ISP Selectors */}
              {activeChannels.map((ch, idx) => {
                // Match the line positioning
                const mipiBlockY = ch.mipi === 'mipi0' ? 0 : (shouldShowMipi0 ? 170 : 0);
                const channelStartY = 60;
                const channelSpacing = 28;
                const mipiY = mipiBlockY + channelStartY + (ch.index * channelSpacing) + 8;

                const muxTotalHeight = 280;
                const muxStartY = 50;
                const muxSpacing = muxTotalHeight / Math.max(activeChannels.length - 1, 1);
                const muxY = muxStartY + (idx * muxSpacing);

                const middleY = (mipiY + muxY) / 2 - 12; // Center the selector on the line

                return (
                  <div
                    key={`selector-${idx}`}
                    className="absolute bg-gray-700 border-2 rounded px-2 py-0.5"
                    style={{
                      borderColor: channelColors[ch.globalIndex],
                      left: '120px',
                      top: `${middleY}px`,
                      zIndex: 10
                    }}
                  >
                    <select
                      value={ch.mode}
                      onChange={(e) => handleChannelChange(ch.mipi as 'mipi0' | 'mipi1', ch.index, e.target.value as ChannelMode)}
                      className="bg-transparent text-gray-200 text-xs font-semibold outline-none cursor-pointer"
                    >
                      {getAvailableOptions(ch.mipi as 'mipi0' | 'mipi1', ch.index).map(option => (
                        <option key={option} value={option} className="bg-gray-700 text-gray-200">
                          {option.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    {ch.mode.startsWith('isp') && (
                      <button
                        onClick={() => setShowISPConfig(ch.mode)}
                        className="ml-1 hover:bg-gray-600 rounded p-0.5"
                      >
                        <MoreHorizontal className="w-3 h-3 text-gray-300" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Column 4: Camera Mux */}
            <div
              className="bg-gray-700 border-2 border-yellow-600 rounded-lg p-4 w-[180px] h-[320px] flex flex-col cursor-pointer hover:bg-gray-600 transition-colors"
              id="camera-mux"
              onClick={() => setShowCameraMuxConfig(true)}
              title="Click to configure Camera Mux"
            >
              <div className="text-center font-semibold text-sm mb-1 text-gray-300">TCC807X</div>
              <div className="text-center font-semibold text-sm mb-3 text-yellow-400">Camera Mux</div>
              <div className="flex-1 flex flex-col justify-around">
                {activeChannels.map((ch, idx) => {
                  const mappedInput = cameraMuxConfig.mappings[ch.globalIndex] ?? ch.globalIndex;
                  return (
                    <div key={idx} className="flex items-center gap-2" data-anchor={`mux-ch${ch.globalIndex}`}>
                      <div className={`w-4 h-4 rounded ${channelColorClasses[mappedInput]}`}></div>
                      <span className="text-xs font-medium text-gray-200">CAM CH{ch.globalIndex} ← CH{mappedInput}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right group: CIED (left) — 20px spacer — SVDW/VideoPipeline (right) */}
            <div className="ml-auto flex items-start relative">
              <div ref={ciedRef} className="absolute" style={{ top: `${ciedTopOffset + 100}px`, left: '-400px' }}>
                <CIEDBar />
              </div>
              <div style={{ width: '20px' }} />
              <div ref={rightColRef} className="flex flex-col">
                <SVDWBlock />
                <div style={{ marginTop: '4.5rem' }}>
                  <VideoOutputsSection />
                </div>
              </div>
            </div>
          </div>

          
        </div>

        {/* Legend - stick to the bottom of dark background */}
        <div ref={legendRef} className="absolute left-8 right-8 bg-gray-700 p-3 rounded-lg" style={{ bottom: '30px' }}>
          <h3 className="text-white text-sm font-semibold mb-2">Channel Mapping</h3>
          <div className="grid grid-cols-8 gap-3">
            {activeChannels.map((ch, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${channelColorClasses[ch.globalIndex]}`}></div>
                <span className="text-xs text-gray-300">{ch.mipi.toUpperCase()}-VC{ch.index}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ISP Configuration Modal */}
      {showISPConfig && (
        <ISPConfigModal
          ispId={showISPConfig}
          currentConfig={ispConfigs[showISPConfig]}
          onSave={(config) => handleISPConfigSave(showISPConfig, config)}
          onClose={() => setShowISPConfig(null)}
        />
      )}

      {/* MIPI Channel Configuration Modal */}
      {showMIPIConfig && (
        <MIPIChannelConfigModal
          mipiId={showMIPIConfig.mipi}
          channelId={showMIPIConfig.channel}
          currentConfig={mipiChannelConfigs[`${showMIPIConfig.mipi}-ch${showMIPIConfig.channel}`]}
          onSave={(config) => {
            handleMIPIChannelConfigSave(showMIPIConfig.mipi, showMIPIConfig.channel, config);
            setShowMIPIConfig(null);
          }}
          onClose={() => setShowMIPIConfig(null)}
        />
      )}

      {/* Camera Mux Configuration Modal */}
      {showCameraMuxConfig && (
        <CameraMuxConfigModal
          currentConfig={cameraMuxConfig}
          onSave={(config) => {
            setCameraMuxConfig(config);
            setShowCameraMuxConfig(false);
          }}
          onClose={() => setShowCameraMuxConfig(false)}
        />
      )}
    </div>
  );
};