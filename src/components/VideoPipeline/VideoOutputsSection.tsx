import React from 'react';
import { VideoOutputConfigModal, VideoOutputStatus, ToggleOption } from './VideoOutputConfigModal';

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
      className="relative flex items-center bg-gray-700 text-gray-200 border-2 border-gray-500 rounded px-4 py-2 w-[460px] shadow-sm text-xs font-semibold hover:border-white hover:ring-1 hover:ring-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors transform transition-transform hover:scale-105"
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

export const VideoOutputsSection: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [initial, setInitial] = React.useState<{ status?: VideoOutputStatus; receiveIr?: ToggleOption; irEncoding?: ToggleOption }>({});

  const handleOpen = (t: string) => {
    setTitle(t);
    setInitial({ status: 'okay', receiveIr: 'enable', irEncoding: 'enable' });
    setOpen(true);
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <OutputRow label="VWDMA0" colorTop="#6d28d9" colorBottom="#4d7c57" onClick={() => handleOpen('VWDMA0')} connectionId="video-out-vwdma0" />
      <OutputRow label="VWDMA1" colorTop="#65a30d" colorBottom="#92400e" onClick={() => handleOpen('VWDMA1')} connectionId="video-out-vwdma1" />
      <OutputRow label="VIN0" colorTop="#2563eb" onClick={() => handleOpen('VIN0')} connectionId="video-out-vin0" />
      <OutputRow label="VIN1" colorTop="#db2777" onClick={() => handleOpen('VIN1')} connectionId="video-out-vin1" />
      <OutputRow label="MDW" onClick={() => handleOpen('MDW')} connectionId="video-out-mdw" />

      <VideoOutputConfigModal
        open={open}
        title={title}
        initial={initial}
        onSave={() => setOpen(false)}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};
