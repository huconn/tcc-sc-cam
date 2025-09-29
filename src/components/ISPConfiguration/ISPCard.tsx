import React from 'react';
import { ISPConfig } from '@/types/camera';
import { useCameraStore } from '@/store/cameraStore';
import clsx from 'clsx';

interface ISPCardProps {
  isp: ISPConfig;
}

const cfaOptions = [
  { value: 0, label: 'RGGB' },
  { value: 1, label: 'Not used' },
  { value: 2, label: 'Not used' },
  { value: 3, label: 'RGBIR' },
];

export const ISPCard: React.FC<ISPCardProps> = ({ isp }) => {
  const { updateISPConfig, viewMode } = useCameraStore();
  const debugShowLayoutBorders = useCameraStore((s: any) => s.debugShowLayoutBorders ?? false);

  const handleCoreChange = (core: 'main' | 'sub' | 'none') => {
    updateISPConfig(isp.id, { core, enabled: core !== 'none' });
  };

  const isEditable = viewMode !== 'unified';
  const showMainCheckbox = viewMode === 'main' || viewMode === 'unified';
  const showSubCheckbox = viewMode === 'sub' || viewMode === 'unified';
  const canUseRGBIR = isp.id === 'isp1' || isp.id === 'isp3';

  return (
    <div className={clsx(
      'card p-3 relative',
      isp.enabled && 'border-primary-500',
      debugShowLayoutBorders && 'debug'
    )}>
      {debugShowLayoutBorders && (
        <span className="absolute -top-3 -left-3 bg-yellow-700 text-white text-[10px] px-1.5 py-0.5 rounded">ISP</span>
      )}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{isp.name}</h3>
        <div className={clsx(
          'w-2 h-2 rounded-full',
          isp.enabled ? 'bg-green-500' : 'bg-gray-600'
        )} />
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          {showMainCheckbox && (
            <label className="flex items-center gap-1 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isp.core === 'main'}
                onChange={() => handleCoreChange(isp.core === 'main' ? 'none' : 'main')}
                disabled={!isEditable}
                className="w-3 h-3 text-primary-600 bg-gray-800 border-gray-600 rounded"
              />
              <span>Main</span>
            </label>
          )}
          {showSubCheckbox && (
            <label className="flex items-center gap-1 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isp.core === 'sub'}
                onChange={() => handleCoreChange(isp.core === 'sub' ? 'none' : 'sub')}
                disabled={!isEditable}
                className="w-3 h-3 text-primary-600 bg-gray-800 border-gray-600 rounded"
              />
              <span>Sub</span>
            </label>
          )}
        </div>

        {isp.enabled && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">CFA</label>
              <select
                value={isp.cfa}
                onChange={(e) => updateISPConfig(isp.id, { cfa: parseInt(e.target.value) as 0 | 1 | 2 | 3 })}
                className="input text-xs w-full"
              >
                {cfaOptions.map(opt => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.value === 3 && !canUseRGBIR}
                  >
                    {opt.label}
                    {opt.value === 3 && !canUseRGBIR && ' (N/A)'}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-1 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isp.memorySharing}
                onChange={(e) => updateISPConfig(isp.id, { memorySharing: e.target.checked })}
                className="w-3 h-3 text-primary-600 bg-gray-800 border-gray-600 rounded"
              />
              <span>Memory Sharing</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isp.bypassMode}
                onChange={(e) => updateISPConfig(isp.id, { bypassMode: e.target.checked })}
                className="w-3 h-3 text-primary-600 bg-gray-800 border-gray-600 rounded"
              />
              <span>Bypass Mode</span>
            </label>
          </>
        )}
      </div>
    </div>
  );
};