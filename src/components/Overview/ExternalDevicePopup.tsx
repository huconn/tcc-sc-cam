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
  onPortClick: (deviceId: string, portIndex: number, isOutput: boolean) => void;
  isConnecting: boolean;
  connectionStart: { deviceId: string; port: number; isOutput: boolean } | null;
}> = ({ device, onRemove, onMove, onPortClick, isConnecting, connectionStart }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'device',
    item: { id: device.id, type: device.type, width: 150, height: 100 },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const isHighlighted = connectionStart && (
    (connectionStart.isOutput && device.inputs > 0 && connectionStart.deviceId !== device.id) ||
    (!connectionStart.isOutput && device.outputs > 0 && connectionStart.deviceId !== device.id)
  );

  const portSpacing = 20;
  const getPortYPosition = (index: number, total: number) => {
    if (total === 1) return 50; // Center if only one port
    const totalHeight = (total - 1) * portSpacing;
    const startY = 50 - totalHeight / 2;
    return startY + index * portSpacing;
  };

  return (
    <div
      ref={drag}
      className={`absolute ${device.color} text-white rounded-lg cursor-move min-w-[150px] select-none ${
        isDragging ? 'opacity-50' : ''
      } ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}`}
      style={{ left: device.x, top: device.y, height: '100px' }}
    >
      {/* Input ports - left side */}
      <div className="absolute -left-2 top-0 h-full flex flex-col justify-center">
        {Array.from({ length: device.inputs }, (_, i) => (
          <div
            key={`in-${i}`}
            onClick={(e) => {
              e.stopPropagation();
              onPortClick(device.id, i, false);
            }}
            className={`w-4 h-4 bg-gray-700 border-2 border-white rounded-full cursor-pointer hover:bg-blue-400 transition-colors ${
              connectionStart?.deviceId === device.id && !connectionStart.isOutput && connectionStart.port === i
                ? 'bg-blue-500 ring-2 ring-blue-300'
                : ''
            } ${!isConnecting ? 'cursor-default' : ''}`}
            style={{
              position: 'absolute',
              top: `${getPortYPosition(i, device.inputs)}%`,
              transform: 'translateY(-50%)'
            }}
            title={`Input ${i + 1}`}
          />
        ))}
      </div>

      <div className="p-3 h-full flex flex-col justify-center">
        <div className="flex justify-between items-start mb-2">
          <span className="font-semibold text-sm">{device.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(device.id);
            }}
            className="text-white hover:text-red-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs opacity-90">{device.model}</div>
      </div>

      {/* Output ports - right side */}
      <div className="absolute -right-2 top-0 h-full flex flex-col justify-center">
        {Array.from({ length: device.outputs }, (_, i) => (
          <div
            key={`out-${i}`}
            onClick={(e) => {
              e.stopPropagation();
              onPortClick(device.id, i, true);
            }}
            className={`w-4 h-4 bg-gray-700 border-2 border-white rounded-full cursor-pointer hover:bg-green-400 transition-colors ${
              connectionStart?.deviceId === device.id && connectionStart.isOutput && connectionStart.port === i
                ? 'bg-green-500 ring-2 ring-green-300'
                : ''
            } ${!isConnecting ? 'cursor-default' : ''}`}
            style={{
              position: 'absolute',
              top: `${getPortYPosition(i, device.outputs)}%`,
              transform: 'translateY(-50%)',
              right: '-8px'  // Adjusted to match input port positioning
            }}
            title={`Output ${i + 1}`}
          />
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

const ConnectionLine: React.FC<{
  connection: Connection;
  devices: Device[];
  onRemove?: (id: string) => void;
}> = ({ connection, devices, onRemove }) => {
  const fromDevice = devices.find(d => d.id === connection.from);
  const toDevice = devices.find(d => d.id === connection.to);

  if (!fromDevice || !toDevice) return null;

  const deviceHeight = 100;
  const portSpacing = 20;

  // Helper function to calculate port Y position
  const getPortYPosition = (index: number, total: number) => {
    if (total === 1) return 0.5; // Center if only one port
    const totalHeight = (total - 1) * portSpacing;
    const startY = 0.5 - totalHeight / deviceHeight / 2;
    return startY + (index * portSpacing) / deviceHeight;
  };

  // Output port position (right side of source device)
  const fromX = fromDevice.x + 150 + 2; // Device width + offset for port
  const fromYRatio = getPortYPosition(connection.fromPort, fromDevice.outputs);
  const fromY = fromDevice.y + deviceHeight * fromYRatio;

  // Input port position (left side of target device)
  const toX = toDevice.x - 2; // Offset for port
  const toYRatio = getPortYPosition(connection.toPort, toDevice.inputs);
  const toY = toDevice.y + deviceHeight * toYRatio;

  // Calculate control points for curved path
  const midX = (fromX + toX) / 2;
  const controlOffset = Math.min(Math.abs(toX - fromX) * 0.5, 100);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        width: '100%',
        height: '100%',
        overflow: 'visible'
      }}
    >
      <defs>
        <marker
          id={`arrowhead-${connection.id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#60A5FA" />
        </marker>
      </defs>
      <g>
        <path
          d={`M ${fromX} ${fromY} C ${fromX + controlOffset} ${fromY}, ${toX - controlOffset} ${toY}, ${toX} ${toY}`}
          stroke="#60A5FA"
          strokeWidth="3"
          fill="none"
          markerEnd={`url(#arrowhead-${connection.id})`}
          strokeDasharray="0"
          opacity="1"
        />
        {onRemove && (
          <circle
            cx={midX}
            cy={(fromY + toY) / 2}
            r="10"
            fill="#EF4444"
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-100"
            onClick={() => onRemove(connection.id)}
          >
            <title>Remove connection</title>
          </circle>
        )}
      </g>
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
  const [connectionStart, setConnectionStart] = useState<{ deviceId: string; port: number; isOutput: boolean } | null>(null);
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
    const offsetX = (item.width || 150) / 2;
    const offsetY = (item.height || 50) / 2;
    const adjustedX = Math.max(10, x - offsetX);
    const adjustedY = Math.max(10, y - offsetY);

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

  const handlePortClick = (deviceId: string, portIndex: number, isOutput: boolean) => {
    if (!isConnecting) return;

    if (!connectionStart) {
      // First click - select source port
      if (isOutput) {
        setConnectionStart({ deviceId, port: portIndex, isOutput: true });
      } else {
        setConnectionStart({ deviceId, port: portIndex, isOutput: false });
      }
    } else {
      // Second click - create connection
      if (connectionStart.deviceId === deviceId) {
        // Can't connect to same device
        setConnectionStart(null);
        return;
      }

      if (connectionStart.isOutput && !isOutput) {
        // Connect from output to input
        const existingConnection = connections.find(
          c => c.from === connectionStart.deviceId &&
               c.fromPort === connectionStart.port &&
               c.to === deviceId &&
               c.toPort === portIndex
        );

        if (!existingConnection) {
          const newConnection: Connection = {
            id: `conn-${Date.now()}`,
            from: connectionStart.deviceId,
            to: deviceId,
            fromPort: connectionStart.port,
            toPort: portIndex,
          };
          setConnections(prev => [...prev, newConnection]);
        }
      } else if (!connectionStart.isOutput && isOutput) {
        // Connect from input to output (reverse)
        const existingConnection = connections.find(
          c => c.from === deviceId &&
               c.fromPort === portIndex &&
               c.to === connectionStart.deviceId &&
               c.toPort === connectionStart.port
        );

        if (!existingConnection) {
          const newConnection: Connection = {
            id: `conn-${Date.now()}`,
            from: deviceId,
            to: connectionStart.deviceId,
            fromPort: portIndex,
            toPort: connectionStart.port,
          };
          setConnections(prev => [...prev, newConnection]);
        }
      }

      setConnectionStart(null);
    }
  };

  const removeConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId));
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
                {/* Render connections first so they appear behind devices */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'visible',
                    zIndex: 0
                  }}
                >
                  {connections.map(connection => {
                    const fromDevice = devices.find(d => d.id === connection.from);
                    const toDevice = devices.find(d => d.id === connection.to);

                    if (!fromDevice || !toDevice) return null;

                    const deviceHeight = 100;
                    const portSpacing = 20;

                    // Helper function to calculate port Y position
                    const getPortYPosition = (index: number, total: number) => {
                      if (total === 1) return 0.5;
                      const totalHeight = (total - 1) * portSpacing;
                      const startY = 0.5 - totalHeight / deviceHeight / 2;
                      return startY + (index * portSpacing) / deviceHeight;
                    };

                    // Output port position (right side of source device)
                    const fromX = fromDevice.x + 150 + 2;
                    const fromYRatio = getPortYPosition(connection.fromPort, fromDevice.outputs);
                    const fromY = fromDevice.y + deviceHeight * fromYRatio;

                    // Input port position (left side of target device)
                    const toX = toDevice.x - 2;
                    const toYRatio = getPortYPosition(connection.toPort, toDevice.inputs);
                    const toY = toDevice.y + deviceHeight * toYRatio;

                    // Calculate control points for curved path
                    const midX = (fromX + toX) / 2;
                    const controlOffset = Math.min(Math.abs(toX - fromX) * 0.5, 100);

                    return (
                      <g key={connection.id}>
                        <defs>
                          <marker
                            id={`arrowhead-${connection.id}`}
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon points="0 0, 10 3.5, 0 7" fill="#60A5FA" />
                          </marker>
                        </defs>
                        <path
                          d={`M ${fromX} ${fromY} C ${fromX + controlOffset} ${fromY}, ${toX - controlOffset} ${toY}, ${toX} ${toY}`}
                          stroke="#60A5FA"
                          strokeWidth="3"
                          fill="none"
                          markerEnd={`url(#arrowhead-${connection.id})`}
                        />
                        {!isConnecting && (
                          <circle
                            cx={midX}
                            cy={(fromY + toY) / 2}
                            r="10"
                            fill="#EF4444"
                            stroke="#fff"
                            strokeWidth="2"
                            className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-100"
                            onClick={() => removeConnection(connection.id)}
                          >
                            <title>Remove connection</title>
                          </circle>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Render devices on top */}
                {devices.map(device => (
                  <DraggableDevice
                    key={device.id}
                    device={device}
                    onRemove={removeDevice}
                    onMove={moveDevice}
                    onPortClick={handlePortClick}
                    isConnecting={isConnecting}
                    connectionStart={connectionStart}
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
                  onClick={() => {
                    setIsConnecting(!isConnecting);
                    setConnectionStart(null);
                  }}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    isConnecting
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isConnecting ? 'Exit Connection Mode' : 'Enter Connection Mode'}
                </button>
                {isConnecting && (
                  <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
                    {connectionStart ? (
                      <p className="text-yellow-400">
                        Now click on {connectionStart.isOutput ? 'an input' : 'an output'} port to complete the connection
                      </p>
                    ) : (
                      <p className="text-gray-400">
                        Click on any port to start a connection
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};