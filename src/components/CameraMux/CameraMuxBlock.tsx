import React from 'react';
import { getChannelBgClass, getChannelHex } from '@/utils/channelPalette';

interface CameraMuxBlockProps {
  activeChannels: Array<{ globalIndex: number }>;
  cameraMuxConfig: { mappings: Record<number, number> };
  channelColorClasses: string[];
  onOpen: () => void;
  heightPx?: number;
}

export const CameraMuxBlock: React.FC<CameraMuxBlockProps> = ({
  activeChannels,
  cameraMuxConfig,
  channelColorClasses,
  onOpen,
  heightPx,
}) => {
  // Input channel labels: 0-7 maps to MIPI0-0~3, MIPI1-0~3
  const getInputLabel = (ch: number): string => {
    if (ch <= 3) return `MIPI0-${ch}`;
    return `MIPI1-${ch - 4}`;
  };

  return (
    <div
      className="relative bg-gray-700 border-2 border-purple-500 rounded-lg w-[200px] p-4 cursor-pointer text-gray-200 transform transition-transform hover:scale-105 hover:border-white hover:ring-1 hover:ring-white focus:outline-none focus:ring-1 focus:ring-primary-500"
      data-connection-point="camera-mux-box"
      onClick={onOpen}
      title="Click to configure Camera Mux"
      style={{ height: heightPx ? `${heightPx}px` : '560px' }}
    >
      {/* Title */}
      <div className="text-center font-semibold text-sm mb-4 text-purple-400">CAMERA MUX</div>

      {/* Left side markers (flush to left edge) - Input Channels */}
      <div className="absolute top-8 bottom-8 flex flex-col justify-between" style={{ left: '0px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`left-${i}`}
            className={`w-10 h-6 rounded-sm border border-gray-500 flex items-center justify-center`}
            style={{ backgroundColor: getChannelHex(i) }}
            data-connection-point={`mux-left-${i}-target`}
          >
            <span className="text-black bold font-bold text-[9px] leading-none" data-connection-point={`mux-left-${i}-target`}>
              IN-{i}
            </span>
          </div>
        ))}
      </div>

      {/* Right side markers (flush to right edge) - Output Channels */}
      <div className="absolute top-8 bottom-8 flex flex-col justify-between" style={{ right: '2px' }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const mappedInput = cameraMuxConfig.mappings[i] ?? i;
          return (
            <div
              key={`right-${i}`}
              className={`w-10 h-6 rounded-sm border border-gray-500 flex items-center justify-center`}
              style={{ backgroundColor: getChannelHex(mappedInput) }}
              data-connection-point={`mux-right-${i}-target`}
            >
              <span className="text-black bold font-bold text-[9px] leading-none" data-connection-point={`mux-right-${i}-target`}>
                OUT-{i}
              </span>
            </div>
          );
        })}
      </div>

      {/* Center contents */}
      <div className="absolute inset-x-8 top-8 bottom-8 flex flex-col justify-between">
        {activeChannels.map((ch, idx) => {
          const mappedInput = cameraMuxConfig.mappings[ch.globalIndex] ?? ch.globalIndex;
          return (
            <div key={idx} className="flex items-center justify-center" data-anchor={`mux-ch${ch.globalIndex}`}>
              <span className="text-[10px] font-medium text-gray-200">{getInputLabel(mappedInput)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


