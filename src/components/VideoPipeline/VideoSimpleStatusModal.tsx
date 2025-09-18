import React from 'react';
import { Settings, X } from 'lucide-react';

export type SimpleStatus = 'okay' | 'disabled';
export type ToggleOption = 'enable' | 'disable';

interface VideoSimpleStatusModalProps {
  open: boolean;
  title: string;
  status?: SimpleStatus;
  receiveIr?: ToggleOption;
  irEncoding?: ToggleOption;
  // MDW specific fields
  interruptDelay?: string;
  axiMaxRo?: string;
  axiMaxWo?: string;
  defaultColor?: string;
  fisheye?: ToggleOption;
  colorEnable?: ToggleOption;
  irEnable?: ToggleOption;
  yuvStandard?: 'BT.601' | 'BT.709' | 'BT.601 JPEG';
  onSave: (next: any) => void;
  onClose: () => void;
}

export const VideoSimpleStatusModal: React.FC<VideoSimpleStatusModalProps> = ({ 
  open, 
  title, 
  status = 'okay', 
  receiveIr = 'enable', 
  irEncoding = 'enable',
  interruptDelay = '0x100',
  axiMaxRo = '0xf',
  axiMaxWo = '0xf',
  defaultColor = '0x80808080',
  fisheye = 'disable',
  colorEnable = 'enable',
  irEnable = 'enable',
  yuvStandard = 'BT.601 JPEG',
  onSave, 
  onClose 
}) => {
  const [localStatus, setLocalStatus] = React.useState<SimpleStatus>(status);
  const [localReceiveIr, setLocalReceiveIr] = React.useState<ToggleOption>(receiveIr);
  const [localIrEncoding, setLocalIrEncoding] = React.useState<ToggleOption>(irEncoding);
  const [localInterruptDelay, setLocalInterruptDelay] = React.useState<string>(interruptDelay);
  const [localAxiMaxRo, setLocalAxiMaxRo] = React.useState<string>(axiMaxRo);
  const [localAxiMaxWo, setLocalAxiMaxWo] = React.useState<string>(axiMaxWo);
  const [localDefaultColor, setLocalDefaultColor] = React.useState<string>(defaultColor);
  const [localFisheye, setLocalFisheye] = React.useState<ToggleOption>(fisheye);
  const [localColorEnable, setLocalColorEnable] = React.useState<ToggleOption>(colorEnable);
  const [localIrEnable, setLocalIrEnable] = React.useState<ToggleOption>(irEnable);
  const [localYuvStandard, setLocalYuvStandard] = React.useState<'BT.601' | 'BT.709' | 'BT.601 JPEG'>(yuvStandard);
  
  React.useEffect(() => {
    setLocalStatus(status);
    setLocalReceiveIr(receiveIr);
    setLocalIrEncoding(irEncoding);
    setLocalInterruptDelay(interruptDelay);
    setLocalAxiMaxRo(axiMaxRo);
    setLocalAxiMaxWo(axiMaxWo);
    setLocalDefaultColor(defaultColor);
    setLocalFisheye(fisheye);
    setLocalColorEnable(colorEnable);
    setLocalIrEnable(irEnable);
    setLocalYuvStandard(yuvStandard);
  }, [status, receiveIr, irEncoding, interruptDelay, axiMaxRo, axiMaxWo, defaultColor, fisheye, colorEnable, irEnable, yuvStandard]);

  if (!open) return null;

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

        <div className="space-y-6">
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-300">Status</label>
            <select
              value={localStatus}
              onChange={(e) => setLocalStatus(e.target.value as SimpleStatus)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
            >
              <option value="okay">Okay</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {/* Show additional fields for VWDMA and MDW */}
          {title !== 'VIN0' && title !== 'VIN1' && title !== 'MDW' && (
            <>
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-gray-300">Receive IR</label>
                <select
                  value={localReceiveIr}
                  onChange={(e) => setLocalReceiveIr(e.target.value as ToggleOption)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                >
                  <option value="enable">Enable</option>
                  <option value="disable">Disable</option>
                </select>
              </div>

              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-gray-300">IR encoding</label>
                <select
                  value={localIrEncoding}
                  onChange={(e) => setLocalIrEncoding(e.target.value as ToggleOption)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                >
                  <option value="enable">Enable</option>
                  <option value="disable">Disable</option>
                </select>
              </div>
            </>
          )}

          {/* MDW specific fields */}
          {title === 'MDW' && (
            <>
              {/* Interrupt-delay */}
              <div className="border border-gray-700 rounded p-3">
                <div className="text-sm font-semibold text-purple-400 mb-2">Interrupt-delay</div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-gray-300">Value</label>
                  <input
                    value={localInterruptDelay}
                    onChange={(e) => setLocalInterruptDelay(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* AIX OUTSTANDING */}
              <div className="border border-gray-700 rounded p-3">
                <div className="text-sm font-semibold text-purple-400 mb-2">AIX OUTSTANDING</div>
                <div className="space-y-3">
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <label className="text-sm font-medium text-gray-300">Max roe</label>
                    <input
                      value={localAxiMaxRo}
                      onChange={(e) => setLocalAxiMaxRo(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <label className="text-sm font-medium text-gray-300">Max wos</label>
                    <input
                      value={localAxiMaxWo}
                      onChange={(e) => setLocalAxiMaxWo(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Format */}
              <div className="border border-gray-700 rounded p-3">
                <div className="text-sm font-semibold text-purple-400 mb-2">Format</div>
                <div className="space-y-3">
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <label className="text-sm font-medium text-gray-300">Default color</label>
                    <input
                      value={localDefaultColor}
                      onChange={(e) => setLocalDefaultColor(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <label className="text-sm font-medium text-gray-300">Is fisheye</label>
                    <select
                      value={localFisheye}
                      onChange={(e) => setLocalFisheye(e.target.value as ToggleOption)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    >
                      <option value="enable">Using a fish-eye lens</option>
                      <option value="disable">Not using fish-eye lens</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <label className="text-sm font-medium text-gray-300">Color enable</label>
                    <select
                      value={localColorEnable}
                      onChange={(e) => setLocalColorEnable(e.target.value as ToggleOption)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    >
                      <option value="enable">Use color channel</option>
                      <option value="disable">Disable color channel</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <label className="text-sm font-medium text-gray-300">IR enable</label>
                    <select
                      value={localIrEnable}
                      onChange={(e) => setLocalIrEnable(e.target.value as ToggleOption)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    >
                      <option value="enable">Use IR Data</option>
                      <option value="disable">Disable IR Data</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <label className="text-sm font-medium text-gray-300">yuv standard</label>
                    <select
                      value={localYuvStandard}
                      onChange={(e) => setLocalYuvStandard(e.target.value as 'BT.601' | 'BT.709' | 'BT.601 JPEG')}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    >
                      <option value="BT.601">BT.601</option>
                      <option value="BT.709">BT.709</option>
                      <option value="BT.601 JPEG">BT.601 JPEG</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 hover:bg-gray-600">Cancel</button>
          <button
            onClick={() => onSave({ 
              status: localStatus, 
              receiveIr: title !== 'VIN0' && title !== 'VIN1' && title !== 'MDW' ? localReceiveIr : undefined,
              irEncoding: title !== 'VIN0' && title !== 'VIN1' && title !== 'MDW' ? localIrEncoding : undefined,
              // MDW specific fields
              interruptDelay: title === 'MDW' ? localInterruptDelay : undefined,
              axiMaxRo: title === 'MDW' ? localAxiMaxRo : undefined,
              axiMaxWo: title === 'MDW' ? localAxiMaxWo : undefined,
              defaultColor: title === 'MDW' ? localDefaultColor : undefined,
              fisheye: title === 'MDW' ? localFisheye : undefined,
              colorEnable: title === 'MDW' ? localColorEnable : undefined,
              irEnable: title === 'MDW' ? localIrEnable : undefined,
              yuvStandard: title === 'MDW' ? localYuvStandard : undefined,
            })}
            className="px-3 py-1.5 text-sm rounded bg-purple-600 hover:bg-purple-500 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};


