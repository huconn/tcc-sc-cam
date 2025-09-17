import React from 'react';

export type SVDWBlenderStatus = 'okay' | 'disabled';

interface SVDWBlenderConfig {
  status: SVDWBlenderStatus;
  frameErrorBase: string;
  timeoutThreshold: string;
  fastErrorThreshold: string;
  slowErrorThreshold: string;
  frameToggleThreshold: string;
  lineToggleThreshold: string;
  toggleErrorThreshold: string;
}

interface SVDWBlenderConfigModalProps {
  open: boolean;
  onSave: (cfg: SVDWBlenderConfig) => void;
  onClose: () => void;
  initial?: Partial<SVDWBlenderConfig>;
}

export const SVDWBlenderConfigModal: React.FC<SVDWBlenderConfigModalProps> = ({ open, onSave, onClose, initial }) => {
  const [form, setForm] = React.useState<SVDWBlenderConfig>({
    status: initial?.status || 'okay',
    frameErrorBase: initial?.frameErrorBase || '',
    timeoutThreshold: initial?.timeoutThreshold || '',
    fastErrorThreshold: initial?.fastErrorThreshold || '',
    slowErrorThreshold: initial?.slowErrorThreshold || '',
    frameToggleThreshold: initial?.frameToggleThreshold || '',
    lineToggleThreshold: initial?.lineToggleThreshold || '',
    toggleErrorThreshold: initial?.toggleErrorThreshold || '',
  });

  // Only reset when modal opens, to avoid cursor loss while typing
  React.useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        status: initial?.status ?? prev.status,
        frameErrorBase: initial?.frameErrorBase ?? prev.frameErrorBase,
        timeoutThreshold: initial?.timeoutThreshold ?? prev.timeoutThreshold,
        fastErrorThreshold: initial?.fastErrorThreshold ?? prev.fastErrorThreshold,
        slowErrorThreshold: initial?.slowErrorThreshold ?? prev.slowErrorThreshold,
        frameToggleThreshold: initial?.frameToggleThreshold ?? prev.frameToggleThreshold,
        lineToggleThreshold: initial?.lineToggleThreshold ?? prev.lineToggleThreshold,
        toggleErrorThreshold: initial?.toggleErrorThreshold ?? prev.toggleErrorThreshold,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const Input = ({ name, label }: { name: keyof SVDWBlenderConfig; label: string }) => (
    <div className="grid grid-cols-[180px_1fr] items-center gap-4">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <input
        value={(form[name] as string) || ''}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-[640px] bg-gray-800 text-gray-100 border border-gray-600 rounded-lg shadow-xl">
        <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Blender</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-300">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as SVDWBlenderStatus })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="okay">Okay</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <Input name="frameErrorBase" label="Frame error base" />
          <Input name="timeoutThreshold" label="Timeout Threshold" />
          <Input name="fastErrorThreshold" label="Fast Error Threshold" />
          <Input name="slowErrorThreshold" label="Slow Error Threshold" />
          <Input name="frameToggleThreshold" label="Frame Toggle Threshold" />
          <Input name="lineToggleThreshold" label="Line Toggle Threshold" />
          <Input name="toggleErrorThreshold" label="Toggle Error Threshold" />
        </div>

        <div className="px-5 py-3 border-t border-gray-700 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 hover:bg-gray-600">Cancel</button>
          <button
            onClick={() => onSave(form)}
            className="px-3 py-1.5 text-sm rounded bg-purple-600 hover:bg-purple-500 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
