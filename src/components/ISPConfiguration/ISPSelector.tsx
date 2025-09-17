import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export type ChannelMode =
  | 'bypass'
  | 'isp0' | 'isp1' | 'isp2' | 'isp3'
  | 'isp4' | 'isp5' | 'isp6' | 'isp7';

interface ISPSelectorProps {
  value: ChannelMode;
  onChange: (next: ChannelMode) => void;
  color?: string;
  options?: ChannelMode[];
  showConfigButton?: boolean;
  onOpenConfig?: () => void;
}

const defaultOptions: ChannelMode[] = [
  'isp0','isp1','isp2','isp3','isp4','isp5','isp6','isp7','bypass'
];

export const ISPSelector: React.FC<ISPSelectorProps> = ({ value, onChange, color, options, showConfigButton, onOpenConfig }) => {
  const opts = options && options.length > 0 ? options : defaultOptions;
  return (
    <div className="bg-gray-700 border-2 rounded px-2 py-0.5 inline-flex items-center gap-1 transform transition-transform hover:scale-105" style={{ borderColor: color }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ChannelMode)}
        className="bg-transparent text-gray-200 text-xs font-semibold outline-none cursor-pointer"
      >
        {opts.map(o => (
          <option key={o} value={o} className="bg-gray-700 text-gray-200">
            {o.toUpperCase()}
          </option>
        ))}
      </select>
      {showConfigButton && (
        <button
          type="button"
          onClick={onOpenConfig}
          className="inline-flex items-center justify-center hover:bg-gray-600 rounded p-0.5"
        >
          <MoreHorizontal className="w-3 h-3 text-gray-300" />
        </button>
      )}
    </div>
  );
};


