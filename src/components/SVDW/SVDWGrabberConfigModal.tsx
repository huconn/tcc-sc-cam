import React from 'react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-[520px] bg-gray-800 text-gray-100 border border-gray-600 rounded-lg shadow-xl">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Grabber {grabberIndex} Configuration</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-300">Status</label>
            <select
              value={localStatus}
              onChange={(e) => setLocalStatus(e.target.value as SVDWGrabberStatus)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="okay">Okay</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-700 flex items-center justify-end gap-2">
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
