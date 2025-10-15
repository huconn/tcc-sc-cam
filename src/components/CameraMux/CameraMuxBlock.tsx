import React from 'react';
import { getChannelBgClass, getChannelHex } from '@/utils/channelPalette';
import { useCameraStore } from '@/store/cameraStore';

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
  const debugShowLayoutBorders = useCameraStore((s: any) => s.debugShowLayoutBorders ?? false);

  // Input channel labels: 0-7 maps to MIPI0-0~3, MIPI1-0~3
  const getInputLabel = (ch: number): string => {
    if (ch <= 3) return `MIPI0-${ch}`;
    return `MIPI1-${ch - 4}`;
  };

  return (
    <div
      className={`relative bg-gray-700 border-2 border-purple-500 rounded-lg w-[200px] p-3 cursor-pointer text-gray-200 transform transition-transform hover:scale-105 hover:border-white hover:ring-1 hover:ring-white focus:outline-none focus:ring-1 focus:ring-primary-500 flex flex-col ${debugShowLayoutBorders ? 'debug' : ''}`}
      data-connection-point="camera-mux-box"
      onClick={onOpen}
      title="Click to configure Camera Mux"
      style={{ height: heightPx ? `${heightPx}px` : '560px' }}
    >
      {debugShowLayoutBorders && (
        <span className="absolute -top-3 -left-3 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded z-10">CAMERA-MUX-BLOCK</span>
      )}

      {/* Title - 위로 올림 */}
      <div className={`text-center font-semibold text-sm mb-2 text-purple-400 relative ${debugShowLayoutBorders ? 'debug-cyan' : ''}`}>
        {debugShowLayoutBorders && (
          <span className="absolute -top-2 -left-2 bg-cyan-600 text-white text-[9px] px-1 py-0.5 rounded z-10">TITLE</span>
        )}
        CAMERA MUX
      </div>

      {/* 8x3 테이블 구조 - 꽉 채우기 */}
      <div className={`w-full flex-1 flex flex-col relative ${debugShowLayoutBorders ? 'debug-yellow' : ''}`}>
        {debugShowLayoutBorders && (
          <span className="absolute -top-2 -left-2 bg-yellow-600 text-white text-[9px] px-1 py-0.5 rounded z-10">TABLE-WRAPPER</span>
        )}
        <table className="w-full h-full">
          <tbody className="h-full flex flex-col">
            {Array.from({ length: 8 }).map((_, i) => {
              const mappedInput = cameraMuxConfig.mappings[i] ?? i;
              return (
                <tr key={i} className="flex-1 flex items-center">
                  {/* Input Channel (왼쪽) */}
                  <td className={`p-0 flex items-center relative ${debugShowLayoutBorders ? 'debug-green' : ''}`}>
                    {debugShowLayoutBorders && (
                      <span className="absolute top-0 left-0 bg-green-500 text-white text-[8px] px-0.5 rounded z-10">IN-{i}</span>
                    )}
                    <div
                      className="w-10 h-6 rounded-sm border border-gray-500 flex items-center justify-center"
                      style={{ backgroundColor: getChannelHex(i) }}
                      data-connection-point={`mux-left-${i}-target`}
                    >
                      <span className="text-black font-bold text-[9px] leading-none" data-connection-point={`mux-left-${i}-target`}>
                        CH{i}
                      </span>
                    </div>
                  </td>

                  {/* Center MIPI Label */}
                  <td className={`p-0 flex-1 text-center flex items-center justify-center relative ${debugShowLayoutBorders ? 'debug-blue' : ''}`} data-anchor={`mux-ch${i}`}>
                    {debugShowLayoutBorders && (
                      <span className="absolute top-0 left-0 bg-blue-500 text-white text-[8px] px-0.5 rounded z-10">MID-{i}</span>
                    )}
                    <span className="text-[10px] font-medium text-gray-200">
                      {getInputLabel(mappedInput)}
                    </span>
                  </td>

                  {/* Output Channel (오른쪽) */}
                  <td className={`p-0 flex items-center justify-end relative ${debugShowLayoutBorders ? 'debug-pink' : ''}`}>
                    {debugShowLayoutBorders && (
                      <span className="absolute top-0 right-0 bg-pink-500 text-white text-[8px] px-0.5 rounded z-10">OUT-{i}</span>
                    )}
                    <div
                      className="w-10 h-6 rounded-sm border border-gray-500 flex items-center justify-center"
                      style={{ backgroundColor: getChannelHex(mappedInput) }}
                      data-connection-point={`mux-right-${i}-target`}
                    >
                      <span className="text-black font-bold text-[9px] leading-none" data-connection-point={`mux-right-${i}-target`}>
                        CH{mappedInput}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


