import React from 'react';
import { Aperture } from 'lucide-react';
import { useCameraStore } from '@/store/cameraStore';
import { ISPCard } from './ISPCard';

export const ISPPanel: React.FC = () => {
  const { ispConfigs, viewMode } = useCameraStore();

  const filteredISPs = ispConfigs.filter(isp => {
    if (viewMode === 'unified') return true;
    if (viewMode === 'main') return isp.core === 'main' || isp.core === 'none';
    if (viewMode === 'sub') return isp.core === 'sub' || isp.core === 'none';
    return false;
  });

  return (
    <div className="bg-gray-850 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Aperture className="w-5 h-5 text-primary-400" />
        <h2 className="text-lg font-semibold">ISP Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredISPs.map((isp) => (
          <ISPCard key={isp.id} isp={isp} />
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium mb-2">ISP Allocation Rules</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div>• MIPI0-CH0 / MIPI1-CH0 → ISP0</div>
          <div>• MIPI0-CH1 / MIPI1-CH1 → ISP1</div>
          <div>• MIPI0-CH2 / MIPI1-CH2 → ISP2</div>
          <div>• MIPI0-CH3 / MIPI1-CH3 → ISP3</div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Note: ISP1 and ISP3 support RGBIR (CFA=3)</p>
      </div>
    </div>
  );
};