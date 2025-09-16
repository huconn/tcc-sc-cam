import React, { useRef, useEffect, useState } from 'react';

export const SVDWBlock: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Distinct colors per Grabber (match channel palette feel)
  const grabberBg: string[] = [
    'bg-blue-600',
    'bg-emerald-600',
    'bg-orange-600',
    'bg-yellow-600',
  ];
  const grabberHex: string[] = ['#2563eb', '#059669', '#ea580c', '#ca8a04'];
  const grabberText = 'text-white';
  const grabberBorder = 'border-0';

  // Blender theme color
  const blenderBg = 'bg-purple-700';
  const blenderText = 'text-white';
  const blenderBorder = 'border-2 border-purple-400';

  // refs for line endpoints
  const grabberRightRefs = useRef<Array<HTMLDivElement | null>>([]);
  const blenderLeftRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);

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
        const x1 = aRect.left - rootRect.left + aRect.width / 2;
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
  }, []);

  return (
    <div className="bg-gray-700 border-2 border-gray-500 rounded-lg p-4 relative inline-block max-w-full overflow-visible text-gray-200">
      {/* SVDW Title */}
      <div className="text-center font-semibold text-sm mb-3 text-purple-400">SVDW</div>
      
      {/* Two-column layout: left Grabbers, right Blender */}
      <div ref={containerRef} className="relative pr-[200px]">
        {/* Right Blender spanning full stack height */}
        <div className="absolute top-0 bottom-0 right-0 flex items-center">
          <div className={`relative ${blenderBg} ${blenderText} ${blenderBorder} rounded w-[120px] h-full flex items-center justify-center text-xs font-medium`}>
            Blender
            {/* Left edge indicator boxes (1-2, 2-2, 3-2, 4-2) aligned per row */}
            <div className="absolute left-0 top-0 -translate-x-1/2 h-full flex flex-col gap-4">
              {[0,1,2,3].map((idx) => (
                <div key={idx} className="h-10 flex items-center">
                  <div
                    ref={(el) => (blenderLeftRefs.current[idx] = el)}
                    className="relative text-white rounded w-8 h-6 flex items-center justify-center text-[10px] font-semibold border-2 border-white"
                    style={{ backgroundColor: grabberHex[idx] }}
                  >
                    {`${idx+1}-2`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left column: 4 Grabbers stacked */}
        <div className="flex flex-col items-start gap-4">
          {[0,1,2,3].map((idx) => (
            <div key={idx} className="relative grid grid-cols-[auto_2rem] items-center gap-0 h-10">
              {/* Left number indicator (x-1) */}
              <div
                className="absolute right-full top-1/2 translate-x-1/2 -translate-y-1/2 z-10 text-white rounded w-8 h-6 flex items-center justify-center text-[10px] font-semibold border-2 border-white"
                style={{ backgroundColor: grabberHex[idx] }}
              >
                {`${idx+1}-1`}
              </div>

              {/* Main Grabber block */}
              <div className={`${grabberBg[idx]} ${grabberText} ${grabberBorder} rounded px-4 h-10 flex items-center text-xs font-semibold min-w-[120px] text-center shadow-sm`}>
                Grabber
              </div>

              {/* Right number indicator (centered on border, shifted left) */}
              <div
                ref={(el) => (grabberRightRefs.current[idx] = el)}
                className="absolute top-1/2 -translate-y-1/2 z-10 text-white rounded w-8 h-6 flex items-center justify-center text-[10px] font-semibold border-2 border-white"
                style={{ left: 'calc(100% - 36px)', transform: 'translate(-50%, -50%)', backgroundColor: grabberHex[idx] }}
              >
                {`${idx+1}-2`}
              </div>
            </div>
          ))}
        </div>

        {/* SVG overlay with arrowheads */}
        {lines.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">
                <polygon points="0 0, 5 1.75, 0 3.5" fill="#93c5fd" />
              </marker>
            </defs>
            <g transform="translate(-17,0)">
              {lines.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#93c5fd" strokeWidth={3} markerEnd="url(#arrowhead)" />
              ))}
            </g>
          </svg>
        )}
      </div>

    </div>
  );
};