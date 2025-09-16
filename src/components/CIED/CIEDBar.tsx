import React from 'react';

export const CIEDBar: React.FC = () => {
  const slotColors = [
    '#bfdbfe', // 0 light blue
    '#d1fae5', // 1 light green
    '#fecaca', // 2 light red
    '#fde68a', // 3 light orange
    '#7c3aed', // 4 purple
    '#16a34a', // 5 green
    '#38bdf8', // 6 sky
    '#ec4899', // 7 pink
    '#64748b', // 8 slate/olive-like
    '#92400e', // 9 brown
  ];

  return (
    <div className="bg-gray-100 border border-gray-500 rounded shadow min-w-[220px]">
      <div className="flex gap-1 p-1 border-b border-gray-400 rounded-t">
        {slotColors.map((color, idx) => (
          <div
            key={idx}
            className="w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold border"
            style={{ backgroundColor: color, borderColor: '#374151', color: '#111827' }}
          >
            {idx}
          </div>
        ))}
      </div>
      <div className="py-2 text-center font-semibold text-gray-700">CIED</div>
    </div>
  );
};
