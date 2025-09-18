import React from 'react';
import { Settings, X } from 'lucide-react';

export type SVDWGrabberStatus = 'okay' | 'disabled';

interface SVDWGrabberConfigModalProps {
  open: boolean;
  grabberIndex: number;
  status: SVDWGrabberStatus;
  onSave: (next: { status: SVDWGrabberStatus }) => void;
  onClose: () => void;
}

export const SVDWGrabberConfigModal: React.FC<SVDWGrabberConfigModalProps> = ({
  open,
  grabberIndex,
  status,
  onSave,
  onClose,
}) => {
  const [localStatus, setLocalStatus] = React.useState<SVDWGrabberStatus>(status);
  React.useEffect(() => setLocalStatus(status), [status]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="relative bg-gray-800 rounded-lg p-6 w-[520px] text-gray-100 border border-gray-700 pointer-events-auto" role="dialog" aria-modal="true">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Grabber {grabberIndex} Configuration</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-300">Status</label>
            <select
              value={localStatus}
              onChange={(e) => setLocalStatus(e.target.value as SVDWGrabberStatus)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
            >
              <option value="okay">Okay</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 hover:bg-gray-600">Cancel</button>
          <button
            onClick={() => onSave({ status: localStatus })}
            className="px-3 py-1.5 text-sm rounded bg-purple-600 hover:bg-purple-500 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
