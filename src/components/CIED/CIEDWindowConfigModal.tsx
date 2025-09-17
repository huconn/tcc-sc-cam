import React from 'react';

export type CIEDWindowStatus = 'okay' | 'disabled';

export interface CIEDWindowConfig {
  status: CIEDWindowStatus;
  windowCountThreshold: string;
  frameCountThreshold: string;
  luminanceAvgThreshold: string;
}

interface CIEDWindowConfigModalProps {
  open: boolean;
  windowIndex: number;
  initial?: Partial<CIEDWindowConfig>;
  onSave: (cfg: CIEDWindowConfig) => void;
  onClose: () => void;
}

export const CIEDWindowConfigModal: React.FC<CIEDWindowConfigModalProps> = ({ open, windowIndex, initial, onSave, onClose }) => {
  const [form, setForm] = React.useState<CIEDWindowConfig>({
    status: initial?.status || 'okay',
    windowCountThreshold: initial?.windowCountThreshold || '2',
    frameCountThreshold: initial?.frameCountThreshold || '100',
    luminanceAvgThreshold: initial?.luminanceAvgThreshold || '2',
  });

  React.useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        status: initial?.status ?? prev.status,
        windowCountThreshold: initial?.windowCountThreshold ?? prev.windowCountThreshold,
        frameCountThreshold: initial?.frameCountThreshold ?? prev.frameCountThreshold,
        luminanceAvgThreshold: initial?.luminanceAvgThreshold ?? prev.luminanceAvgThreshold,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const Row = ({ label, control }: { label: string; control: React.ReactNode }) => (
    <div className="grid grid-cols-[200px_1fr] items-center gap-4">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {control}
    </div>
  );

  const Input = (value: string, onChange: (v: string) => void) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-[620px] bg-gray-800 text-gray-100 border border-gray-600 rounded-lg shadow-xl">
        <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">CIED Window {windowIndex}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <Row
            label="Status"
            control={
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as CIEDWindowStatus })}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="okay">Okay</option>
                <option value="disabled">Disabled</option>
              </select>
            }
          />

          <Row label="Window count threshold" control={Input(form.windowCountThreshold, (v) => setForm({ ...form, windowCountThreshold: v }))} />
          <Row label="Frame count threshold" control={Input(form.frameCountThreshold, (v) => setForm({ ...form, frameCountThreshold: v }))} />
          <Row label="Luminance average value threshold" control={Input(form.luminanceAvgThreshold, (v) => setForm({ ...form, luminanceAvgThreshold: v }))} />
        </div>

        <div className="px-5 py-3 border-t border-gray-700 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 hover:bg-gray-600">Cancel</button>
          <button onClick={() => onSave(form)} className="px-3 py-1.5 text-sm rounded bg-purple-600 hover:bg-purple-500 text-white">Save</button>
        </div>
      </div>
    </div>
  );
};
