import React, { useRef, useEffect, useState } from 'react';
import { getChannelHex } from '@/utils/channelPalette';
import { SVDWGrabberConfigModal, SVDWGrabberStatus } from './SVDWGrabberConfigModal';
import { SVDWBlenderConfigModal, SVDWBlenderStatus } from './SVDWBlenderConfigModal';

interface SVDWBlockProps {
  cameraMuxMappings?: Record<number, number>;
}

export const SVDWBlock: React.FC<SVDWBlockProps> = ({ cameraMuxMappings = {} }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Grabber 버튼 색상 - VWDMA/VIN과 통일 (회색)
  const grabberBg = '#374151'; // gray-700
  
  // 연결 마커용 매핑된 색상
  const markerHex: string[] = [
    getChannelHex(cameraMuxMappings[0] ?? 0),
    getChannelHex(cameraMuxMappings[1] ?? 1),
    getChannelHex(cameraMuxMappings[2] ?? 2),
    getChannelHex(cameraMuxMappings[3] ?? 3),
  ];
  
  const grabberText = 'text-gray-200';
  const grabberBorder = 'border-2 border-gray-500';

  // Blender theme color
  const blenderBg = 'bg-purple-700';
  const blenderText = 'text-white';
  const blenderBorder = 'border-2 border-purple-400';

  // refs for line endpoints
  const grabberRightRefs = useRef<Array<HTMLDivElement | null>>([]);
  const blenderLeftRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeGrabber, setActiveGrabber] = useState<number>(0);
  const [grabberStatus, setGrabberStatus] = useState<Record<number, SVDWGrabberStatus>>({ 0: 'okay', 1: 'okay', 2: 'okay', 3: 'okay' });
  const [blenderOpen, setBlenderOpen] = useState<boolean>(false);
  const [blenderStatus, setBlenderStatus] = useState<SVDWBlenderStatus>('okay');

  useEffect(() => {
    const update = () => {
      const root = containerRef.current;
      if (!root) return;
      const rootRect = root.getBoundingClientRect();
      const newLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
      for (let i = 0; i < 4; i += 1) {
        const a = grabberRightRefs.current[i];
        const b = blenderLeftRefs.current[i];
        if (!a || !b) continue;
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        // Grabber 버튼의 오른쪽 끝에서 시작
        const x1 = aRect.left - rootRect.left + aRect.width;
        const y1 = aRect.top - rootRect.top + aRect.height / 2;
        const x2 = bRect.left - rootRect.left + bRect.width / 2;
        const y2 = bRect.top - rootRect.top + bRect.height / 2;
        newLines.push({ x1, y1, x2, y2 });
      }
      setLines(newLines);
    };
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', update);
    requestAnimationFrame(update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [cameraMuxMappings]);

  return (
    <div className="bg-gray-700 border-2 border-purple-500 rounded-lg p-4 relative w-full overflow-visible text-gray-200">
      {/* SVDW Title */}
      <div className="text-center font-semibold text-sm mb-3 text-purple-400">SVDW</div>
      
      {/* Two-column layout: left Grabbers, right Blender */}
      <div ref={containerRef} className="relative pr-[200px]">
        {/* Right Blender spanning full stack height */}
        <div className="absolute top-0 bottom-0 right-0 flex items-center">
          <button
            type="button"
            onClick={() => setBlenderOpen(true)}
            className={`relative ${blenderBg} ${blenderText} ${blenderBorder} rounded w-[120px] h-full flex items-center justify-center text-xs font-medium hover:border-white hover:ring-1 hover:ring-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors`}
            title="Configure Blender"
          >
            Blender
            {/* Left edge indicator boxes (1-2, 2-2, 3-2, 4-2) aligned per row */}
            <div className="absolute left-0 top-0 -translate-x-1/2 h-full flex flex-col gap-9">
              {[0,1,2,3].map((idx) => (
                <div key={idx} className="h-10 flex items-center">
                  <div
                      ref={(el) => { blenderLeftRefs.current[idx] = el; }}
                className="relative text-black rounded w-8 h-6 flex items-center justify-center text-[10px] font-semibold border-2 border-white"
                    style={{ backgroundColor: markerHex[idx] }}
                  >
                    {`CH${idx+1}`}
                  </div>
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* Left column: 4 Grabbers stacked */}
        <div className="flex flex-col items-start gap-9">
          {[0,1,2,3].map((idx) => (
            <div key={idx} className="relative grid grid-cols-[auto_2rem] items-center gap-0 h-10">
              {/* Left number indicator (x-1) */}
              <div
                className="absolute right-full top-1/2 translate-x-1/2 -translate-y-1/2 z-10 text-black rounded w-8 h-6 flex items-center justify-center text-[10px] font-semibold border border-gray-500"
                style={{ backgroundColor: markerHex[idx] }}
                data-connection-point={`svdw-left-${idx}`}
                
              >
                {`CH${idx+1}`}
              </div>

              {/* Main Grabber block */}
              <button
                ref={(el) => { grabberRightRefs.current[idx] = el; }}
                type="button"
                onClick={() => { setActiveGrabber(idx); setModalOpen(true); }}
                className={`${grabberText} ${grabberBorder} rounded px-4 h-10 flex items-center justify-center text-xs font-semibold min-w-[120px] text-center shadow-sm hover:border-white hover:ring-2 hover:ring-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors transform transition-transform hover:scale-110`}
                title={`Configure Grabber ${idx}`}
                style={{ backgroundColor: grabberBg }}
              >
                Grabber
              </button>
            </div>
          ))}
        </div>

        {/* SVG overlay with arrowheads */}
        {lines.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">
                <polygon points="0 0, 5 1.75, 0 3.5" fill="context-stroke" />
              </marker>
            </defs>
            <g transform="translate(-17,0)">
              {lines.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={markerHex[i]} strokeWidth={3} markerEnd="url(#arrowhead)" />
              ))}
            </g>
          </svg>
        )}
      </div>

      {/* Modal */}
      <SVDWGrabberConfigModal
        open={modalOpen}
        grabberIndex={activeGrabber}
        status={grabberStatus[activeGrabber]}
        onSave={(next) => { setGrabberStatus({ ...grabberStatus, [activeGrabber]: next.status }); setModalOpen(false); }}
        onClose={() => setModalOpen(false)}
      />

      <SVDWBlenderConfigModal
        open={blenderOpen}
        initial={{ status: blenderStatus }}
        onSave={(cfg) => { setBlenderStatus(cfg.status); setBlenderOpen(false); }}
        onClose={() => setBlenderOpen(false)}
      />
    </div>
  );
};