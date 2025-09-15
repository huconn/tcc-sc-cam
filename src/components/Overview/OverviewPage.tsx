import React, { useState } from 'react';
import { Camera, Eye, Monitor, Cpu } from 'lucide-react';
import { MainCoreView } from './MainCoreView';
import { ExternalDevicePopup } from './ExternalDevicePopup';
import { useCameraStore } from '@/store/cameraStore';
import { ViewMode } from '@/types/camera';
import clsx from 'clsx';

export const OverviewPage: React.FC = () => {
  const { externalDevices, setExternalDevices, viewMode, setViewMode } = useCameraStore();
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

  const handleDeviceSelect = (mipi: 'mipi0' | 'mipi1', deviceData: any) => {
    // Store device data in the global store
    setExternalDevices(mipi, deviceData);

    // Update local state for backward compatibility
    if (deviceData && deviceData.devices) {
      setSelectedDevices(prev => ({
        ...prev,
        [mipi]: deviceData.devices.map((d: any) => d.id)
      }));
    }
  };

  const openDevicePopup = (mipi: 'mipi0' | 'mipi1') => {
    setShowDevicePopup({ show: true, mipi });
  };

  const closeDevicePopup = () => {
    setShowDevicePopup({ show: false, mipi: null });
  };

  const modes: Array<{ value: ViewMode; label: string; icon: React.ReactNode }> = [
    {
      value: 'unified',
      label: 'Unified View',
      icon: <Eye className="w-4 h-4" />
    },
    {
      value: 'main',
      label: 'Main Core',
      icon: <Monitor className="w-4 h-4" />
    },
    {
      value: 'sub',
      label: 'Sub Core',
      icon: <Cpu className="w-4 h-4" />
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Camera className="w-6 h-6 text-primary-500" />
            <h1 className="text-xl font-bold text-gray-100">Camera Path Overview</h1>
            <span className="text-sm text-gray-400">TCC807x (Dolphin5)</span>
          </div>
          {/* View Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-400 mr-2">View Mode:</span>
            {modes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value)}
                className={clsx(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-sm',
                  viewMode === mode.value
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                )}
              >
                {mode.icon}
                <span className="font-medium">{mode.label}</span>
              </button>
            ))}
          </div>
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
          savedDevices={externalDevices?.[showDevicePopup.mipi] || []}
          onSelect={handleDeviceSelect}
          onClose={closeDevicePopup}
        />
      )}
    </div>
  );
};
