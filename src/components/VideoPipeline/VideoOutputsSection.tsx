import React from 'react';
import { VideoSimpleStatusModal } from './VideoSimpleStatusModal';

type RowProps = {
  label: string;
  colorTop?: string;  // hex or tailwind color
  colorBottom?: string;
  onClick?: () => void;
  connectionId?: string; // data-connection-point id for line anchoring
};

const OutputRow: React.FC<RowProps> = ({ label, colorTop, colorBottom, onClick, connectionId }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center bg-gray-700 text-gray-200 border-2 border-gray-500 rounded px-4 py-2 w-full max-w-[460px] shadow-sm text-xs font-semibold hover:border-white hover:ring-1 hover:ring-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors transform transition-transform hover:scale-105"
      title={`Configure ${label}`}
      data-connection-point={connectionId}
    >
      {/* Inner left color markers (flush with left edge, full height) */}
      <div className="absolute left-0 top-0 bottom-0 w-5 flex flex-col overflow-hidden rounded-l">
        <div className="flex-1" style={{ backgroundColor: colorTop || 'transparent' }} />
        <div className="flex-1" style={{ backgroundColor: colorBottom || 'transparent' }} />
      </div>
      {/* Add left padding to avoid overlap with markers */}
      <div className="pl-7 w-full">
        <span className="block text-center text-sm font-semibold text-purple-400">{label}</span>
      </div>
    </button>
  );
};

interface VideoOutputsSectionProps {
  heightPx?: number;
}

export const VideoOutputsSection: React.FC<VideoOutputsSectionProps> = ({ heightPx }) => {
  const [openSimple, setOpenSimple] = React.useState(false);
  const [title, setTitle] = React.useState('');

  const handleOpen = (t: string) => {
    setTitle(t);
    setOpenSimple(true);
  };

  return (
    <div 
      className="flex flex-col items-start justify-between h-full"
      style={{ gap: heightPx ? `${Math.max(8, heightPx * 0.15)}px` : '36px' }}
    >
      <OutputRow label="VWDMA0" colorTop="#6d28d9" colorBottom="#4d7c57" onClick={() => handleOpen('VWDMA0')} connectionId="video-out-vwdma0" />
      <OutputRow label="VWDMA1" colorTop="#65a30d" colorBottom="#92400e" onClick={() => handleOpen('VWDMA1')} connectionId="video-out-vwdma1" />
      <OutputRow label="VIN0" colorTop="#2563eb" onClick={() => handleOpen('VIN0')} connectionId="video-out-vin0" />
      <OutputRow label="VIN1" colorTop="#db2777" onClick={() => handleOpen('VIN1')} connectionId="video-out-vin1" />
      <OutputRow label="MDW" onClick={() => handleOpen('MDW')} connectionId="video-out-mdw" />

      <VideoSimpleStatusModal
        open={openSimple}
        title={title}
        status={title === 'VWDMA0' || title === 'VWDMA1' ? 'disabled' : 'okay'}
        receiveIr={'enable'}
        irEncoding={'enable'}
        interruptDelay={'0x100'}
        axiMaxRo={'0xf'}
        axiMaxWo={'0xf'}
        defaultColor={'0x80808080'}
        fisheye={'disable'}
        colorEnable={'enable'}
        irEnable={'enable'}
        yuvStandard={'BT.601 JPEG'}
        onSave={() => setOpenSimple(false)}
        onClose={() => setOpenSimple(false)}
      />
    </div>
  );
};
