import React, { useState } from 'react';
import { X, Camera, Wifi, Settings, Check } from 'lucide-react';

interface ExternalDevicePopupProps {
  mipi: 'mipi0' | 'mipi1';
  selectedDevices: string[];
  onSelect: (mipi: 'mipi0' | 'mipi1', devices: string[]) => void;
  onClose: () => void;
}

const deviceTypes = [
  { id: 'sensor', name: 'Camera Sensor', icon: Camera, color: 'bg-blue-500' },
  { id: 'serializer', name: 'Camera Serializer', icon: Wifi, color: 'bg-green-500' },
  { id: 'deserializer', name: 'Camera Deserializer', icon: Settings, color: 'bg-red-500' },
  { id: 'converter', name: 'Format Converter', icon: Settings, color: 'bg-yellow-500' },
];

const deviceModels = {
  sensor: [
    'IMX219 (2MP)',
    'IMX477 (12MP)', 
    'IMX708 (12MP)',
    'OV5647 (5MP)',
    'Custom Sensor'
  ],
  serializer: [
    'MAX96712 (4-lane)',
    'MAX96717 (4-lane)',
    'DS90UB954 (4-lane)',
    'Custom Serializer'
  ],
  deserializer: [
    'MAX96713 (4-lane)',
    'MAX96718 (4-lane)', 
    'DS90UB953 (4-lane)',
    'Custom Deserializer'
  ],
  converter: [
    'MIPI to CSI Converter',
    'LVDS to MIPI Converter',
    'Custom Converter'
  ]
};

export const ExternalDevicePopup: React.FC<ExternalDevicePopupProps> = ({
  mipi,
  selectedDevices,
  onSelect,
  onClose
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [devices, setDevices] = useState<Array<{
    id: string;
    type: string;
    model: string;
    color: string;
  }>>([]);

  const handleAddDevice = () => {
    if (selectedType && selectedModel) {
      const deviceType = deviceTypes.find(t => t.id === selectedType);
      const newDevice = {
        id: `${selectedType}_${Date.now()}`,
        type: selectedType,
        model: selectedModel,
        color: deviceType?.color || 'bg-gray-500'
      };
      setDevices(prev => [...prev, newDevice]);
      setSelectedType('');
      setSelectedModel('');
    }
  };

  const handleRemoveDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
  };

  const handleToggleDevice = (deviceId: string) => {
    const isSelected = selectedDevices.includes(deviceId);
    if (isSelected) {
      onSelect(mipi, selectedDevices.filter(id => id !== deviceId));
    } else {
      onSelect(mipi, [...selectedDevices, deviceId]);
    }
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-100">
            External Devices - {mipi.toUpperCase()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Add Device Section */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Add New Device</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Device Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-gray-600 text-white rounded px-3 py-2 border border-gray-500"
              >
                <option value="">Select Type</option>
                {deviceTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-gray-600 text-white rounded px-3 py-2 border border-gray-500"
                disabled={!selectedType}
              >
                <option value="">Select Model</option>
                {selectedType && deviceModels[selectedType as keyof typeof deviceModels]?.map(model => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleAddDevice}
            disabled={!selectedType || !selectedModel}
            className="mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Device
          </button>
        </div>

        {/* Device List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-100">Available Devices</h3>
          {devices.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No devices added yet. Add a device above to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map(device => {
                const deviceType = deviceTypes.find(t => t.id === device.type);
                const isSelected = selectedDevices.includes(device.id);
                
                return (
                  <div
                    key={device.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-500 bg-opacity-20' 
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => handleToggleDevice(device.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded ${device.color} flex items-center justify-center`}>
                        {deviceType && <deviceType.icon className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-100">{device.model}</div>
                        <div className="text-sm text-gray-400">{deviceType?.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="w-5 h-5 text-primary-500" />}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDevice(device.id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
