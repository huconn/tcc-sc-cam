import React from 'react';
import { useCameraStore } from '@/store/cameraStore';
import { ISPSelector } from '@/components/ISPConfiguration/ISPSelector';
import type { ChannelMode } from '@/types/camera';

type SelectorChannelMode = 'isp0' | 'isp1' | 'isp2' | 'isp3' | 'bypass';

interface ISPBlockProps {
  activeChannels: Array<{ 
    mipi: 'mipi0' | 'mipi1';
    index: number;
    mode: ChannelMode;
    globalIndex: number;
  }>;
  channelColors: string[];
  onChannelChange: (mipi: 'mipi0' | 'mipi1', channelIndex: number, mode: ChannelMode) => void;
  getAvailableOptions: (mipi: 'mipi0' | 'mipi1', channelIndex: number) => ChannelMode[];
  onOpenISPConfig: (ispId: string) => void;
  onOpenCiedSlot: (slot: number) => void;
  heightPx?: number;
}

export const ISPBlock: React.FC<ISPBlockProps> = ({
  activeChannels,
  channelColors,
  onChannelChange,
  getAvailableOptions,
  onOpenISPConfig,
  onOpenCiedSlot,
  heightPx,
}) => {
  const debugShowLayoutBorders = useCameraStore((s: any) => s.debugShowLayoutBorders ?? false);

  return (
    <div
      className={`relative w-[280px] p-2 text-gray-200 flex flex-col ${debugShowLayoutBorders ? 'debug' : ''}`}
      style={{ height: heightPx ? `${heightPx}px` : '700px' }}
    >
      {debugShowLayoutBorders && (
        <span className="absolute -top-3 -left-3 bg-yellow-600 text-white text-[10px] px-1.5 py-0.5 rounded z-10">ISP-BLOCK</span>
      )}

      {/* Title - invisible but preserves space */}
      <div className={`text-center font-semibold text-sm mb-1 text-yellow-400 relative ${debugShowLayoutBorders ? 'debug-cyan' : ''}`}>
        {debugShowLayoutBorders && (
          <span className="absolute -top-2 -left-2 bg-cyan-600 text-white text-[9px] px-1 py-0.5 rounded z-10">TITLE</span>
        )}
        <span className="invisible">ISP BLOCK</span>
      </div>

      {/* 16-row table structure */}
      <div className={`w-full flex-1 flex flex-col relative ${debugShowLayoutBorders ? 'debug-yellow' : ''}`}>
        {debugShowLayoutBorders && (
          <span className="absolute -top-2 -left-2 bg-yellow-600 text-white text-[9px] px-1 py-0.5 rounded z-10">TABLE-WRAPPER</span>
        )}
        <table className={`w-full h-full ${debugShowLayoutBorders ? 'border-2 border-yellow-400' : ''}`}>
          <tbody className="h-full flex flex-col">
            {Array.from({ length: 18 }).map((_, rowIdx) => {
              // rowIdx: 0, 2, 4, 6, 8, 10, 12, 14 → ISP0-7
              // rowIdx: 3 → IR0 (if mipi0 ISP1 is selected)
              // rowIdx: 7 → IR1 (if mipi0 ISP3 is selected)
              // rowIdx: 11 → IR0 (if mipi1 ISP1 is selected)
              // rowIdx: 15 → IR1 (if mipi1 ISP3 is selected)
              // rowIdx: 16, 17 → 빈 행
              // 나머지 → 빈 행
              
              // ISP1의 mode를 확인
              const isp1Mode0 = activeChannels[1]?.mode || 'bypass'; // mipi0 ISP1 (globalIndex 1)
              const isp1Mode1 = activeChannels[5]?.mode || 'bypass'; // mipi1 ISP1 (globalIndex 5)
              
              // ISP3의 mode를 확인
              const isp3Mode0 = activeChannels[3]?.mode || 'bypass'; // mipi0 ISP3 (globalIndex 3)
              const isp3Mode1 = activeChannels[7]?.mode || 'bypass'; // mipi1 ISP3 (globalIndex 7)
              
              // IR0 행 - mipi0 (rowIdx === 3) - mipi0 ISP1이 'isp1'일 때만 표시
              if (rowIdx === 3) {
                const showIR0 = isp1Mode0 === 'isp1';
                if (!showIR0) {
                  return (
                    <tr 
                      key={`isp-row-${rowIdx}`} 
                      className={`flex-1 ${debugShowLayoutBorders ? 'border border-gray-600' : ''}`}
                    >
                      {debugShowLayoutBorders && (
                        <td className="w-full text-center text-[8px] text-gray-500">Empty-{rowIdx} (mipi0 IR0 hidden)</td>
                      )}
                    </tr>
                  );
                }
                
                return (
                  <tr 
                    key={`isp-row-${rowIdx}`} 
                    className={`flex-1 flex items-center justify-end relative ${debugShowLayoutBorders ? 'border border-orange-300' : ''}`}
                  >
                    {debugShowLayoutBorders && (
                      <span className="absolute -top-1 -left-1 bg-orange-600 text-white text-[8px] px-1 py-0.5 rounded z-50">
                        IR0-mipi0
                      </span>
                    )}
                    <td className={`flex items-center justify-end pr-2 relative w-full ${debugShowLayoutBorders ? 'border border-orange-200' : ''}`}>
                      <div
                        className="w-12 h-6 border border-slate-400 rounded flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: '#64748b' }}
                        data-connection-point="ir0-box"
                        onClick={() => onOpenCiedSlot(8)}
                      >
                        <span className="text-white text-xs font-bold">IR0</span>
                      </div>
                    </td>
                  </tr>
                );
              }
              
              // IR1 행 - mipi0 (rowIdx === 7) - mipi0 ISP3이 'isp3'일 때만 표시
              if (rowIdx === 7) {
                const showIR1 = isp3Mode0 === 'isp3';
                if (!showIR1) {
                  return (
                    <tr 
                      key={`isp-row-${rowIdx}`} 
                      className={`flex-1 ${debugShowLayoutBorders ? 'border border-gray-600' : ''}`}
                    >
                      {debugShowLayoutBorders && (
                        <td className="w-full text-center text-[8px] text-gray-500">Empty-{rowIdx} (mipi0 IR1 hidden)</td>
                      )}
                    </tr>
                  );
                }
                
                return (
                  <tr 
                    key={`isp-row-${rowIdx}`} 
                    className={`flex-1 flex items-center justify-end relative ${debugShowLayoutBorders ? 'border border-amber-300' : ''}`}
                  >
                    {debugShowLayoutBorders && (
                      <span className="absolute -top-1 -left-1 bg-amber-600 text-white text-[8px] px-1 py-0.5 rounded z-50">
                        IR1-mipi0
                      </span>
                    )}
                    <td className={`flex items-center justify-end pr-2 relative w-full ${debugShowLayoutBorders ? 'border border-amber-200' : ''}`}>
                      <div
                        className="w-12 h-6 border border-amber-600 rounded flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: '#92400e' }}
                        data-connection-point="ir1-box"
                        onClick={() => onOpenCiedSlot(9)}
                      >
                        <span className="text-white text-xs font-bold">IR1</span>
                      </div>
                    </td>
                  </tr>
                );
              }
              
              // IR0 행 - mipi1 (rowIdx === 11) - mipi1 ISP1이 'isp1'일 때만 표시
              if (rowIdx === 11) {
                const showIR0 = isp1Mode1 === 'isp1';
                if (!showIR0) {
                  return (
                    <tr 
                      key={`isp-row-${rowIdx}`} 
                      className={`flex-1 ${debugShowLayoutBorders ? 'border border-gray-600' : ''}`}
                    >
                      {debugShowLayoutBorders && (
                        <td className="w-full text-center text-[8px] text-gray-500">Empty-{rowIdx} (mipi1 IR0 hidden)</td>
                      )}
                    </tr>
                  );
                }
                
                return (
                  <tr 
                    key={`isp-row-${rowIdx}`} 
                    className={`flex-1 flex items-center justify-end relative ${debugShowLayoutBorders ? 'border border-orange-300' : ''}`}
                  >
                    {debugShowLayoutBorders && (
                      <span className="absolute -top-1 -left-1 bg-orange-600 text-white text-[8px] px-1 py-0.5 rounded z-50">
                        IR0-mipi1
                      </span>
                    )}
                    <td className={`flex items-center justify-end pr-2 relative w-full ${debugShowLayoutBorders ? 'border border-orange-200' : ''}`}>
                      <div
                        className="w-12 h-6 border border-slate-400 rounded flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: '#64748b' }}
                        data-connection-point="ir0-box-mipi1"
                        onClick={() => onOpenCiedSlot(8)}
                      >
                        <span className="text-white text-xs font-bold">IR0</span>
                      </div>
                    </td>
                  </tr>
                );
              }
              
              // IR1 행 - mipi1 (rowIdx === 15) - mipi1 ISP3이 'isp3'일 때만 표시
              if (rowIdx === 15) {
                const showIR1 = isp3Mode1 === 'isp3';
                if (!showIR1) {
                  return (
                    <tr 
                      key={`isp-row-${rowIdx}`} 
                      className={`flex-1 ${debugShowLayoutBorders ? 'border border-gray-600' : ''}`}
                    >
                      {debugShowLayoutBorders && (
                        <td className="w-full text-center text-[8px] text-gray-500">Empty-{rowIdx} (mipi1 IR1 hidden)</td>
                      )}
                    </tr>
                  );
                }
                
                return (
                  <tr 
                    key={`isp-row-${rowIdx}`} 
                    className={`flex-1 flex items-center justify-end relative ${debugShowLayoutBorders ? 'border border-amber-300' : ''}`}
                  >
                    {debugShowLayoutBorders && (
                      <span className="absolute -top-1 -left-1 bg-amber-600 text-white text-[8px] px-1 py-0.5 rounded z-50">
                        IR1-mipi1
                      </span>
                    )}
                    <td className={`flex items-center justify-end pr-2 relative w-full ${debugShowLayoutBorders ? 'border border-amber-200' : ''}`}>
                      <div
                        className="w-12 h-6 border border-amber-600 rounded flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: '#92400e' }}
                        data-connection-point="ir1-box-mipi1"
                        onClick={() => onOpenCiedSlot(9)}
                      >
                        <span className="text-white text-xs font-bold">IR1</span>
                      </div>
                    </td>
                  </tr>
                );
              }
              
              // ISP 행 (0, 2, 4, 6, 8, 10, 12, 14)
              const isISPRow = rowIdx % 2 === 0 && rowIdx < 16;
              if (isISPRow) {
                const ispIndex = rowIdx / 2; // 0, 1, 2, 3, 4, 5, 6, 7
                const ch = activeChannels[ispIndex];
                
                // activeChannels가 없으면 빈 행으로 처리
                if (!ch) {
                  return (
                    <tr 
                      key={`isp-row-${rowIdx}`} 
                      className={`flex-1 ${debugShowLayoutBorders ? 'border border-gray-600' : ''}`}
                    >
                      {debugShowLayoutBorders && (
                        <td className="w-full text-center text-[8px] text-gray-500">Empty-{rowIdx} (no channel)</td>
                      )}
                    </tr>
                  );
                }
                
                return (
                  <tr 
                    key={`isp-row-${rowIdx}`} 
                    className={`flex-1 flex items-center justify-start relative ${debugShowLayoutBorders ? 'border border-yellow-300' : ''}`}
                  >
                    {debugShowLayoutBorders && (
                      <span className="absolute -top-1 -left-1 bg-blue-600 text-white text-[8px] px-1 py-0.5 rounded z-50">
                        Row-{rowIdx}-ISP{ispIndex}
                      </span>
                    )}
                    
                    <td className={`flex items-center justify-start pl-2 relative w-full ${debugShowLayoutBorders ? 'border border-yellow-200' : ''}`}>
                      {/* ISP Selector wrapper with connection points */}
                      <div 
                        className="relative"
                        data-connection-point={`isp-left-${ch.globalIndex}-box`}
                      >
                        {/* Left-edge anchor for MIPI to ISP connection */}
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 -translate-x-full"
                        />
                        
                        {/* Right-edge anchor for ISP box to attach lines from ISP to CAM Mux */}
                        <div
                          data-anchor-point={`isp-right-${ch.globalIndex}-box`}
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0"
                        />
                        
                        <ISPSelector
                          value={ch.mode as unknown as SelectorChannelMode}
                          onChange={(next) => onChannelChange(ch.mipi as 'mipi0' | 'mipi1', ch.index, next as unknown as ChannelMode)}
                          color={channelColors[ch.globalIndex]}
                          options={getAvailableOptions(ch.mipi as 'mipi0' | 'mipi1', ch.index) as unknown as SelectorChannelMode[]}
                          showConfigButton={String(ch.mode).startsWith('isp')}
                          onOpenConfig={() => onOpenISPConfig(`isp${ch.globalIndex}`)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              }
              
              // 빈 행 (1, 5, 9, 11, 13, 15)
              return (
                <tr 
                  key={`isp-row-${rowIdx}`} 
                  className={`flex-1 ${debugShowLayoutBorders ? 'border border-gray-600' : ''}`}
                >
                  {debugShowLayoutBorders && (
                    <td className="w-full text-center text-[8px] text-gray-500">Empty-{rowIdx}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

