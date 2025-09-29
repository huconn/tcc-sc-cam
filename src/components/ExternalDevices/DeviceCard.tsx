import React, { useState } from 'react';
import { Camera, Wifi, Link, Cpu, Settings, Trash2, Edit2 } from 'lucide-react';
import { Device } from '@/types/camera';
import { useCameraStore } from '@/store/cameraStore';
import clsx from 'clsx';

interface DeviceCardProps {
  device: Device;
}

const deviceIcons = {
  sensor: Camera,
  serializer: Wifi,
  deserializer: Link,
  'external-isp': Cpu,
};

export const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const { updateDevice, removeDevice } = useCameraStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(device.name);
  const Icon = deviceIcons[device.type];
  const debugShowLayoutBorders = useCameraStore((s: any) => s.debugShowLayoutBorders ?? false);

  const handleSaveName = () => {
    updateDevice(device.id, { name: editName });
    setIsEditing(false);
  };

  return (
    <div className={`card p-3 hover:shadow-xl transition-shadow relative ${debugShowLayoutBorders ? 'debug' : ''}`}>
      {debugShowLayoutBorders && (
        <span className="absolute -top-3 -left-3 bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded">DEVICE</span>
      )}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary-400" />
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
              className="input text-sm px-2 py-1"
              autoFocus
            />
          ) : (
            <span className="font-medium text-sm">{device.name}</span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Edit name"
          >
            <Edit2 className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => removeDevice(device.id)}
            className="p-1 hover:bg-red-900 rounded transition-colors"
            title="Delete device"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      <div className="space-y-1 text-xs">
        {device.i2cChannel && (
          <div className="flex justify-between">
            <span className="text-gray-500">I2C:</span>
            <span className="text-gray-300">{device.i2cChannel}</span>
          </div>
        )}
        {device.i2cAddress && (
          <div className="flex justify-between">
            <span className="text-gray-500">Address:</span>
            <span className="text-gray-300">{device.i2cAddress}</span>
          </div>
        )}
        {device.gpioReset && (
          <div className="flex justify-between">
            <span className="text-gray-500">Reset GPIO:</span>
            <span className="text-gray-300">{device.gpioReset}</span>
          </div>
        )}
      </div>

      <button className="w-full mt-3 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors flex items-center justify-center gap-2">
        <Settings className="w-3 h-3" />
        Configure
      </button>
    </div>
  );
};