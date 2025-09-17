import React from 'react';
import { channelHex } from '@/utils/channelPalette';
import { CIEDConfigModal } from './CIEDConfigModal';

export const CIEDBar: React.FC = () => {
  const slotColors = channelHex;

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
            className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-semibold border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-150 hover:border-white hover:ring-2 hover:ring-white transform transition-transform hover:scale-110`}
            style={{ backgroundColor: color, borderColor: '#374151', color: '#111827' }}
            aria-label={`Open CIED window ${idx}`}
            title={`CIED ${idx}`}
            data-connection-point={`cied-slot-${idx}`}
          >
            {idx}
          </button>
        ))}
      </div>
      <div
        className="w-full py-2 text-center text-sm font-semibold text-purple-400 rounded-b"
        style={{ borderTop: '1px solid #6b7280' }}
      >
        CIED
      </div>

      <CIEDConfigModal
        open={openMain}
        initialWindow={initialWindow}
        onSave={() => setOpenMain(false)}
        onClose={() => setOpenMain(false)}
      />
    </div>
  );
};
