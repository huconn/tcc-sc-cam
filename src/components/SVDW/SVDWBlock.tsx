import React, { useEffect, useRef, useState } from 'react';

export const SVDWBlock: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Dot refs for grabber side (right boxes) and blender side (left markers)
  const grabberDotsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const blenderDotsRef = useRef<Array<HTMLSpanElement | null>>([]);

  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      const newLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

      for (let i = 0; i < 4; i += 1) {
        const aDot = grabberDotsRef.current[i];
        const bDot = blenderDotsRef.current[i];
        if (!aDot || !bDot) continue;
        const aRect = aDot.getBoundingClientRect();
        const bRect = bDot.getBoundingClientRect();
        const x1 = aRect.left - cRect.left + aRect.width / 2;
        const y1 = aRect.top - cRect.top + aRect.height / 2;
        // Use right edge of blender marker container so the tip of the triangle is the endpoint
        const x2 = bRect.right - cRect.left;
        const y2 = bRect.top - cRect.top + bRect.height / 2;
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
    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 relative inline-block max-w-full overflow-visible">
      {/* SVDW Title */}
      <div className="text-center font-semibold text-lg mb-4 text-black">SVDW</div>
      
      {/* Two-column layout: left Grabbers, right Blender */}
      <div ref={containerRef} className="relative pr-[200px]">
        {/* Right Blender spanning full stack height */}
        <div className="absolute top-0 bottom-0 right-0 flex items-center">
          <div className="relative bg-teal-700 text-white border border-gray-800 rounded w-[120px] h-full flex items-center justify-center text-sm font-medium">
            Blender
            {/* Left edge indicator boxes (1-2, 2-2, 3-2, 4-2) aligned per row */}
            <div className="absolute left-0 top-0 -translate-x-1/2 h-full flex flex-col gap-4">
              {[0,1,2,3].map((idx) => (
                <div key={idx} className="h-10 flex items-center">
                  <div
                    className="relative bg-orange-500 text-white border border-gray-800 rounded w-8 h-6 flex items-center justify-center text-xs font-bold"
                  >
                    {`${idx+1}-2`}
                    <span
                      ref={(el) => { blenderDotsRef.current[idx] = el; }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2"
                    >
                      {/* right-pointing arrowhead */}
                      <span
                        className="absolute right-0 top-1/2 -translate-y-1/2"
                        style={{
                          width: 0,
                          height: 0,
                          borderTop: '4px solid transparent',
                          borderBottom: '4px solid transparent',
                          borderLeft: '8px solid #3b82f6',
                        }}
                      />
                    </span>
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
              <div className="absolute right-full top-1/2 translate-x-1/2 -translate-y-1/2 z-10 bg-orange-500 text-white border border-gray-800 rounded w-8 h-6 flex items-center justify-center text-xs font-bold">
                {`${idx+1}-1`}
              </div>

              {/* Main Grabber block */}
              <div className="bg-teal-700 text-white border border-gray-800 rounded px-6 h-10 flex items-center text-sm font-medium min-w-[120px] text-center">
                Grabber
              </div>

              {/* Right number indicator (centered on border, shifted left) */}
              <div className="absolute top-1/2 -translate-y-1/2 z-10 bg-orange-500 text-white border border-gray-800 rounded w-8 h-6 flex items-center justify-center text-xs font-bold" style={{ left: 'calc(100% - 36px)', transform: 'translate(-50%, -50%)' }}>
                {`${idx+1}-2`}
                <span ref={(el) => { grabberDotsRef.current[idx] = el; }} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Overlay SVG connecting lines for 1-2..4-2 */}
        {lines.length > 0 && (
          <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
            {lines.map((p, i) => (
              <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="#3b82f6" strokeWidth={3} strokeLinecap="round" />
            ))}
          </svg>
        )}
      </div>

    </div>
  );
};