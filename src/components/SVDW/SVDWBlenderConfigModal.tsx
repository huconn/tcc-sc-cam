import React from 'react';
import { Settings, X } from 'lucide-react';

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
        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="relative bg-gray-800 rounded-lg p-6 w-[640px] text-gray-100 border border-gray-700 pointer-events-auto" role="dialog" aria-modal="true">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Blender</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-300">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as SVDWBlenderStatus })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
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

        <div className="mt-6 flex items-center justify-end gap-2">
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
