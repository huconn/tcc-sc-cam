import React, { useRef, useEffect, useState } from 'react';

interface ConnectionPoint {
  x: number;
  y: number;
  id: string;
}

interface Connection {
  from: string;
  to: string;
  color?: string;
  strokeWidth?: number;
}

interface ConnectionLinesProps {
  connections: Connection[];
  containerRef: React.RefObject<HTMLDivElement>;
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({ 
  connections, 
  containerRef 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [connectionPoints, setConnectionPoints] = useState<Map<string, ConnectionPoint>>(new Map());

  // 컴포넌트 위치를 추적하는 함수
  const updateConnectionPoints = () => {
    if (!containerRef.current) return;

    const points = new Map<string, ConnectionPoint>();
    
    // 각 컴포넌트의 위치를 찾아서 저장
    const elements = containerRef.current.querySelectorAll('[data-connection-point]');
    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();
      
      const id = element.getAttribute('data-connection-point');
      if (id) {
        points.set(id, {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
          id
        });
      }
    });

    setConnectionPoints(points);
  };

  useEffect(() => {
    updateConnectionPoints();
    
    const handleResize = () => updateConnectionPoints();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 연결선을 그리는 함수
  const drawConnection = (connection: Connection) => {
    const fromPoint = connectionPoints.get(connection.from);
    const toPoint = connectionPoints.get(connection.to);
    
    if (!fromPoint || !toPoint) return null;

    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 베지어 곡선을 위한 제어점 계산
    const controlPoint1X = fromPoint.x + dx * 0.3;
    const controlPoint1Y = fromPoint.y;
    const controlPoint2X = toPoint.x - dx * 0.3;
    const controlPoint2Y = toPoint.y;

    return (
      <path
        key={`${connection.from}-${connection.to}`}
        d={`M ${fromPoint.x} ${fromPoint.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toPoint.x} ${toPoint.y}`}
        stroke={connection.color || '#3b82f6'}
        strokeWidth={connection.strokeWidth || 2}
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-300"
      />
    );
  };

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ overflow: 'visible' }}
    >
      {connections.map(connection => drawConnection(connection))}
    </svg>
  );
};

// 연결점을 표시하는 헬퍼 컴포넌트
interface ConnectionPointProps {
  id: string;
  position: 'left' | 'right' | 'top' | 'bottom';
  children: React.ReactNode;
}

export const ConnectionPoint: React.FC<ConnectionPointProps> = ({ 
  id, 
  position, 
  children 
}) => {
  const getPositionClass = () => {
    switch (position) {
      case 'left':
        return 'justify-start';
      case 'right':
        return 'justify-end';
      case 'top':
        return 'items-start';
      case 'bottom':
        return 'items-end';
      default:
        return 'justify-center';
    }
  };

  return (
    <div 
      data-connection-point={id}
      className={`flex ${getPositionClass()}`}
    >
      {children}
    </div>
  );
};
