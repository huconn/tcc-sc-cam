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
  strokeDasharray?: string;
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

    return (
      <line
        key={`${connection.from}-${connection.to}`}
        x1={fromPoint.x}
        y1={fromPoint.y}
        x2={toPoint.x}
        y2={toPoint.y}
        stroke={connection.color || '#3b82f6'}
        strokeWidth={connection.strokeWidth || 2}
        strokeLinecap="round"
        strokeDasharray={connection.strokeDasharray}
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
