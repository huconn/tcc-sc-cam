import React from 'react';

interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  connectionId: string;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({ from, to, connectionId }) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="#60a5fa"
        strokeWidth="2"
      />
      <circle
        cx={from.x}
        cy={from.y}
        r="3"
        fill="#60a5fa"
      />
      <circle
        cx={to.x}
        cy={to.y}
        r="3"
        fill="#60a5fa"
      />
      <polygon
        points={`${midX - 5},${midY - 3} ${midX + 5},${midY} ${midX - 5},${midY + 3}`}
        fill="#60a5fa"
        transform={`rotate(${Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI}, ${midX}, ${midY})`}
      />
    </g>
  );
};