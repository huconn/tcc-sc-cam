import React from 'react';
import { VideoSimpleStatusModal } from './VideoSimpleStatusModal';
import { getChannelHex } from '@/utils/channelPalette';
import { useCameraStore } from '@/store/cameraStore';

type RowProps = {
  label: string;
  colorTop?: string;  // hex or tailwind color
  colorBottom?: string;
  onClick?: () => void;
  connectionId?: string; // data-connection-point id for line anchoring
};

const OutputRow: React.FC<RowProps> = ({ label, colorTop, colorBottom, onClick, connectionId }) => {
  const debugShowLayoutBorders = useCameraStore((s: any) => s.debugShowLayoutBorders ?? false);
  
  return (
    <div className={`relative flex items-center ${debugShowLayoutBorders ? 'debug' : ''}`}>
      {debugShowLayoutBorders && (
        <span className="absolute -top-3 -left-3 bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded z-10">OUTPUT-ROW</span>
      )}
      
      {/* Left marker box with 2x1 table */}
      <div 
        className={`relative ${debugShowLayoutBorders ? 'debug-cyan' : ''}`}
        data-connection-point={connectionId}
      >
        {debugShowLayoutBorders && (
          <span className="absolute -top-2 -left-2 bg-cyan-600 text-white text-[9px] px-1 py-0.5 rounded z-10">MARKER</span>
        )}
        <table className="border-collapse overflow-hidden">
          <tbody>
            {/* Top marker box */}
            <tr>
              <td 
                className={`relative w-8 h-[17px] border-[3px] border-r-0 border-b-0 border-gray-500 rounded-tl ${debugShowLayoutBorders ? 'debug-green' : ''}`}
                style={{ backgroundColor: colorTop || 'transparent' }}
              >
                {debugShowLayoutBorders && (
                  <span className="absolute top-0 left-0 bg-green-500 text-white text-[8px] px-0.5 rounded z-10">TOP</span>
                )}
              </td>
            </tr>
            {/* Bottom marker box */}
            <tr>
              <td 
                className={`relative w-8 h-[17px] border-[3px] border-r-0 border-t-0 border-gray-500 rounded-bl ${debugShowLayoutBorders ? 'debug-yellow' : ''}`}
                style={{ backgroundColor: colorBottom || 'transparent' }}
              >
                {debugShowLayoutBorders && (
                  <span className="absolute bottom-0 left-0 bg-yellow-500 text-white text-[8px] px-0.5 rounded z-10">BTM</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Main button */}
      <button
        type="button"
        onClick={onClick}
        className={`relative flex items-center justify-center bg-gray-700 text-gray-200 border-[3px] border-l-0 border-gray-500 rounded-tr rounded-br px-4 py-2 w-[440px] shadow-sm text-xs font-semibold hover:border-white hover:ring-1 hover:ring-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors transform transition-transform hover:scale-105 ${debugShowLayoutBorders ? 'debug-blue' : ''}`}
        title={`Configure ${label}`}
      >
        {debugShowLayoutBorders && (
          <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-[9px] px-1 py-0.5 rounded z-10">BTN</span>
        )}
        <span className="block text-center text-sm font-semibold text-purple-400 w-full">{label}</span>
      </button>
    </div>
  );
};

interface VideoOutputsSectionProps {
  cameraMuxMappings?: Record<number, number>;
}

export const VideoOutputsSection: React.FC<VideoOutputsSectionProps> = ({ cameraMuxMappings = {} }) => {
  const debugShowLayoutBorders = useCameraStore((s: any) => s.debugShowLayoutBorders ?? false);
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
    <div className={`relative flex flex-col items-start gap-9 ${debugShowLayoutBorders ? 'debug' : ''}`}>
      {debugShowLayoutBorders && (
        <span className="absolute -top-3 -left-3 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded z-10">VIDEO-OUTPUTS-SECTION</span>
      )}
      
      <OutputRow label="VWDMA0" colorTop={vwdma0Color} colorBottom={vwdma0Color} onClick={() => handleOpen('VWDMA0')} connectionId="video-out-vwdma0" />
      <OutputRow label="VWDMA1" colorTop={vwdma1Color} colorBottom={vwdma1Color} onClick={() => handleOpen('VWDMA1')} connectionId="video-out-vwdma1" />
      <OutputRow label="VIN0" colorTop={vin0Color} colorBottom={vin0Color} onClick={() => handleOpen('VIN0')} connectionId="video-out-vin0" />
      <OutputRow label="VIN1" colorTop={vin1Color} colorBottom={vin1Color} onClick={() => handleOpen('VIN1')} connectionId="video-out-vin1" />
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
