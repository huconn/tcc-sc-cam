import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';

export interface DeviceConfig {
  deviceName: string;
  nodeName: string;
  compatible: string;
  reg: string;
  inEndpoints: string[];
  outEndpoints: string[];
  status: 'okay' | 'disabled';
  properties: DeviceProperty[];
}

export interface DeviceProperty {
  id: string;
  name: string;
  type: 'string' | 'decimal' | 'boolean' | 'gpio';
  value?: string | number;
  gpioConfig?: {
    group: string;
    number: number;
    active: 'high' | 'low';
  };
}

interface DeviceConfigModalProps {
  deviceId: string;
  deviceType: string;
  deviceModel: string;
  config: DeviceConfig;
  ports?: any[]; // DTB에서 로드한 원본 ports 정보
  onSave: (config: DeviceConfig) => void;
  onClose: () => void;
}

// Helper function to parse register address from DTS format
const parseRegAddress = (reg: string): string => {
  if (!reg) return '0x40';
  // Extract hex value from formats like "< 0x50 >" or "0x50"
  const match = reg.match(/0x[0-9a-fA-F]+/);
  return match ? match[0] : '0x40';
};

export const DeviceConfigModal: React.FC<DeviceConfigModalProps> = ({
  deviceId,
  deviceType,
  deviceModel,
  config: initialConfig,
  ports,
  onSave,
  onClose
}) => {
  const [config, setConfig] = useState<DeviceConfig>({
    ...initialConfig,
    reg: parseRegAddress(initialConfig.reg)
  });
  const [showDtsPreview, setShowDtsPreview] = useState(true);
  const [newProperty, setNewProperty] = useState<DeviceProperty>({
    id: '',
    name: '',
    type: 'string',
    value: ''
  });

  useEffect(() => {
    setConfig({
      ...initialConfig,
      reg: parseRegAddress(initialConfig.reg)
    });
  }, [initialConfig]);

  const handleAddProperty = () => {
    if (!newProperty.name) return;

    const property: DeviceProperty = {
      ...newProperty,
      id: `prop-${Date.now()}`
    };

    if (property.type === 'boolean') {
      delete property.value;
    } else if (property.type === 'gpio' && !property.gpioConfig) {
      property.gpioConfig = {
        group: 'GPIO-A',
        number: 0,
        active: 'high'
      };
    }

    setConfig(prev => ({
      ...prev,
      properties: [...prev.properties, property]
    }));

    setNewProperty({
      id: '',
      name: '',
      type: 'string',
      value: ''
    });
  };

  const handleRemoveProperty = (propertyId: string) => {
    setConfig(prev => ({
      ...prev,
      properties: prev.properties.filter(p => p.id !== propertyId)
    }));
  };

  const handleUpdateProperty = (propertyId: string, updates: Partial<DeviceProperty>) => {
    setConfig(prev => ({
      ...prev,
      properties: prev.properties.map(p =>
        p.id === propertyId ? { ...p, ...updates } : p
      )
    }));
  };

  const handleAddEndpoint = (type: 'in' | 'out') => {
    const key = type === 'in' ? 'inEndpoints' : 'outEndpoints';
    setConfig(prev => ({
      ...prev,
      [key]: [...prev[key], '']
    }));
  };

  const handleUpdateEndpoint = (type: 'in' | 'out', index: number, value: string) => {
    const key = type === 'in' ? 'inEndpoints' : 'outEndpoints';
    setConfig(prev => ({
      ...prev,
      [key]: prev[key].map((ep, i) => i === index ? value : ep)
    }));
  };

  const handleRemoveEndpoint = (type: 'in' | 'out', index: number) => {
    const key = type === 'in' ? 'inEndpoints' : 'outEndpoints';
    setConfig(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }));
  };

  const generateDtsPreview = () => {
    let dts = `${config.nodeName} {\n`;
    dts += `    status = "${config.status}";\n`;
    dts += `    compatible = "${config.compatible}";\n`;
    dts += `    reg = ${config.reg};\n`;

    // Use original ports data from DTB if available
    if (ports && ports.length > 0) {
      // Check if it's a single port or multiple ports
      const hasMultiplePorts = ports.some(p => p.portNumber !== undefined);
      
      if (hasMultiplePorts) {
        // Multiple ports (serializer/deserializer)
        dts += `\n    ports {\n`;
        
        // Group ports by port number
        const portsByNumber = ports.reduce((acc: any, port: any) => {
          const num = port.portNumber || '0';
          if (!acc[num]) acc[num] = [];
          acc[num].push(port);
          return acc;
        }, {});
        
        Object.keys(portsByNumber).sort().forEach((portNum: string) => {
          dts += `\n        port@${portNum} {\n`;
          portsByNumber[portNum].forEach((endpoint: any) => {
            dts += `\n            endpoint {\n`;
            if (endpoint.remoteEndpoint) {
              dts += `                remote-endpoint = ${endpoint.remoteEndpoint};\n`;
            }
            if (endpoint.ioDirection) {
              dts += `                io-direction = "${endpoint.ioDirection}";\n`;
            }
            if (endpoint.phandle) {
              dts += `                phandle = ${endpoint.phandle};\n`;
            }
            dts += `            };\n`;
          });
          dts += `        };\n`;
        });
        
        dts += `    };\n`;
      } else {
        // Single port (sensor)
        dts += `\n    port {\n`;
        ports.forEach((endpoint: any) => {
          dts += `\n        endpoint {\n`;
          if (endpoint.remoteEndpoint) {
            dts += `            remote-endpoint = ${endpoint.remoteEndpoint};\n`;
          }
          if (endpoint.ioDirection) {
            dts += `            io-direction = "${endpoint.ioDirection}";\n`;
          }
          if (endpoint.phandle) {
            dts += `            phandle = ${endpoint.phandle};\n`;
          }
          dts += `        };\n`;
        });
        dts += `    };\n`;
      }
    }

    // Add custom properties
    config.properties.forEach(prop => {
      if (prop.type === 'string') {
        dts += `    ${prop.name} = "${prop.value}";\n`;
      } else if (prop.type === 'decimal') {
        dts += `    ${prop.name} = <${prop.value}>;\n`;
      } else if (prop.type === 'boolean') {
        dts += `    ${prop.name};\n`;
      } else if (prop.type === 'gpio' && prop.gpioConfig) {
        const { group, number, active } = prop.gpioConfig;
        const activeValue = active === 'high' ? '0' : '1';
        dts += `    ${prop.name} = <&${group.toLowerCase()} ${number} ${activeValue}>;\n`;
      }
    });

    dts += '};\n';
    return dts;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-[80vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Device Configuration</h2>
            <p className="text-sm text-gray-400 mt-1">
              {deviceType} - {deviceModel} ({deviceId})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Configuration */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Basic Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Device Name
                  </label>
                  <input
                    type="text"
                    value={config.deviceName}
                    onChange={(e) => setConfig({ ...config, deviceName: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Node Name
                  </label>
                  <input
                    type="text"
                    value={config.nodeName}
                    onChange={(e) => setConfig({ ...config, nodeName: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Compatible String
                  </label>
                  <input
                    type="text"
                    value={config.compatible}
                    onChange={(e) => setConfig({ ...config, compatible: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Register Address
                  </label>
                  <input
                    type="text"
                    value={config.reg}
                    onChange={(e) => setConfig({ ...config, reg: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="0x40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={config.status}
                    onChange={(e) => setConfig({ ...config, status: e.target.value as 'okay' | 'disabled' })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="okay">okay</option>
                    <option value="disabled">disabled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Endpoints */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Endpoints</h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Input Endpoints */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">
                      Input Endpoints
                      <span className="text-xs text-gray-500 ml-2">(Auto-generated from connections)</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    {config.inEndpoints.length > 0 ? (
                      config.inEndpoints.map((endpoint, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={endpoint}
                            disabled
                            className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-400 text-sm cursor-not-allowed"
                            placeholder="Endpoint ID"
                          />
                          <span className="text-xs text-gray-500 self-center">Port {index + 1}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic">No input connections</p>
                    )}
                  </div>
                </div>

                {/* Output Endpoints */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">
                      Output Endpoints
                      <span className="text-xs text-gray-500 ml-2">(Auto-generated from connections)</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    {config.outEndpoints.length > 0 ? (
                      config.outEndpoints.map((endpoint, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={endpoint}
                            disabled
                            className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-400 text-sm cursor-not-allowed"
                            placeholder="Endpoint ID"
                          />
                          <span className="text-xs text-gray-500 self-center">Port {index + 1}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic">No output connections</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Properties */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Custom Properties</h3>

              {/* Add New Property */}
              <div className="bg-gray-800 rounded p-3 mb-4">
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <input
                    type="text"
                    value={newProperty.name}
                    onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                    className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    placeholder="Property name"
                  />
                  <select
                    value={newProperty.type}
                    onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value as any })}
                    className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  >
                    <option value="string">String</option>
                    <option value="decimal">Decimal</option>
                    <option value="boolean">Boolean</option>
                    <option value="gpio">GPIO</option>
                  </select>
                  {newProperty.type !== 'boolean' && newProperty.type !== 'gpio' && (
                    <input
                      type={newProperty.type === 'decimal' ? 'number' : 'text'}
                      value={newProperty.value || ''}
                      onChange={(e) => setNewProperty({ ...newProperty, value: e.target.value })}
                      className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      placeholder="Value"
                    />
                  )}
                  <button
                    onClick={handleAddProperty}
                    className="bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 text-sm"
                  >
                    Add Property
                  </button>
                </div>
                {newProperty.type === 'gpio' && (
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={newProperty.gpioConfig?.group || 'GPIO-A'}
                      onChange={(e) => setNewProperty({
                        ...newProperty,
                        gpioConfig: {
                          ...newProperty.gpioConfig!,
                          group: e.target.value
                        }
                      })}
                      className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    >
                      <option value="GPIO-A">GPIO-A</option>
                      <option value="GPIO-B">GPIO-B</option>
                      <option value="GPIO-C">GPIO-C</option>
                      <option value="GPIO-D">GPIO-D</option>
                    </select>
                    <input
                      type="number"
                      value={newProperty.gpioConfig?.number || 0}
                      onChange={(e) => setNewProperty({
                        ...newProperty,
                        gpioConfig: {
                          ...newProperty.gpioConfig!,
                          number: parseInt(e.target.value)
                        }
                      })}
                      className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      placeholder="Pin number"
                    />
                    <select
                      value={newProperty.gpioConfig?.active || 'high'}
                      onChange={(e) => setNewProperty({
                        ...newProperty,
                        gpioConfig: {
                          ...newProperty.gpioConfig!,
                          active: e.target.value as 'high' | 'low'
                        }
                      })}
                      className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    >
                      <option value="high">Active High</option>
                      <option value="low">Active Low</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Properties List */}
              <div className="space-y-2">
                {config.properties.map((property) => (
                  <div key={property.id} className="bg-gray-800 rounded p-2 flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <span className="text-white text-sm">{property.name}</span>
                      <span className="text-gray-400 text-sm">{property.type}</span>
                      <span className="text-gray-300 text-sm">
                        {property.type === 'boolean' ? (
                          'Present'
                        ) : property.type === 'gpio' && property.gpioConfig ? (
                          `${property.gpioConfig.group} Pin ${property.gpioConfig.number} (${property.gpioConfig.active})`
                        ) : (
                          property.value
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveProperty(property.id)}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* DTS Preview */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">DTS Preview</h3>
                <button
                  onClick={() => setShowDtsPreview(!showDtsPreview)}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showDtsPreview ? 'Hide' : 'Show'} Preview
                  {showDtsPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              {showDtsPreview && (
                <pre className="bg-gray-900 rounded p-4 text-green-400 text-sm font-mono overflow-x-auto">
                  {generateDtsPreview()}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(config);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};