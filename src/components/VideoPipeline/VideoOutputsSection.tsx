import React from 'react';
import { VideoSimpleStatusModal } from './VideoSimpleStatusModal';
import { getChannelHex } from '@/utils/channelPalette';

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

interface VideoOutputsSectionProps {
  cameraMuxMappings?: Record<number, number>;
}

export const VideoOutputsSection: React.FC<VideoOutputsSectionProps> = ({ cameraMuxMappings = {} }) => {
  const [openSimple, setOpenSimple] = React.useState(false);
  const [title, setTitle] = React.useState('');

  const handleOpen = (t: string) => {
    setTitle(t);
    setOpenSimple(true);
  };

  // 매핑된 Input 채널의 색상 사용
  const vwdma0Color = getChannelHex(cameraMuxMappings[4] ?? 4);
  const vwdma1Color = getChannelHex(cameraMuxMappings[5] ?? 5);
  const vin0Color = getChannelHex(cameraMuxMappings[6] ?? 6);
  const vin1Color = getChannelHex(cameraMuxMappings[7] ?? 7);

  return (
    <div className="flex flex-col items-start gap-9">
      <OutputRow label="VWDMA0" colorTop={vwdma0Color} onClick={() => handleOpen('VWDMA0')} connectionId="video-out-vwdma0" />
      <OutputRow label="VWDMA1" colorTop={vwdma1Color} onClick={() => handleOpen('VWDMA1')} connectionId="video-out-vwdma1" />
      <OutputRow label="VIN0" colorTop={vin0Color} onClick={() => handleOpen('VIN0')} connectionId="video-out-vin0" />
      <OutputRow label="VIN1" colorTop={vin1Color} onClick={() => handleOpen('VIN1')} connectionId="video-out-vin1" />
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
