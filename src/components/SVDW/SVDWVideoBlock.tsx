import React, { useState, useEffect, useRef } from 'react';
import { useCameraStore } from '@/store/cameraStore';
import { getChannelHex } from '@/utils/channelPalette';
import { SVDWGrabberConfigModal, SVDWGrabberStatus } from './SVDWGrabberConfigModal';
import { SVDWBlenderConfigModal, SVDWBlenderStatus } from './SVDWBlenderConfigModal';
import { VideoSimpleStatusModal } from '@/components/VideoPipeline/VideoSimpleStatusModal';

interface SVDWVideoBlockProps {
  cameraMuxMappings: Record<number, number>;
  heightPx?: number;
}

export const SVDWVideoBlock: React.FC<SVDWVideoBlockProps> = ({ cameraMuxMappings = {}, heightPx }) => {
  const debugShowLayoutBorders = useCameraStore((s: any) => s.debugShowLayoutBorders ?? false);

  // Grabber colors
  const markerHex: string[] = [
    getChannelHex(cameraMuxMappings[0] ?? 0),
    getChannelHex(cameraMuxMappings[1] ?? 1),
    getChannelHex(cameraMuxMappings[2] ?? 2),
    getChannelHex(cameraMuxMappings[3] ?? 3),
  ];

  // Video colors
  const videoColors = {
    vwdma0: getChannelHex(cameraMuxMappings[4] ?? 4),
    vwdma1: getChannelHex(cameraMuxMappings[5] ?? 5),
    vin0: getChannelHex(cameraMuxMappings[6] ?? 6),
    vin1: getChannelHex(cameraMuxMappings[7] ?? 7),
  };

  // Modal states
  const [grabberModalOpen, setGrabberModalOpen] = useState(false);
  const [activeGrabber, setActiveGrabber] = useState(0);
  const [grabberStatus, setGrabberStatus] = useState<Record<number, SVDWGrabberStatus>>({
    0: 'okay', 1: 'okay', 2: 'okay', 3: 'okay'
  });
  const [blenderOpen, setBlenderOpen] = useState(false);
  const [blenderStatus, setBlenderStatus] = useState<SVDWBlenderStatus>('okay');
  
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoModalTitle, setVideoModalTitle] = useState('');

  // Dynamic Blender height based on color box positions
  const [blenderHeight, setBlenderHeight] = useState('280px');

  // Lines from Grabber to Blender
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number; color: string }>>([]);

  useEffect(() => {
    const updateLinesAndBlenderHeight = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines: Array<{ x1: number; y1: number; x2: number; y2: number; color: string }> = [];

      // Calculate Blender height based on color box positions
      const colorBox0 = document.querySelector(`[data-connection-point="svdw-left-0"]`) as HTMLElement | null;
      const colorBox3 = document.querySelector(`[data-connection-point="svdw-left-3"]`) as HTMLElement | null;
      
      if (colorBox0 && colorBox3) {
        const box0Rect = colorBox0.getBoundingClientRect();
        const box3Rect = colorBox3.getBoundingClientRect();
        const calculatedHeight = box3Rect.bottom - box0Rect.top;
        setBlenderHeight(`${calculatedHeight}px`);
      }

      for (let i = 0; i < 4; i++) {
        const grabber = document.querySelector(`[data-anchor-point="grabber-${i}-right"]`) as HTMLElement | null;
        const blender = document.querySelector(`[data-connection-point="blender-left-${i}"]`) as HTMLElement | null;

        if (grabber && blender) {
          const grabberRect = grabber.getBoundingClientRect();
          const blenderRect = blender.getBoundingClientRect();

          const x1 = grabberRect.right - containerRect.left;
          const y1 = grabberRect.top + grabberRect.height / 2 - containerRect.top;
          const x2 = blenderRect.left - containerRect.left;
          const y2 = blenderRect.top + blenderRect.height / 2 - containerRect.top;

          newLines.push({ x1, y1, x2, y2, color: markerHex[i] });
        }
      }

      setLines(newLines);
    };

    const ro = new ResizeObserver(updateLinesAndBlenderHeight);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', updateLinesAndBlenderHeight);
    requestAnimationFrame(updateLinesAndBlenderHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateLinesAndBlenderHeight);
    };
  }, [markerHex]);

  return (
    <div
      className={`relative w-full min-w-[500px] p-2 text-gray-200 flex flex-col ${debugShowLayoutBorders ? 'debug' : ''}`}
      style={{ height: heightPx ? `${heightPx}px` : '700px' }}
    >
      {debugShowLayoutBorders && (
        <span className="absolute -top-3 -left-3 bg-yellow-600 text-white text-[10px] px-1.5 py-0.5 rounded z-10">SVDW-VIDEO-BLOCK</span>
      )}

      {/* SVDW Container wrapping Title and Grabber/Blender up to Grabber 3 */}
      <div ref={containerRef} className={`relative w-full rounded-lg border-2 border-purple-400 ${debugShowLayoutBorders ? 'border-purple-500' : ''}`} style={{ backgroundColor: '#374151', height: 'calc(100% * 8 / 18)' }}>
        {debugShowLayoutBorders && (
          <span className="absolute -top-3 -left-3 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded z-10">SVDW-CONTAINER</span>
        )}
        
        {/* SVDW Title - like Camera Mux */}
        <div className={`text-center font-semibold text-sm mb-1 text-yellow-400 relative ${debugShowLayoutBorders ? 'debug-cyan' : ''}`}>
          {debugShowLayoutBorders && (
            <span className="absolute -top-2 -left-2 bg-cyan-600 text-white text-[9px] px-1 py-0.5 rounded z-10">TITLE</span>
          )}
          SVDW
        </div>

        {/* SVG overlay for Grabber to Blender lines */}
        {lines.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
            <defs>
              <marker id="arrowhead-grabber-blender" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">
                <polygon points="0 0, 5 1.75, 0 3.5" fill="context-stroke" />
              </marker>
            </defs>
            {lines.map((l, i) => (
              <line 
                key={i} 
                x1={l.x1} 
                y1={l.y1} 
                x2={l.x2} 
                y2={l.y2} 
                stroke={l.color} 
                strokeWidth="3" 
                markerEnd="url(#arrowhead-grabber-blender)" 
              />
            ))}
          </svg>
        )}
        
        <table className={`w-full h-full ${debugShowLayoutBorders ? 'border-2 border-yellow-400' : ''}`}>
          <tbody className="h-full flex flex-col">
            {Array.from({ length: 8 }).map((_, rowIdx) => {
              // Row 0, 2, 4, 6: Grabber 0-3
              // 나머지: 빈 행

              const grabberIndex = rowIdx === 0 ? 0 : rowIdx === 2 ? 1 : rowIdx === 4 ? 2 : rowIdx === 6 ? 3 : -1;
              const isGrabberRow = grabberIndex !== -1;

              if (isGrabberRow) {
                return (
                  <tr
                    key={`row-${rowIdx}`}
                    className={`flex-1 flex items-center relative ${debugShowLayoutBorders ? 'border border-yellow-300' : ''}`}
                  >
                    {debugShowLayoutBorders && (
                      <span className="absolute -top-1 -left-1 bg-blue-600 text-white text-[8px] px-1 py-0.5 rounded z-50">
                        Row-{rowIdx}-G{grabberIndex}
                      </span>
                    )}

                    {/* Left: Grabber button */}
                    <td className={`flex items-center justify-start relative ${debugShowLayoutBorders ? 'border border-yellow-200' : ''}`} style={{ width: '60%' }}>
                      {/* Connection point for left marker - attached to button */}
                      <div className="flex items-center gap-0">
                        <div
                          className="w-8 h-6 flex items-center justify-center border border-gray-500 rounded"
                          style={{ backgroundColor: markerHex[grabberIndex] }}
                          data-connection-point={`svdw-left-${grabberIndex}`}
                        />

                        <button
                          type="button"
                          onClick={() => { setActiveGrabber(grabberIndex); setGrabberModalOpen(true); }}
                          className="bg-gray-700 text-purple-400 border-2 border-gray-500 rounded px-4 py-2 text-sm font-semibold hover:border-white transition-colors"
                          data-anchor-point={`grabber-${grabberIndex}-right`}
                        >
                          Grabber {grabberIndex}
                        </button>
                      </div>
                    </td>

                    {/* Right: Blender area */}
                    <td className={`relative flex items-center justify-start pl-2 ${debugShowLayoutBorders ? 'border border-purple-200' : ''}`} style={{ width: '40%' }}>
                      {/* Only first Grabber row renders the Blender button spanning exactly to Grabber 3 */}
                      {grabberIndex === 0 && (
                        <div className="absolute left-0 w-full flex items-center justify-center" style={{ top: '0px', height: blenderHeight }}>
                          <button
                            type="button"
                            onClick={() => setBlenderOpen(true)}
                            className="bg-purple-700 text-white border-2 border-purple-400 rounded px-4 text-sm font-semibold hover:border-white transition-colors flex items-center justify-center"
                            style={{ width: '100%', height: '100%' }}
                          >
                            Blender
                          </button>
                        </div>
                      )}
                      
                      {/* Blender marker for connection lines - left edge of the large area */}
                      <div
                        className="w-8 h-6 flex items-center justify-center border-2 border-white rounded relative"
                        style={{ backgroundColor: markerHex[grabberIndex], zIndex: 10 }}
                        data-connection-point={`blender-left-${grabberIndex}`}
                      />
                    </td>
                  </tr>
                );
              }

              // Empty row
              return (
                <tr
                  key={`row-${rowIdx}`}
                  className={`flex-1 flex ${debugShowLayoutBorders ? 'border border-gray-600' : ''}`}
                >
                  <td style={{ width: '60%' }} className={debugShowLayoutBorders ? 'border border-gray-700' : ''}>
                    {debugShowLayoutBorders && (
                      <span className="text-[8px] text-gray-500">Empty-{rowIdx}-L</span>
                    )}
                  </td>
                  <td style={{ width: '40%' }} className={debugShowLayoutBorders ? 'border border-gray-700' : ''}>
                    {debugShowLayoutBorders && (
                      <span className="text-[8px] text-gray-500">Empty-{rowIdx}-R</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Video Output Section (outside SVDW) */}
      <div className="w-full" style={{ height: 'calc(100% * 11 / 18)' }}>
        <table className={`w-full h-full ${debugShowLayoutBorders ? 'border-2 border-green-400' : ''}`}>
          <tbody className="h-full flex flex-col">
            {Array.from({ length: 11 }).map((_, videoRowIdx) => {
              const actualRowIdx = videoRowIdx + 7; // Start from row 7
              
              // Video rows
              const isVWDMA0 = actualRowIdx === 8;
              const isVWDMA1 = actualRowIdx === 10;
              const isVIN0 = actualRowIdx === 12;
              const isVIN1 = actualRowIdx === 14;
              const isMDW = actualRowIdx === 16;
              const isVideoRow = isVWDMA0 || isVWDMA1 || isVIN0 || isVIN1 || isMDW;

              if (isVideoRow) {
                const videoName = isVWDMA0 ? 'VWDMA0' : isVWDMA1 ? 'VWDMA1' : isVIN0 ? 'VIN0' : isVIN1 ? 'VIN1' : 'MDW';
                const connectionId = isVWDMA0 ? 'video-out-vwdma0' : isVWDMA1 ? 'video-out-vwdma1' : isVIN0 ? 'video-out-vin0' : isVIN1 ? 'video-out-vin1' : 'video-out-mdw';
                const colorTop = isVWDMA0 ? videoColors.vwdma0 : isVWDMA1 ? videoColors.vwdma1 : isVIN0 ? videoColors.vin0 : isVIN1 ? videoColors.vin1 : '#666';
                const onOpen = () => {
                  setVideoModalTitle(videoName);
                  setVideoModalOpen(true);
                };

                return (
                  <tr
                    key={`video-row-${actualRowIdx}`}
                    className={`flex-1 flex items-center relative ${debugShowLayoutBorders ? 'border border-green-300' : ''}`}
                  >
                    {debugShowLayoutBorders && (
                      <span className="absolute -top-1 -left-1 bg-green-600 text-white text-[8px] px-1 py-0.5 rounded z-50">
                        Row-{actualRowIdx}-{videoName}
                      </span>
                    )}

                    {/* Full width: Video button */}
                    <td className={`flex items-center pl-2 relative w-full ${debugShowLayoutBorders ? 'border border-green-200' : ''}`}>
                      <div className="flex items-center gap-0 w-full" data-connection-point={connectionId}>
                        <div className="flex flex-col border-[3px] rounded-tl rounded-bl border-r-0" style={{ borderColor: colorTop }}>
                          <div className="h-[17px] w-8 flex items-center justify-center" style={{ backgroundColor: colorTop }} />
                          <div className="h-[17px] w-8 flex items-center justify-center border-t-0" style={{ backgroundColor: colorTop, borderColor: colorTop }} />
                        </div>

                        <button
                          onClick={onOpen}
                          className="bg-gray-700 text-purple-400 border-[3px] border-l-0 rounded-tr rounded-br px-4 py-2 flex-1 text-sm font-semibold hover:bg-gray-600 transition-colors"
                          style={{ borderColor: colorTop }}
                        >
                          {videoName}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              // Empty row
              return (
                <tr
                  key={`video-row-${actualRowIdx}`}
                  className={`flex-1 flex ${debugShowLayoutBorders ? 'border border-gray-600' : ''}`}
                >
                  <td className={debugShowLayoutBorders ? 'border border-gray-700' : ''}>
                    {debugShowLayoutBorders && (
                      <span className="text-[8px] text-gray-500">Empty-{actualRowIdx}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {grabberModalOpen && (
        <SVDWGrabberConfigModal
          open={grabberModalOpen}
          grabberId={activeGrabber}
          onClose={() => setGrabberModalOpen(false)}
          onStatusChange={(status) => setGrabberStatus(prev => ({ ...prev, [activeGrabber]: status }))}
        />
      )}

      {blenderOpen && (
        <SVDWBlenderConfigModal
          open={blenderOpen}
          onClose={() => setBlenderOpen(false)}
          onStatusChange={setBlenderStatus}
        />
      )}

      {videoModalOpen && (
        <VideoSimpleStatusModal
          open={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          title={videoModalTitle}
        />
      )}
    </div>
  );
};