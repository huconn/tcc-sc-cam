import React from 'react';

export type VideoOutputStatus = 'okay' | 'disabled';
export type ToggleOption = 'enable' | 'disable';

export interface VideoOutputConfig {
  status: VideoOutputStatus;
  receiveIr: ToggleOption;
  irEncoding: ToggleOption;
}

interface VideoOutputConfigModalProps {
  open: boolean;
  title: string;
  initial?: Partial<VideoOutputConfig>;
  onSave: (cfg: VideoOutputConfig) => void;
  onClose: () => void;
}

export const VideoOutputConfigModal: React.FC<VideoOutputConfigModalProps> = ({ open, title, initial, onSave, onClose }) => {
  const [form, setForm] = React.useState<VideoOutputConfig>({
    status: initial?.status || 'okay',
    receiveIr: initial?.receiveIr || 'enable',
    irEncoding: initial?.irEncoding || 'enable',
  });

  React.useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        status: initial?.status ?? prev.status,
        receiveIr: initial?.receiveIr ?? prev.receiveIr,
        irEncoding: initial?.irEncoding ?? prev.irEncoding,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const Row = ({ label, control }: { label: string; control: React.ReactNode }) => (
    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {control}
    </div>
  );

  const Select = (value: string, onChange: (v: string) => void, options: { value: string; label: string }[]) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-[520px] bg-gray-800 text-gray-100 border border-gray-600 rounded-lg shadow-xl">
        <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="p-6 space-y-5">
          <Row label="Status" control={Select(form.status, (v) => setForm({ ...form, status: v as VideoOutputStatus }), [
            { value: 'okay', label: 'Okay' },
            { value: 'disabled', label: 'Disabled' },
          ])} />

          <Row label="Receive IR" control={Select(form.receiveIr, (v) => setForm({ ...form, receiveIr: v as ToggleOption }), [
            { value: 'enable', label: 'Enable' },
            { value: 'disable', label: 'Disable' },
          ])} />

          <Row label="IR encoding" control={Select(form.irEncoding, (v) => setForm({ ...form, irEncoding: v as ToggleOption }), [
            { value: 'enable', label: 'Enable' },
            { value: 'disable', label: 'Disable' },
          ])} />
        </div>
        <div className="px-5 py-3 border-t border-gray-700 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 hover:bg-gray-600">Cancel</button>
          <button onClick={() => onSave(form)} className="px-3 py-1.5 text-sm rounded bg-purple-600 hover:bg-purple-500 text-white">Save</button>
        </div>
      </div>
    </div>
  );
};
