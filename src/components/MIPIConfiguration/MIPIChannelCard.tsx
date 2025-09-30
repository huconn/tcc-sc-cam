import React from 'react';
import { MIPIChannel } from '@/types/camera';
import { useCameraStore } from '@/store/cameraStore';
import { CameraController } from '@/controllers/CameraController';
import clsx from 'clsx';

interface MIPIChannelCardProps {
  channel: MIPIChannel;
}

export const MIPIChannelCard: React.FC<MIPIChannelCardProps> = ({ channel }) => {
  const viewMode = useCameraStore(s => s.viewMode);
  const debugShowLayoutBorders = useCameraStore((s: any) => s.debugShowLayoutBorders ?? false);

  const handleCoreChange = (core: 'main' | 'sub' | 'none') => {
    const result = CameraController.updateMIPIChannel(channel.id, { core, enabled: core !== 'none' });
    
    if (!result.isValid) {
      console.error('Validation failed:', result.errors);
      alert(`Failed to update MIPI channel: ${result.errors[0]?.message}`);
    }
  };

  const isEditable = viewMode !== 'unified';
  const showMainCheckbox = viewMode === 'main' || viewMode === 'unified';
  const showSubCheckbox = viewMode === 'sub' || viewMode === 'unified';

  return (
    <div className={clsx(
      'card p-4 relative',
      channel.enabled && 'border-primary-500',
      debugShowLayoutBorders && 'debug'
    )}>
      {debugShowLayoutBorders && (
        <span className="absolute -top-3 -left-3 bg-green-700 text-white text-[10px] px-1.5 py-0.5 rounded">MIPI</span>
      )}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-base">{channel.name}</h3>
        <div className="flex items-center gap-3">
          {showMainCheckbox && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channel.core === 'main'}
                onChange={() => handleCoreChange(channel.core === 'main' ? 'none' : 'main')}
                disabled={!isEditable}
                className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-300">Main</span>
            </label>
          )}
          {showSubCheckbox && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channel.core === 'sub'}
                onChange={() => handleCoreChange(channel.core === 'sub' ? 'none' : 'sub')}
                disabled={!isEditable}
                className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-300">Sub</span>
            </label>
          )}
        </div>
      </div>

      {channel.enabled && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Virtual Channels</label>
              <select
                value={channel.virtualChannels}
                onChange={(e) => updateMIPIChannel(channel.id, { virtualChannels: parseInt(e.target.value) })}
                className="input text-sm w-full"
              >
                {[1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Data Lanes</label>
              <select
                value={channel.dataLanes}
                onChange={(e) => updateMIPIChannel(channel.id, { dataLanes: parseInt(e.target.value) })}
                className="input text-sm w-full"
              >
                {[1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">HS-Settle</label>
              <input
                type="number"
                value={channel.hsSettle}
                onChange={(e) => updateMIPIChannel(channel.id, { hsSettle: parseInt(e.target.value) })}
                className="input text-sm w-full"
                min="0"
                max="255"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Pixel Mode</label>
              <select
                value={channel.pixelMode}
                onChange={(e) => updateMIPIChannel(channel.id, { pixelMode: e.target.value })}
                className="input text-sm w-full"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={channel.interleaveMode}
              onChange={(e) => updateMIPIChannel(channel.id, { interleaveMode: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-300">Interleave Mode</span>
          </label>
        </div>
      )}
    </div>
  );
};