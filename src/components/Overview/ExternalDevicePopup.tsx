import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Wifi, Settings, Plus, Edit, Trash2, ArrowRight } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DeviceConfigModal, DeviceConfig, DeviceProperty } from './DeviceConfigModal';

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
  config?: DeviceConfig;
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
  onDeviceClick: (device: Device) => void;
  connectionStart: { deviceId: string; port: number; isOutput: boolean } | null;
  connections: Connection[];
}> = ({ device, onRemove, onMove, onPortClick, onDeviceClick, connectionStart, connections }) => {
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

  // Check if a specific port is connected
  const isPortConnected = (portIndex: number, isOutput: boolean) => {
    return connections.some(conn => {
      if (isOutput) {
        return conn.from === device.id && conn.fromPort === portIndex;
      } else {
        return conn.to === device.id && conn.toPort === portIndex;
      }
    });
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
            className={`w-4 h-4 border-2 border-white rounded-full cursor-pointer transition-colors ${
              connectionStart?.deviceId === device.id && !connectionStart.isOutput && connectionStart.port === i
                ? 'bg-blue-500 ring-2 ring-blue-300'
                : isPortConnected(i, false)
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-700 hover:bg-blue-400'
            }`}
            style={{
              position: 'absolute',
              top: `${getPortYPosition(i, device.inputs)}%`,
              transform: 'translateY(-50%)'
            }}
            title={`Input ${i + 1}`}
          />
        ))}
      </div>

      <div
        className="p-3 h-full flex flex-col justify-center cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onDeviceClick(device);
        }}
      >
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
            className={`w-4 h-4 border-2 border-white rounded-full cursor-pointer transition-colors ${
              connectionStart?.deviceId === device.id && connectionStart.isOutput && connectionStart.port === i
                ? 'bg-green-500 ring-2 ring-green-300'
                : isPortConnected(i, true)
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-700 hover:bg-green-400'
            }`}
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

const DeviceItem: React.FC<{ type: typeof deviceTypes[0]; onAdd: (type: string, useSelectedModel: boolean) => void }> = ({ type, onAdd }) => {
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
      onClick={() => onAdd(type.id, false)} // Use default model when clicking from Available Devices
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
  const [connectionStart, setConnectionStart] = useState<{ deviceId: string; port: number; isOutput: boolean } | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Reset selected model when device type changes
  useEffect(() => {
    const models = deviceModels[selectedType as keyof typeof deviceModels] || [];
    setSelectedModel(models[0] || '');
  }, [selectedType]);

  const addDevice = (type: string, x?: number, y?: number, useSelectedModel: boolean = true) => {
    const deviceType = deviceTypes.find(dt => dt.id === type);
    if (!deviceType) return;

    const models = deviceModels[type as keyof typeof deviceModels] || [];
    // Use selectedModel only when adding from the "Add Device" button (useSelectedModel = true)
    // Use default model (first in list) when dragging from Available Devices (useSelectedModel = false)
    const model = useSelectedModel ? (selectedModel || models[0] || 'Default') : (models[0] || 'Default');

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
      config: {
        deviceName: deviceType.name.toLowerCase().replace(/\s+/g, '_'),
        nodeName: `${type}_${Date.now()}`,
        compatible: `vendor,${type}-${model.split(' ')[0].toLowerCase()}`,
        reg: '0x40',
        inEndpoints: [],
        outEndpoints: [],
        status: 'okay',
        properties: []
      }
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
      // Use false to indicate using default model instead of selected model
      addDevice(item.type, adjustedX, adjustedY, false);
    } else if (item.id) {
      // Move existing device
      moveDevice(item.id, adjustedX, adjustedY);
    }
  };

  const removeDevice = (id: string) => {
    // Find all connections related to this device
    const relatedConnections = connections.filter(c => c.from === id || c.to === id);

    // Remove endpoints from connected devices
    relatedConnections.forEach(connection => {
      updateDeviceEndpoints(connection, 'remove');
    });

    setDevices(prev => prev.filter(d => d.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
  };

  const generateEndpointLabel = (fromDevice: Device, toDevice: Device, fromPort: number, toPort: number) => {
    // Generate phandle-style labels for endpoints
    const fromLabel = `${fromDevice.config?.nodeName || fromDevice.id}_out${fromPort}`;
    const toLabel = `${toDevice.config?.nodeName || toDevice.id}_in${toPort}`;
    return { fromLabel, toLabel };
  };

  const updateDeviceEndpoints = (connection: Connection, action: 'add' | 'remove') => {
    const fromDevice = devices.find(d => d.id === connection.from);
    const toDevice = devices.find(d => d.id === connection.to);

    if (!fromDevice || !toDevice) return;

    const { fromLabel, toLabel } = generateEndpointLabel(fromDevice, toDevice, connection.fromPort, connection.toPort);

    setDevices(prev => prev.map(device => {
      if (device.id === connection.from && device.config) {
        const updatedConfig = { ...device.config };
        if (action === 'add') {
          const newOutEndpoints = [...updatedConfig.outEndpoints];
          newOutEndpoints[connection.fromPort] = `&${toLabel}`; // Reference to target endpoint
          updatedConfig.outEndpoints = newOutEndpoints;
        } else {
          updatedConfig.outEndpoints[connection.fromPort] = '';
        }
        return { ...device, config: updatedConfig };
      } else if (device.id === connection.to && device.config) {
        const updatedConfig = { ...device.config };
        if (action === 'add') {
          const newInEndpoints = [...updatedConfig.inEndpoints];
          newInEndpoints[connection.toPort] = `&${fromLabel}`; // Reference to source endpoint
          updatedConfig.inEndpoints = newInEndpoints;
        } else {
          updatedConfig.inEndpoints[connection.toPort] = '';
        }
        return { ...device, config: updatedConfig };
      }
      return device;
    }));
  };

  const handlePortClick = (deviceId: string, portIndex: number, isOutput: boolean) => {
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
            toPort: portIndex
          };
          setConnections(prev => [...prev, newConnection]);

          // Update device endpoints
          updateDeviceEndpoints(newConnection, 'add');
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
            toPort: connectionStart.port
          };
          setConnections(prev => [...prev, newConnection]);

          // Update device endpoints
          updateDeviceEndpoints(newConnection, 'add');
        }
      }

      setConnectionStart(null);
    }
  };

  const removeConnection = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (connection) {
      // Remove endpoint from both devices
      updateDeviceEndpoints(connection, 'remove');
    }
    setConnections(prev => prev.filter(c => c.id !== connectionId));
  };

  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
    setShowConfigModal(true);
  };

  const handleSaveDeviceConfig = (config: DeviceConfig) => {
    if (selectedDevice) {
      // Get current connections for this device
      const deviceConnections = connections.filter(c => c.from === selectedDevice.id || c.to === selectedDevice.id);

      // Don't override endpoints as they are managed by connections
      const mergedConfig = { ...config };

      setDevices(prev => prev.map(d =>
        d.id === selectedDevice.id ? { ...d, config: mergedConfig } : d
      ));
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
                    onDeviceClick={handleDeviceClick}
                    connectionStart={connectionStart}
                    connections={connections}
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
                onClick={() => addDevice(selectedType, undefined, undefined, true)} // Use selected model
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
                    onAdd={(typeId, useSelectedModel) => addDevice(typeId, undefined, undefined, useSelectedModel)}
                  />
                ))}
              </div>

              {/* Connection Help */}
              <div className="mt-6 p-3 bg-gray-800 rounded">
                <h4 className="text-sm font-medium text-gray-300 mb-2">How to Connect</h4>
                <p className="text-xs text-gray-400">
                  Click on any port to start a connection, then click on another port to complete it.
                </p>
                {connectionStart && (
                  <div className="mt-2">
                    <p className="text-xs text-yellow-400">
                      Now click on {connectionStart.isOutput ? 'an input' : 'an output'} port to complete the connection
                    </p>
                    <button
                      onClick={() => setConnectionStart(null)}
                      className="mt-2 text-xs text-red-400 hover:text-red-300"
                    >
                      Cancel connection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Configuration Modal */}
      {showConfigModal && selectedDevice && (
        <DeviceConfigModal
          deviceId={selectedDevice.id}
          deviceType={selectedDevice.type}
          deviceModel={selectedDevice.model}
          config={selectedDevice.config || {
            deviceName: selectedDevice.name.toLowerCase().replace(/\s+/g, '_'),
            nodeName: `${selectedDevice.type}_${selectedDevice.id}`,
            compatible: `vendor,${selectedDevice.type}`,
            reg: '0x40',
            inEndpoints: [],
            outEndpoints: [],
            status: 'okay',
            properties: []
          }}
          onSave={handleSaveDeviceConfig}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedDevice(null);
          }}
        />
      )}
    </DndProvider>
  );
};