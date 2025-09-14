import React, { useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { Device, Connection } from '@/types/camera';
import { useCameraStore } from '@/store/cameraStore';
import { DraggableDevice } from './DraggableDevice';
import { ConnectionLine } from './ConnectionLine';

export const DragDropCanvas: React.FC = () => {
  const { devices, connections, updateDevice, addConnection, removeConnection } = useCameraStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [tempConnection, setTempConnection] = React.useState<{ from: string; to: { x: number; y: number } } | null>(null);

  const [, drop] = useDrop(() => ({
    accept: 'device',
    drop: (item: { device: Device }, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        updateDevice(item.device.id, {
          position: {
            x: offset.x - rect.left,
            y: offset.y - rect.top
          }
        });
      }
    }
  }));

  const handleConnectionStart = useCallback((deviceId: string, point: { x: number; y: number }) => {
    setTempConnection({ from: deviceId, to: point });
  }, []);

  const handleConnectionEnd = useCallback((targetId: string) => {
    if (tempConnection && targetId !== tempConnection.from) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        sourceId: tempConnection.from,
        sourcePort: 'out',
        targetId: targetId,
        targetPort: 'in'
      };
      addConnection(newConnection);
    }
    setTempConnection(null);
  }, [tempConnection, addConnection]);

  const handleConnectionCancel = useCallback(() => {
    setTempConnection(null);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (tempConnection && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setTempConnection({
        ...tempConnection,
        to: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      });
    }
  }, [tempConnection]);

  return (
    <div
      ref={(node) => {
        canvasRef.current = node;
        drop(node);
      }}
      className="relative w-full h-full bg-gray-900 overflow-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleConnectionCancel}
    >
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />

      <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
        {connections.map(conn => {
          const source = devices.find(d => d.id === conn.sourceId);
          const target = devices.find(d => d.id === conn.targetId);
          if (source && target) {
            return (
              <ConnectionLine
                key={conn.id}
                from={source.position}
                to={target.position}
                connectionId={conn.id}
              />
            );
          }
          return null;
        })}

        {tempConnection && (
          <line
            x1={devices.find(d => d.id === tempConnection.from)?.position.x || 0}
            y1={devices.find(d => d.id === tempConnection.from)?.position.y || 0}
            x2={tempConnection.to.x}
            y2={tempConnection.to.y}
            stroke="#60a5fa"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}
      </svg>

      {devices.map(device => (
        <DraggableDevice
          key={device.id}
          device={device}
          onConnectionStart={handleConnectionStart}
          onConnectionEnd={handleConnectionEnd}
        />
      ))}

      {devices.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <p className="text-lg mb-2">Canvas is empty</p>
            <p className="text-sm">Add devices from the External Devices panel</p>
          </div>
        </div>
      )}
    </div>
  );
};