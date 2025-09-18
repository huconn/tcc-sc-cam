import React from 'react';
import { Settings, X } from 'lucide-react';

export type VideoOutputStatus = 'okay' | 'disabled';
export type ToggleOption = 'enable' | 'disable';

export interface VideoOutputConfig {
  status: VideoOutputStatus;
  receiveIr: ToggleOption;
  irEncoding: ToggleOption;
  // MDW specific (optional)
  interruptDelay?: string; // hex string like 0x100
  axiMaxRo?: string; // hex
  axiMaxWo?: string; // hex
  defaultColor?: string; // hex like 0x80808080
  fisheye?: ToggleOption; // using a fish-eye lens
  colorEnable?: ToggleOption; // use color channel
  irEnable?: ToggleOption; // use IR data
  yuvStandard?: 'BT.601' | 'BT.709' | 'BT.601 JPEG';
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
    interruptDelay: initial?.interruptDelay || '0x100',
    axiMaxRo: initial?.axiMaxRo || '0xf',
    axiMaxWo: initial?.axiMaxWo || '0xf',
    defaultColor: initial?.defaultColor || '0x80808080',
    fisheye: initial?.fisheye || 'disable',
    colorEnable: initial?.colorEnable || 'enable',
    irEnable: initial?.irEnable || 'enable',
    yuvStandard: initial?.yuvStandard || 'BT.601 JPEG',
  });

  React.useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        status: initial?.status ?? prev.status,
        receiveIr: initial?.receiveIr ?? prev.receiveIr,
        irEncoding: initial?.irEncoding ?? prev.irEncoding,
        interruptDelay: initial?.interruptDelay ?? prev.interruptDelay,
        axiMaxRo: initial?.axiMaxRo ?? prev.axiMaxRo,
        axiMaxWo: initial?.axiMaxWo ?? prev.axiMaxWo,
        defaultColor: initial?.defaultColor ?? prev.defaultColor,
        fisheye: initial?.fisheye ?? prev.fisheye,
        colorEnable: initial?.colorEnable ?? prev.colorEnable,
        irEnable: initial?.irEnable ?? prev.irEnable,
        yuvStandard: initial?.yuvStandard ?? prev.yuvStandard,
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
      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="relative bg-gray-800 rounded-lg p-6 w-[520px] text-gray-100 border border-gray-700" role="dialog" aria-modal="true">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-5">
          <Row label="Status" control={Select(form.status, (v) => setForm({ ...form, status: v as VideoOutputStatus }), [
            { value: 'okay', label: 'Okay' },
            { value: 'disabled', label: 'Disabled' },
          ])} />

          {title === 'MDW' ? (
            <>
              {/* Interrupt-delay */}
              <div className="border border-gray-700 rounded p-3">
                <div className="text-sm font-semibold text-purple-400 mb-2">Interrupt-delay</div>
                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-gray-300">Value</label>
                  <input
                    value={form.interruptDelay}
                    onChange={(e) => setForm({ ...form, interruptDelay: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* AIX OUTSTANDING */}
              <div className="border border-gray-700 rounded p-3">
                <div className="text-sm font-semibold text-purple-400 mb-2">AIX OUTSTANDING</div>
                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-gray-300">Max row</label>
                  <input
                    value={form.axiMaxRo}
                    onChange={(e) => setForm({ ...form, axiMaxRo: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <label className="text-sm font-medium text-gray-300">Max woe</label>
                  <input
                    value={form.axiMaxWo}
                    onChange={(e) => setForm({ ...form, axiMaxWo: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Format */}
              <div className="border border-gray-700 rounded p-3">
                <div className="text-sm font-semibold text-purple-400 mb-2">Format</div>
                <div className="space-y-3">
                  <Row label="Default color" control={
                    <input
                      value={form.defaultColor}
                      onChange={(e) => setForm({ ...form, defaultColor: e.target.value })}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  } />
                  <Row label="Is fisheye" control={Select(form.fisheye || 'disable', (v) => setForm({ ...form, fisheye: v as ToggleOption }), [
                    { value: 'enable', label: 'Using a fish-eye lens' },
                    { value: 'disable', label: 'Not using fish-eye lens' },
                  ])} />
                  <Row label="Color enable" control={Select(form.colorEnable || 'enable', (v) => setForm({ ...form, colorEnable: v as ToggleOption }), [
                    { value: 'enable', label: 'Use color channel' },
                    { value: 'disable', label: 'Disable color channel' },
                  ])} />
                  <Row label="IR enable" control={Select(form.irEnable || 'enable', (v) => setForm({ ...form, irEnable: v as ToggleOption }), [
                    { value: 'enable', label: 'Use IR Data' },
                    { value: 'disable', label: 'Disable IR Data' },
                  ])} />
                  <Row label="yuv standard" control={Select(form.yuvStandard || 'BT.601 JPEG', (v) => setForm({ ...form, yuvStandard: v as any }), [
                    { value: 'BT.601', label: 'BT.601' },
                    { value: 'BT.709', label: 'BT.709' },
                    { value: 'BT.601 JPEG', label: 'BT.601 JPEG' },
                  ])} />
                </div>
              </div>
            </>
          ) : !(title === 'VIN0' || title === 'VIN1') ? (
            <>
              <Row label="Receive IR" control={Select(form.receiveIr, (v) => setForm({ ...form, receiveIr: v as ToggleOption }), [
                { value: 'enable', label: 'Enable' },
                { value: 'disable', label: 'Disable' },
              ])} />

              <Row label="IR encoding" control={Select(form.irEncoding, (v) => setForm({ ...form, irEncoding: v as ToggleOption }), [
                { value: 'enable', label: 'Enable' },
                { value: 'disable', label: 'Disable' },
              ])} />
            </>
          ) : null}
        </div>
        <div className="px-5 py-3 border-t border-gray-700 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 hover:bg-gray-600">Cancel</button>
          <button onClick={() => onSave(form)} className="px-3 py-1.5 text-sm rounded bg-purple-600 hover:bg-purple-500 text-white">Save</button>
        </div>
      </div>
    </div>
  );
};
