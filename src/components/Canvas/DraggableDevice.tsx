import React from 'react';
import { useDrag } from 'react-dnd';
import { Device } from '@/types/camera';
import { Camera, Wifi, Link, Cpu } from 'lucide-react';
import clsx from 'clsx';

interface DraggableDeviceProps {
  device: Device;
  onConnectionStart: (deviceId: string, point: { x: number; y: number }) => void;
  onConnectionEnd: (targetId: string) => void;
}

const deviceIcons = {
  sensor: Camera,
  serializer: Wifi,
  deserializer: Link,
  'external-isp': Cpu,
};

const deviceColors = {
  sensor: 'bg-green-900 border-green-600',
  serializer: 'bg-blue-900 border-blue-600',
  deserializer: 'bg-purple-900 border-purple-600',
  'external-isp': 'bg-orange-900 border-orange-600',
};

export const DraggableDevice: React.FC<DraggableDeviceProps> = ({
  device,
  onConnectionStart,
  onConnectionEnd
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'device',
    item: { device },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const Icon = deviceIcons[device.type];

  return (
    <div
      ref={drag}
      className={clsx(
        'absolute p-3 rounded-lg border-2 cursor-move transition-all',
        deviceColors[device.type],
        isDragging ? 'opacity-50' : 'opacity-100 hover:shadow-xl'
      )}
      style={{
        left: device.position.x - 50,
        top: device.position.y - 30,
        width: '100px',
        minHeight: '60px'
      }}
      onMouseUp={() => onConnectionEnd(device.id)}
    >
      <div className="flex flex-col items-center text-center">
        <Icon className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium truncate w-full">{device.name}</span>
      </div>

      {/* Connection ports */}
      <div
        className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary-500 rounded-full cursor-pointer hover:bg-primary-400"
        onMouseDown={(e) => {
          e.stopPropagation();
          onConnectionStart(device.id, { x: device.position.x + 50, y: device.position.y });
        }}
        title="Drag to connect"
      />
      <div
        className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary-500 rounded-full"
        title="Input port"
      />
    </div>
  );
};