import React from 'react';
import { useCameraStore } from '@/store/cameraStore';
import { Settings, X } from 'lucide-react';

interface CIEDConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: any) => void; // replace with strong typing later
  initialWindow?: number; // when opened from 0-9
}

const windows = Array.from({ length: 9 }, (_, i) => `window${i}`);

const Section: React.FC<{ title: string; children: React.ReactNode; smallTitle?: boolean; variant?: 'default' | 'small' }> = ({ title, children, smallTitle = false, variant = 'default' }) => {
  const getSectionStyles = () => {
    if (variant === 'small') {
      return {
        container: 'border border-sky-400 rounded-lg p-4',
        title: `px-3 py-1 bg-sky-100 text-sky-800 font-semibold border border-sky-400 rounded ${smallTitle ? 'text-sm' : 'text-lg'}`
      };
    }
    return {
      container: 'border border-gray-600 rounded-lg p-6',
      title: `px-3 py-1 bg-purple-900/40 text-purple-200 font-semibold border border-purple-400/70 rounded ${smallTitle ? 'text-sm' : 'text-lg'}`
    };
  };

  const styles = getSectionStyles();

  return (
    <div className={styles.container}>
      <div className="-mt-6 mb-3">
        <span className={styles.title}>{title}</span>
      </div>
      {children}
    </div>
  );
};

export const CIEDConfigModal: React.FC<CIEDConfigModalProps> = ({ open, onClose, onSave, initialWindow }) => {
  const [status, setStatus] = React.useState<'okay' | 'disabled'>('okay');
  const [inputFormat, setInputFormat] = React.useState('RGB');
  const [bswa, setBswa] = React.useState('RGB or YUV');
  const [syncV, setSyncV] = React.useState('Reversal');
  const [syncH, setSyncH] = React.useState('Bypass');
  const [byteSwap, setByteSwap] = React.useState('23:00 | 07:00 | 15:08');

  const [imgWidth, setImgWidth] = React.useState('1280');
  const [imgHeight, setImgHeight] = React.useState('720');

  // 그리드 테두리 표시 전역 플래그
  const showGridBorders = useCameraStore(s => s.debugCIEDConfigModalGridBorders ?? false);

  if (!open) return null;

  const selectCls = 'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors';
  const inputCls = 'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500';
  const boxCls = 'w-4 h-4 text-sky-600 bg-sky-100 border-sky-400 rounded focus:ring-sky-500';

  const headerTitle = typeof initialWindow === 'number' ? `CIED ${initialWindow} Status` : 'CIED';


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="relative bg-gray-800 text-gray-100 border border-gray-700 rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col p-6" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-12 h-12 text-purple-500" />
            <h3 className="text-xl font-semibold whitespace-nowrap">{headerTitle}</h3>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'okay' | 'disabled')} className={`${selectCls} w-32`}>
              <option value="okay">OK</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-10 flex-1 overflow-auto">
          {/* Common */}
          <div className={showGridBorders ? 'debug-orange' : ''}>
            <Section title="Common">
            <div className={`grid gap-6 ${showGridBorders ? 'debug-red' : ''}`} style={{ gridTemplateColumns: 'minmax(0, calc(50% - 200px)) minmax(0, calc(50% + 200px))' }}>
              <Section title="Windows size" smallTitle={true} variant="small">
                <div className="space-y-2">
                  {windows.map((w, i) => (
                    <div
                      key={w}
                      className="grid items-center"
                      style={{ gridTemplateColumns: '150px 64px 60px 64px 70px 64px 70px 64px', columnGap: '10px' }}
                    >
                      <span className="text-gray-300">{w} left :</span>
                      <input className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-16" defaultValue={0} />
                      <span className="text-gray-300">top :</span>
                      <input className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-16" defaultValue={i * 30} />
                      <span className="text-gray-300">width :</span>
                      <input className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-16" defaultValue={360} />
                      <span className="text-gray-300">height :</span>
                      <input className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-16" defaultValue={240} />
                    </div>
                  ))}
                </div>
              </Section>

              {/* Right: 2x3 grid per reference */}
              <div className={`grid grid-rows-2 gap-6 ${showGridBorders ? 'debug-green' : ''}`}>
                <div className={`grid grid-cols-3 gap-6 ${showGridBorders ? 'debug-yellow' : ''}`}>
                  {/* Input image size - compact inline fields */}
                  <Section title="Input image size" smallTitle={true} variant="small">
                    <div className="grid items-center" style={{ gridTemplateColumns: '80px 64px 80px 64px', columnGap: '6px' }}>
                      <span className="text-gray-300">Width :</span>
                      <input
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-16"
                        value={imgWidth}
                        onChange={(e) => setImgWidth(e.target.value)}
                      />
                      <span className="text-gray-300">Height :</span>
                      <input
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-16"
                        value={imgHeight}
                        onChange={(e) => setImgHeight(e.target.value)}
                      />
                    </div>
                  </Section>

                  {/* Input Format - single select */}
                  <Section title="Input Format" smallTitle={true} variant="small">
                    <select
                      value={inputFormat}
                      onChange={(e) => setInputFormat(e.target.value)}
                      className={selectCls}
                    >
                      <option value="RGB">RGB</option>
                      <option value="YUV444">YUV444</option>
                      <option value="YUV422">YUV422</option>
                    </select>
                  </Section>

                  {/* BSWA - single select */}
                  <Section title="BSWA" smallTitle={true} variant="small">
                    <select
                      value={bswa}
                      onChange={(e) => setBswa(e.target.value)}
                      className={selectCls}
                    >
                      <option value="RGB or YUV">RGB or YUV</option>
                      <option value="BGR or UVY">BGR or UVY</option>
                    </select>
                  </Section>
                </div>

                <div className={`grid grid-cols-3 gap-6 ${showGridBorders ? 'debug-purple' : ''}`}>
                  {/* Window calculate left as-is */}
                  <Section title="Window calculate" smallTitle={true} variant="small">
                    <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
                      {windows.map((w, idx) => (
                        <label key={w} className="inline-flex items-center gap-3">
                          <span className="text-gray-300 w-20">{w}</span>
                          <input type="checkbox" className={boxCls} defaultChecked={idx % 2 === 0} />
                        </label>
                      ))}
                    </div>
                  </Section>

                  {/* Sync Polarity - compact inline fields */}
                  <Section title="Sync Polarity" smallTitle={true} variant="small">
                    <div className="grid items-center" style={{ gridTemplateColumns: '90px 1fr', rowGap: '8px', columnGap: '6px' }}>
                      <span className="text-gray-300">Vsync :</span>
                      <select value={syncV} onChange={(e) => setSyncV(e.target.value)} className={selectCls}>
                        <option>Reversal</option>
                        <option>Bypass</option>
                      </select>
                      <span className="text-gray-300">Hsync :</span>
                      <select value={syncH} onChange={(e) => setSyncH(e.target.value)} className={selectCls}>
                        <option>Reversal</option>
                        <option>Bypass</option>
                      </select>
                    </div>
                  </Section>

                  {/* Byte swap - single select */}
                  <Section title="Byte swap" smallTitle={true} variant="small">
                    <select
                      value={byteSwap}
                      onChange={(e) => setByteSwap(e.target.value)}
                      className={selectCls}
                    >
                      <option value="23:00 | 07:00 | 15:08">[23:00] [07:00] [15:08]</option>
                      <option value="23:00">[23:00]</option>
                      <option value="07:00">[07:00]</option>
                      <option value="15:08">[15:08]</option>
                    </select>
                  </Section>
                </div>
              </div>
            </div>
          </Section>
          </div>

          {/* Status groups */}
          <div className={`grid grid-cols-5 gap-4 items-start ${showGridBorders ? 'debug-blue' : ''}`}>
            <div className="transform scale-90 origin-top-left">
            <Section title="Dark status :">
              <div className="space-y-6">
                {/* Header row with status select */}
                <div className="flex items-center gap-5">
                  <span className="text-lg text-gray-300 flex-1">Dark status :</span>
                  <select className={`${selectCls} flex-1`} defaultValue="okay">
                    <option value="okay">OK</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Enable window panel */}
                <Section title="Enable window" smallTitle={true} variant="small">
                  <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
                    {windows.map((w, idx) => (
                      <label key={w} className="inline-flex items-center gap-3">
                        <span className="text-gray-300 w-20">{w}</span>
                        <input type="checkbox" className={boxCls} defaultChecked={idx % 2 === 0} />
                      </label>
                    ))}
                  </div>
                </Section>

                {/* Window count threshold */}
                <Section title="Window count threshold" smallTitle={true} variant="small">
                  <div className="flex justify-center">
                    <select className={selectCls} defaultValue="2">
                      {[1,2,3,4,5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </Section>

                {/* Frame count threshold */}
                <Section title="Frame count threshold" smallTitle={true} variant="small">
                  <div className="flex justify-center">
                    <input className={inputCls} defaultValue="10" />
                  </div>
                </Section>

                {/* Luminance average value threshold */}
                <Section title="Luminance average value threshold" smallTitle={true} variant="small">
                  <div className="flex justify-center">
                    <input className={inputCls} defaultValue="2" />
                  </div>
                </Section>

                {/* Empty space to match Solid status height */}
                <div className="h-24"></div>
              </div>
            </Section>
            </div>

            <div className="transform scale-90 origin-top-left">
            <Section title="Bright status :">
              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <span className="text-lg text-gray-300 flex-1">Bright status :</span>
                  <select className={`${selectCls} flex-1`} defaultValue="okay">
                    <option value="okay">OK</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <Section title="Enable window" smallTitle={true} variant="small">
                  <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
                    {windows.map((w, idx) => (
                      <label key={w} className="inline-flex items-center gap-3">
                        <span className="text-gray-300 w-20">{w}</span>
                        <input type="checkbox" className={boxCls} defaultChecked={idx % 2 === 1} />
                      </label>
                    ))}
                  </div>
                </Section>

                <Section title="Window count threshold" smallTitle={true} variant="small">
                  <div className="flex justify-center">
                    <select className={selectCls} defaultValue="2">
                      {[1,2,3,4,5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </Section>

                <Section title="Frame count threshold" smallTitle={true} variant="small">
                  <div className="flex justify-center">
                    <input className={inputCls} defaultValue="100" />
                  </div>
                </Section>

                <Section title="Luminance average value threshold" smallTitle={true} variant="small">
                  <div className="flex justify-center">
                    <input className={inputCls} defaultValue="2" />
                  </div>
                </Section>

                {/* Empty space to match Solid status height */}
                <div className="h-24"></div>
              </div>
            </Section>
            </div>

            {/* Solid status */}
            <div className="transform scale-90 origin-top-left">
            <Section title="Solid status :">
              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <span className="text-lg text-gray-300 flex-1">Solid status :</span>
                  <select className={`${selectCls} flex-1`} defaultValue="okay">
                    <option value="okay">OK</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <Section title="Enable window" smallTitle={true} variant="small">
                  <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
                    {windows.map((w, idx) => (
                      <label key={w} className="inline-flex items-center gap-3">
                        <span className="text-gray-300 w-20">{w}</span>
                        <input type="checkbox" className={boxCls} defaultChecked={idx % 2 === 1} />
                      </label>
                    ))}
                  </div>
                </Section>

                <Section title="Window count threshold" smallTitle={true} variant="small">
                  <div className="flex justify-center">
                    <select className={selectCls} defaultValue="2">
                      {[1,2,3,4,5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </Section>

                <Section title="Frame count threshold" smallTitle={true} variant="small">
                  <div className="flex justify-center">
                    <input className={inputCls} defaultValue="100" />
                  </div>
                </Section>

                <Section title="G/B threshold" smallTitle={true} variant="small">
                  <div className="grid items-center" style={{ gridTemplateColumns: '60px 64px 60px 64px', columnGap: '8px' }}>
                    <span className="text-gray-300 font-semibold">MAX :</span>
                    <input className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-16" defaultValue="2" />
                    <span className="text-gray-300 font-semibold">MIN :</span>
                    <input className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-16" defaultValue="" />
                  </div>
                </Section>

                <Section title="G/R threshold" smallTitle={true} variant="small">
                  <div className="grid items-center" style={{ gridTemplateColumns: '60px 64px 60px 64px', columnGap: '8px' }}>
                    <span className="text-gray-300 font-semibold">MAX :</span>
                    <input className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-16" defaultValue="2" />
                    <span className="text-gray-300 font-semibold">MIN :</span>
                    <input className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-16" defaultValue="2" />
                  </div>
                </Section>

                {/* Empty space to match Bright status height */}
                <div className="h-1"></div>
              </div>
            </Section>
            </div>

            {/* Phase + Frozen stacked with minimal gap */}
            <div className="col-span-2 col-start-4 flex flex-col gap-[2px]">
              <div className="transform scale-90 origin-top-left">
                <Section title="Phase status :">
                  <div className="space-y-4">
                    <div className="flex items-center gap-5">
                      <span className="text-lg text-gray-300 flex-1">Phase status :</span>
                      <select className={`${selectCls} flex-1`} defaultValue="okay">
                        <option value="okay">OK</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Section title="Enable window" smallTitle={true} variant="small">
                        <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
                          {windows.map((w, idx) => (
                            <label key={w} className="inline-flex items-center gap-3">
                              <span className="text-gray-300 w-20">{w}</span>
                              <input type="checkbox" className={boxCls} defaultChecked={idx % 2 === 0} />
                            </label>
                          ))}
                        </div>
                      </Section>
                      <Section title="Phase threshold for window" smallTitle={true} variant="small">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                          {windows.map((w) => (
                            <div key={w} className="flex items-center gap-3">
                              <span className="text-gray-300 w-20">{w}</span>
                              <input className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-16" defaultValue="0x14" />
                            </div>
                          ))}
                        </div>
                      </Section>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Section title="Window count threshold" smallTitle={true} variant="small">
                        <div className="flex justify-center">
                          <select className={selectCls} defaultValue="2">
                            {[1,2,3,4,5].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                      </Section>
                      <Section title="Phase scale" smallTitle={true} variant="small">
                        <div className="flex justify-center">
                          <select className={selectCls} defaultValue="x1">
                            <option value="x1">x1</option>
                            <option value="x2">x2</option>
                          </select>
                        </div>
                      </Section>
                      <Section title="Frame count threshold" smallTitle={true} variant="small">
                        <div className="flex justify-center">
                          <input className={inputCls} defaultValue="100" />
                        </div>
                      </Section>
                      <Section title="Frame Stride" smallTitle={true} variant="small">
                        <div className="flex justify-center">
                          <input className={inputCls} defaultValue="6" />
                        </div>
                      </Section>
                    </div>
                  </div>
                </Section>
              </div>

              <div className="transform scale-90 origin-top-left">
                <Section title="Frozen status :">
                  <div className="space-y-4">
                    <div className="flex items-center gap-5">
                      <span className="text-lg text-gray-300 flex-1">Frozen status :</span>
                      <select className={`${selectCls} flex-1`} defaultValue="okay">
                        <option value="okay">OK</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                    <Section title="Frame count threshold" smallTitle={true} variant="small">
                      <div className="flex justify-center">
                        <input className={inputCls} defaultValue="2" />
                      </div>
                    </Section>
                  </div>
                </Section>
              </div>
            </div>
 
             
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={() => onSave({})} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
};
