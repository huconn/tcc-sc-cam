import React, { useState } from 'react';
import { Camera, Wifi, Link, Cpu, Plus, Settings } from 'lucide-react';
import { DeviceType, Device } from '@/types/camera';
import { useCameraStore } from '@/store/cameraStore';
import { DeviceCard } from './DeviceCard';
import clsx from 'clsx';

const deviceTypes: Array<{ type: DeviceType; label: string; icon: React.ReactNode }> = [
  { type: 'sensor', label: 'Camera Sensor', icon: <Camera className="w-5 h-5" /> },
  { type: 'serializer', label: 'Serializer', icon: <Wifi className="w-5 h-5" /> },
  { type: 'deserializer', label: 'Deserializer', icon: <Link className="w-5 h-5" /> },
  { type: 'external-isp', label: 'External ISP', icon: <Cpu className="w-5 h-5" /> },
];

export const DevicePanel: React.FC = () => {
  const { devices, addDevice } = useCameraStore();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleAddDevice = (type: DeviceType) => {
    const newDevice: Device = {
      id: `device-${Date.now()}`,
      type,
      name: `New ${type}`,
      position: { x: 100 + devices.length * 50, y: 100 + devices.length * 50 },
      properties: {},
    };
    addDevice(newDevice);
    setShowAddMenu(false);
  };

  return (
    <div className="w-80 bg-gray-850 border-r border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-100">External Devices</h2>
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="p-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              title="Add Device"
            >
              <Plus className="w-5 h-5" />
            </button>
            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10">
                {deviceTypes.map((dt) => (
                  <button
                    key={dt.type}
                    onClick={() => handleAddDevice(dt.type)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {dt.icon}
                    <span className="text-sm">{dt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">Drag devices to canvas to connect</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {devices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No devices added yet</p>
              <p className="text-xs mt-1">Click + to add a device</p>
            </div>
          ) : (
            devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};