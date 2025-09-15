import React, { useState, useRef } from 'react';
import { X, Camera, Wifi, Settings, Plus, Edit, Trash2, ArrowRight } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface ExternalDevicePopupProps {
  mipi: 'mipi0' | 'mipi1';
  selectedDevices: string[];
  onSelect: (mipi: 'mipi0' | 'mipi1', devices: string[]) => void;
  onClose: () => void;
}

interface Device {
  id: string;
  type: 'sensor' | 'serializer' | 'deserializer' | 'converter' | 'soc';
  name: string;
  model: string;
  x: number;
  y: number;
  inputs: number;
  outputs: number;
  color: string;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  fromPort: number;
  toPort: number;
}

const deviceTypes = [
  { id: 'sensor', name: 'Camera Sensor', icon: Camera, color: 'bg-orange-500' },
  { id: 'serializer', name: 'Serializer', icon: Wifi, color: 'bg-blue-500' },
  { id: 'deserializer', name: 'Deserializer', icon: Settings, color: 'bg-purple-500' },
  { id: 'converter', name: 'Format Converter', icon: Settings, color: 'bg-yellow-500' },
  { id: 'soc', name: 'SoC', icon: Settings, color: 'bg-red-500' },
];

const deviceModels = {
  sensor: ['IMX219 (2MP)', 'IMX477 (12MP)', 'OV5640 (5MP)', 'AR1335 (13MP)'],
  serializer: ['MAX96701', 'MAX96705', 'DS90UB953', 'DS90UB954'],
  deserializer: ['MAX9286', 'MAX9288', 'DS90UB954', 'DS90UB960'],
  converter: ['ADV7280', 'ADV7282', 'TW9910', 'TW9912'],
  soc: ['TCC8050', 'TCC8051', 'TCC8052'],
};

const DraggableDevice: React.FC<{
  device: Device;
  onRemove: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}> = ({ device, onRemove, onMove }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'device',
    item: { id: device.id, type: device.type, width: 120, height: 100 },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`absolute ${device.color} text-white p-3 rounded-lg cursor-move min-w-[120px] select-none ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ left: device.x, top: device.y }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-semibold text-sm">{device.name}</span>
        <button
          onClick={() => onRemove(device.id)}
          className="text-white hover:text-red-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="text-xs opacity-90 mb-2">{device.model}</div>
      
      {/* Input ports */}
      <div className="flex gap-1 mb-2">
        {Array.from({ length: device.inputs }, (_, i) => (
          <div key={`in-${i}`} className="w-3 h-3 bg-white rounded-sm" />
        ))}
      </div>
      
      {/* Output ports */}
      <div className="flex gap-1">
        {Array.from({ length: device.outputs }, (_, i) => (
          <div key={`out-${i}`} className="w-3 h-3 bg-white rounded-sm" />
        ))}
      </div>
    </div>
  );
};

const DeviceItem: React.FC<{ type: typeof deviceTypes[0]; onAdd: (type: string) => void }> = ({ type, onAdd }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'device-item',
    item: { type: type.id, id: null }, // id를 null로 명시적으로 설정
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`${type.color} text-white p-3 rounded-lg cursor-move select-none ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={() => onAdd(type.id)}
    >
      <div className="flex items-center gap-2">
        <type.icon className="w-5 h-5" />
        <span className="font-medium">{type.name}</span>
      </div>
    </div>
  );
};

const DroppableCanvas: React.FC<{ 
  children: React.ReactNode;
  onDrop: (x: number, y: number, item: any) => void;
}> = ({ children, onDrop }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [{ isOver }, drop] = useDrop({
    accept: ['device', 'device-item'],
    drop: (item: any, monitor) => {
      const clientOffset = monitor.getClientOffset();
      
      if (clientOffset && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = clientOffset.x - rect.left;
        const y = clientOffset.y - rect.top;
        onDrop(x, y, item);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drop(node);
        canvasRef.current = node;
      }}
      className={`relative w-full h-full border-2 border-dashed rounded-lg bg-gray-800 ${
        isOver ? 'border-blue-400 bg-blue-900 bg-opacity-20' : 'border-gray-600'
      }`}
    >
      {children}
    </div>
  );
};

const ConnectionLine: React.FC<{ connection: Connection; devices: Device[] }> = ({ connection, devices }) => {
  const fromDevice = devices.find(d => d.id === connection.from);
  const toDevice = devices.find(d => d.id === connection.to);
  
  if (!fromDevice || !toDevice) return null;

  const fromX = fromDevice.x + 120 + (connection.fromPort * 20);
  const fromY = fromDevice.y + 60;
  const toX = toDevice.x + (connection.toPort * 20);
  const toY = toDevice.y + 20;

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <path
        d={`M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${fromY - 20} ${toX} ${toY}`}
        stroke="#000"
        strokeWidth="3"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
        </marker>
      </defs>
    </svg>
  );
};

export const ExternalDevicePopup: React.FC<ExternalDevicePopupProps> = ({
  mipi,
  selectedDevices,
  onSelect,
  onClose,
}) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedType, setSelectedType] = useState<string>('sensor');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ deviceId: string; port: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addDevice = (type: string, x?: number, y?: number) => {
    const deviceType = deviceTypes.find(dt => dt.id === type);
    if (!deviceType) return;

    const models = deviceModels[type as keyof typeof deviceModels] || [];
    const model = selectedModel || models[0] || 'Default';
    
    const newDevice: Device = {
      id: `${type}-${Date.now()}`,
      type: type as Device['type'],
      name: deviceType.name,
      model,
      x: x !== undefined ? x : Math.random() * 400 + 50,
      y: y !== undefined ? y : Math.random() * 300 + 50,
      inputs: type === 'sensor' ? 0 : (type === 'soc' ? 1 : 2),
      outputs: type === 'soc' ? 0 : 1,
      color: deviceType.color,
    };

    setDevices(prev => [...prev, newDevice]);
  };

  const moveDevice = (id: string, x: number, y: number) => {
    setDevices(prev => prev.map(device => 
      device.id === id ? { ...device, x, y } : device
    ));
  };

  const handleCanvasDrop = (x: number, y: number, item: any) => {
    // Adjust position to center the device at the drop point
    const offsetX = (item.width || 120) / 2;
    const offsetY = (item.height || 50) / 2;
    const adjustedX = Math.max(0, x - offsetX);
    const adjustedY = Math.max(0, y - offsetY);

    if (item.type && !item.id) {
      // New device from device item (only if it doesn't have an id)
      addDevice(item.type, adjustedX, adjustedY);
    } else if (item.id) {
      // Move existing device
      moveDevice(item.id, adjustedX, adjustedY);
    }
  };

  const removeDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
  };

  const handleDeviceClick = (deviceId: string, port: number, isOutput: boolean) => {
    if (!isConnecting) {
      if (isOutput) {
        setIsConnecting(true);
        setConnectionStart({ deviceId, port });
      }
    } else {
      if (!isOutput && connectionStart) {
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          from: connectionStart.deviceId,
          to: deviceId,
          fromPort: connectionStart.port,
          toPort: port,
        };
        setConnections(prev => [...prev, newConnection]);
      }
      setIsConnecting(false);
      setConnectionStart(null);
    }
  };

  const handleSave = () => {
    const deviceIds = devices.map(d => d.id);
    onSelect(mipi, deviceIds);
    onClose();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg w-[90vw] h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">External Devices - {mipi.toUpperCase()}</h2>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Canvas Area */}
            <div className="flex-1 relative bg-gray-900 p-4">
              <div className="text-center mb-4">
                <div className="bg-blue-600 text-white p-3 rounded-lg inline-block">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    <span>Input port에서 Output port로 연결할 수 있는 인터페이스 제공 (drag & drop)</span>
                  </div>
                </div>
              </div>

              <DroppableCanvas onDrop={handleCanvasDrop}>
                {devices.map(device => (
                  <DraggableDevice
                    key={device.id}
                    device={device}
                    onRemove={removeDevice}
                    onMove={moveDevice}
                  />
                ))}
                
                {connections.map(connection => (
                  <ConnectionLine
                    key={connection.id}
                    connection={connection}
                    devices={devices}
                  />
                ))}
              </DroppableCanvas>
            </div>

            {/* Device Panel */}
            <div className="w-80 bg-gray-700 p-4 border-l border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4">Items</h3>
              
              <div className="bg-blue-600 text-white p-3 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-sm">센서 drag & drop 시 선택한 Sensor로 아이템 추가</span>
                </div>
              </div>

              {/* Device Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Device Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  {deviceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Model Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  {deviceModels[selectedType as keyof typeof deviceModels]?.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Add Device Button */}
              <button
                onClick={() => addDevice(selectedType)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors mb-4"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Device
              </button>

              {/* Device Items */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Available Devices</h4>
                {deviceTypes.map(type => (
                  <DeviceItem
                    key={type.id}
                    type={type}
                    onAdd={addDevice}
                  />
                ))}
              </div>

              {/* Connection Mode Toggle */}
              <div className="mt-6">
                <button
                  onClick={() => setIsConnecting(!isConnecting)}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    isConnecting 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-500'
                  }`}
                >
                  {isConnecting ? 'Exit Connection Mode' : 'Enter Connection Mode'}
                </button>
                {isConnecting && (
                  <p className="text-xs text-gray-400 mt-2">
                    Click output port first, then input port to connect
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};