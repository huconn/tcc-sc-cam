import React from 'react';

type RowProps = {
  label: string;
  colorTop?: string;  // hex or tailwind color
  colorBottom?: string;
};

const OutputRow: React.FC<RowProps> = ({ label, colorTop, colorBottom }) => {
  return (
    <div className="relative flex items-center bg-gray-100 text-gray-900 border border-gray-800 rounded px-6 py-3 w-[460px] shadow-sm">
      {/* Inner left color markers (flush with left edge, full height) */}
      <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col overflow-hidden rounded-l">
        <div className="flex-1" style={{ backgroundColor: colorTop || 'transparent' }} />
        <div className="flex-1" style={{ backgroundColor: colorBottom || 'transparent' }} />
      </div>
      {/* Add left padding to avoid overlap with markers */}
      <div className="pl-8 w-full">
        <span className="block text-center font-semibold">{label}</span>
      </div>
    </div>
  );
};

export const VideoOutputsSection: React.FC = () => {
  return (
    <div className="flex flex-col items-start gap-4">
      <OutputRow label="VWDMA0" colorTop="#6d28d9" colorBottom="#4d7c57" />
      <OutputRow label="VWDMA1" colorTop="#65a30d" colorBottom="#92400e" />
      <OutputRow label="VIN0" colorTop="#2563eb" />
      <OutputRow label="VIN1" colorTop="#db2777" />
      <OutputRow label="MDW" />
    </div>
  );
};
