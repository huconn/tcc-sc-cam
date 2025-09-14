import React from 'react';
import { GitBranch, ArrowRight } from 'lucide-react';
import { useCameraStore } from '@/store/cameraStore';
import clsx from 'clsx';

export const CameraMuxPanel: React.FC = () => {
  const { cameraMux, updateCameraMux, mipiChannels, ispConfigs } = useCameraStore();

  const availableInputs = [
    ...mipiChannels.filter(m => m.enabled).map(m => ({
      id: m.id,
      label: `${m.name} (${m.core})`,
      type: 'mipi'
    })),
    ...ispConfigs.filter(i => i.enabled).map(i => ({
      id: i.id,
      label: `${i.name} (${i.core})`,
      type: 'isp'
    }))
  ];

  const outputChannels = Array.from({ length: 8 }, (_, i) => ({
    id: `ch${i}`,
    label: `Channel ${i}`
  }));

  const handleMapping = (output: string, input: string) => {
    const newMappings = cameraMux.mappings.filter(m => m.output !== output);
    if (input && input !== 'none') {
      newMappings.push({ input, output });
    }
    updateCameraMux({ mappings: newMappings });
  };

  const getInputForOutput = (output: string) => {
    const mapping = cameraMux.mappings.find(m => m.output === output);
    return mapping?.input || 'none';
  };

  return (
    <div className="bg-gray-850 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-primary-400" />
        <h2 className="text-lg font-semibold">Camera Mux Configuration</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-medium text-sm mb-3">Input Sources</h3>
          <div className="space-y-2">
            {availableInputs.length === 0 ? (
              <p className="text-xs text-gray-500">No inputs available. Enable MIPI or ISP first.</p>
            ) : (
              availableInputs.map(input => (
                <div key={input.id} className={clsx(
                  'px-3 py-2 rounded text-sm',
                  input.type === 'mipi' ? 'bg-blue-900/30 border border-blue-700' : 'bg-purple-900/30 border border-purple-700'
                )}>
                  {input.label}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-medium text-sm mb-3">Output Mapping</h3>
          <div className="space-y-2">
            {outputChannels.map(output => (
              <div key={output.id} className="flex items-center gap-2">
                <span className="text-sm text-gray-400 w-20">{output.label}:</span>
                <ArrowRight className="w-4 h-4 text-gray-600" />
                <select
                  value={getInputForOutput(output.id)}
                  onChange={(e) => handleMapping(output.id, e.target.value)}
                  className="input text-sm flex-1"
                >
                  <option value="none">None</option>
                  {availableInputs.map(input => (
                    <option key={input.id} value={input.id}>
                      {input.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {cameraMux.mappings.map(mapping => (
          <div key={`${mapping.input}-${mapping.output}`} className="px-3 py-2 bg-gray-800 rounded-lg text-xs">
            <span className="text-primary-400">{mapping.input}</span>
            <ArrowRight className="w-3 h-3 inline mx-1" />
            <span className="text-gray-300">{mapping.output}</span>
          </div>
        ))}
      </div>
    </div>
  );
};