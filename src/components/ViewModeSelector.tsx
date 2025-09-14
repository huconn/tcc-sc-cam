import React from 'react';
import { Eye, Monitor, Cpu } from 'lucide-react';
import { ViewMode } from '@/types/camera';
import { useCameraStore } from '@/store/cameraStore';
import clsx from 'clsx';

export const ViewModeSelector: React.FC = () => {
  const { viewMode, setViewMode } = useCameraStore();

  const modes: Array<{ value: ViewMode; label: string; icon: React.ReactNode; description: string }> = [
    {
      value: 'unified',
      label: 'Unified View',
      icon: <Eye className="w-5 h-5" />,
      description: 'View both cores'
    },
    {
      value: 'main',
      label: 'Main Core',
      icon: <Monitor className="w-5 h-5" />,
      description: 'Configure main core'
    },
    {
      value: 'sub',
      label: 'Sub Core',
      icon: <Cpu className="w-5 h-5" />,
      description: 'Configure sub core'
    },
  ];

  return (
    <div className="flex gap-2 p-4 bg-gray-850 border-b border-gray-700">
      <div className="flex items-center gap-2 mr-4">
        <span className="text-sm font-medium text-gray-400">View Mode:</span>
      </div>
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => setViewMode(mode.value)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
            viewMode === mode.value
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          )}
          title={mode.description}
        >
          {mode.icon}
          <span className="font-medium">{mode.label}</span>
        </button>
      ))}
    </div>
  );
};