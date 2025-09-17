import React from 'react';
import { CIEDConfigModal } from './CIEDConfigModal';

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

  const [openMain, setOpenMain] = React.useState(false);
  const [initialWindow, setInitialWindow] = React.useState<number | undefined>(undefined);

  const openWithWindow = (idx?: number) => {
    setInitialWindow(idx);
    setOpenMain(true);
  };

  return (
    <div className="bg-gray-700 border-2 border-gray-500 rounded-lg shadow text-gray-200">
      <div className="flex gap-1 p-1 border-b border-gray-500 rounded-t">
        {slotColors.map((color, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => openWithWindow(idx)}
            className="w-6 h-6 flex items-center justify-center rounded text-[10px] font-semibold border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-150 hover:border-white hover:ring-2 hover:ring-white"
            style={{ backgroundColor: color, borderColor: '#374151', color: '#111827' }}
            aria-label={`Open CIED window ${idx}`}
            title={`CIED ${idx}`}
          >
            {idx}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => openWithWindow(undefined)}
        className="w-full py-2 text-center font-semibold text-xs text-gray-200 rounded-b hover:border-white hover:ring-2 hover:ring-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        style={{ borderTop: '1px solid #6b7280' }}
        title="Open CIED configuration"
      >
        CIED
      </button>

      <CIEDConfigModal
        open={openMain}
        initialWindow={initialWindow}
        onSave={() => setOpenMain(false)}
        onClose={() => setOpenMain(false)}
      />
    </div>
  );
};
