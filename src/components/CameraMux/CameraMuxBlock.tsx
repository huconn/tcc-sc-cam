import React from 'react';
import { getChannelBgClass } from '@/utils/channelPalette';

interface CameraMuxBlockProps {
  activeChannels: Array<{ globalIndex: number }>;
  cameraMuxConfig: { mappings: Record<number, number> };
  channelColorClasses: string[];
  onOpen: () => void;
}

export const CameraMuxBlock: React.FC<CameraMuxBlockProps> = ({
  activeChannels,
  cameraMuxConfig,
  channelColorClasses,
  onOpen,
}) => {
  return (
    <div
      className="relative bg-gray-700 border-2 border-purple-500 rounded-lg w-[200px] h-[560px] p-4 cursor-pointer text-gray-200 transform transition-transform hover:scale-105 hover:border-white hover:ring-1 hover:ring-white focus:outline-none focus:ring-1 focus:ring-primary-500"
      onClick={onOpen}
      title="Click to configure Camera Mux"
    >
      {/* Title */}
      <div className="text-center font-semibold text-sm mb-4 text-purple-400">CAMERA MUX</div>

      {/* Left side markers (flush to left edge) */}
      <div className="absolute top-8 bottom-8 flex flex-col justify-between" style={{ left: '0px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`left-${i}`}
            className={`w-10 h-6 rounded-sm border border-gray-500 ${getChannelBgClass(i)} flex items-center justify-center`}
            data-connection-point={`mux-left-${i}-target`}
          >
            {i === 0 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-left-0-target">IN-0</span> : null}
            {i === 1 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-left-1-target">IN-1</span> : null}
            {i === 2 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-left-2-target">IN-2</span> : null}
            {i === 3 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-left-3-target">IN-3</span> : null}
            {i === 4 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-left-4-target">IN-4</span> : null}
            {i === 5 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-left-5-target">IN-5</span> : null}
            {i === 6 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-left-6-target">IN6</span> : null}
            {i === 7 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-left-7-target">IN-7</span> : null}

          </div>
        ))}
      </div>

      {/* Right side markers (flush to right edge) */}
      <div className="absolute top-8 bottom-8 flex flex-col justify-between" style={{ right: '2px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`right-${i}`}
            className={`w-10 h-6 rounded-sm border border-gray-500 ${getChannelBgClass(i)} flex items-center justify-center`}
            data-connection-point={`mux-right-${i}-target`}
          >
            {i === 0 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-right-0-target">OUT-0</span> : null}
            {i === 1 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-right-1-target">OUT-1</span> : null}
            {i === 2 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-right-2-target">OUT-2</span> : null}
            {i === 3 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-right-3-target">OUT-3</span> : null}
            {i === 4 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-right-4-target">OUT-4</span> : null}
            {i === 5 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-right-5-target">OUT-5</span> : null}
            {i === 6 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-right-6-target">OUT-6</span> : null}
            {i === 7 ? <span className="text-black bold font-bold text-[10px] leading-none" data-connection-point="mux-right-7-target">OUT-7</span> : null}
          </div>
        ))}
      </div>

      {/* Center contents */}
      <div className="absolute inset-x-8 top-8 bottom-8 flex flex-col justify-between">
        {activeChannels.map((ch, idx) => {
          const mappedInput = cameraMuxConfig.mappings[ch.globalIndex] ?? ch.globalIndex;
          return (
            <div key={idx} className="flex items-center justify-center" data-anchor={`mux-ch${ch.globalIndex}`}>
              <span className="text-[11px] font-medium text-gray-200">CH{ch.globalIndex} -&gt; CH{mappedInput}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


