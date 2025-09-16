import React from 'react';

export const CIEDBar: React.FC = () => {
  const slotColors = [
    '#93c5fd', // 0 blue-300
    '#a7f3d0', // 1 green-200
    '#fecaca', // 2 red-200
    '#fde68a', // 3 yellow-300
    '#a78bfa', // 4 purple-300
    '#34d399', // 5 emerald-400
    '#60a5fa', // 6 blue-400
    '#f472b6', // 7 pink-400
    '#64748b', // 8 slate
    '#92400e', // 9 brown
  ];

  return (
    <div className="bg-gray-700 border-2 border-gray-500 rounded-lg shadow text-gray-200">
      <div className="flex gap-1 p-1 border-b border-gray-500 rounded-t">
        {slotColors.map((color, idx) => (
          <div
            key={idx}
            className="w-6 h-6 flex items-center justify-center rounded text-[10px] font-semibold border"
            style={{ backgroundColor: color, borderColor: '#374151', color: '#111827' }}
          >
            {idx}
          </div>
        ))}
      </div>
      <div className="py-2 text-center font-semibold text-xs text-gray-200">CIED</div>
    </div>
  );
};
