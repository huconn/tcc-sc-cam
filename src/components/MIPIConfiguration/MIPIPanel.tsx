import React from 'react';
import { Activity, ChevronRight } from 'lucide-react';
import { useCameraStore } from '@/store/cameraStore';
import { MIPIChannelCard } from './MIPIChannelCard';

export const MIPIPanel: React.FC = () => {
  const { mipiChannels, viewMode } = useCameraStore();

  const filteredChannels = mipiChannels.filter(channel => {
    if (viewMode === 'unified') return true;
    if (viewMode === 'main') return channel.core === 'main' || channel.core === 'none';
    if (viewMode === 'sub') return channel.core === 'sub' || channel.core === 'none';
    return false;
  });

  return (
    <div className="bg-gray-850 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary-400" />
        <h2 className="text-lg font-semibold">MIPI CSI-2 Configuration</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredChannels.map((channel) => (
          <MIPIChannelCard key={channel.id} channel={channel} />
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded-lg">
        <div className="flex items-start gap-2">
          <ChevronRight className="w-4 h-4 text-gray-500 mt-0.5" />
          <div className="text-xs text-gray-400">
            <p>Each MIPI interface supports up to 4 Virtual Channels</p>
            <p className="mt-1">Configure data lanes, HS-settle values, and interleave mode for each channel</p>
          </div>
        </div>
      </div>
    </div>
  );
};