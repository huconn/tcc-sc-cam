import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { MainCoreView } from './MainCoreView';
import { ExternalDevicePopup } from './ExternalDevicePopup';
import { useCameraStore } from '@/store/cameraStore';

export const OverviewPage: React.FC = () => {
  const { externalDevices, setExternalDevices } = useCameraStore();
  const [selectedDevices, setSelectedDevices] = useState<{
    mipi0: string[];
    mipi1: string[];
  }>({
    mipi0: [],
    mipi1: []
  });
  const [showDevicePopup, setShowDevicePopup] = useState<{
    show: boolean;
    mipi: 'mipi0' | 'mipi1' | null;
  }>({ show: false, mipi: null });

  const handleDeviceSelect = (mipi: 'mipi0' | 'mipi1', devices: any[]) => {
    // Store devices in the global store
    setExternalDevices(mipi, devices);
    // Also update local state for backward compatibility
    setSelectedDevices(prev => ({
      ...prev,
      [mipi]: devices.map(d => d.id)
    }));
  };

  const openDevicePopup = (mipi: 'mipi0' | 'mipi1') => {
    setShowDevicePopup({ show: true, mipi });
  };

  const closeDevicePopup = () => {
    setShowDevicePopup({ show: false, mipi: null });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <Camera className="w-6 h-6 text-primary-500" />
          <h1 className="text-xl font-bold text-gray-100">Camera Path Overview</h1>
          <span className="text-sm text-gray-400">TCC807x (Dolphin5)</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <MainCoreView
          selectedDevices={selectedDevices}
          externalDevices={externalDevices}
          onDeviceClick={openDevicePopup}
        />
      </div>

      {/* External Device Popup */}
      {showDevicePopup.show && showDevicePopup.mipi && (
        <ExternalDevicePopup
          mipi={showDevicePopup.mipi}
          selectedDevices={selectedDevices[showDevicePopup.mipi]}
          onSelect={handleDeviceSelect}
          onClose={closeDevicePopup}
        />
      )}
    </div>
  );
};
