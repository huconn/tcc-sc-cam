import React from 'react';

type SelectOption = { label: string; value: string };

interface CIEDConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: any) => void; // replace with strong typing later
  initialWindow?: number; // when opened from 0-9
}

const windows = Array.from({ length: 9 }, (_, i) => `window${i}`);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border border-gray-600 rounded-lg p-4">
    <div className="-mt-6 mb-2">
      <span className="px-2 bg-purple-900/40 text-purple-200 text-xs font-semibold border border-purple-400/70 rounded">{title}</span>
    </div>
    {children}
  </div>
);

const Labeled: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-[180px_1fr] items-center gap-3">
    <label className="text-sm text-gray-300">{label}</label>
    {children}
  </div>
);

export const CIEDConfigModal: React.FC<CIEDConfigModalProps> = ({ open, onClose, onSave, initialWindow }) => {
  const [status, setStatus] = React.useState<'okay' | 'disabled'>('okay');
  const [inputFormat, setInputFormat] = React.useState('RGB');
  const [bswa, setBswa] = React.useState('RGB or YUV');
  const [syncV, setSyncV] = React.useState('Reversal');
  const [syncH, setSyncH] = React.useState('Bypass');
  const [byteSwap, setByteSwap] = React.useState('23:00 | 07:00 | 15:08');

  const [imgWidth, setImgWidth] = React.useState('1280');
  const [imgHeight, setImgHeight] = React.useState('720');

  const [enabledWindows, setEnabledWindows] = React.useState<Record<string, boolean>>(
    Object.fromEntries(windows.map(w => [w, false])) as Record<string, boolean>
  );

  const highlightWin = typeof initialWindow === 'number' ? `window${initialWindow}` : null;

  if (!open) return null;

  const toggleWin = (w: string) => setEnabledWindows(prev => ({ ...prev, [w]: !prev[w] }));

  const selectCls = 'bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm';
  const inputCls = 'bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-full';
  const boxCls = 'w-4 h-4 text-primary-600 bg-gray-800 border-gray-600 rounded focus:ring-primary-500';

  const headerTitle = typeof initialWindow === 'number' ? `CIED ${initialWindow} Status` : 'CIED';

  const statusSelectClass = `${selectCls} ${
    status === 'okay'
      ? 'bg-sky-700/30 border-sky-500 text-sky-100'
      : 'bg-orange-700/30 border-orange-500 text-orange-100'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col">
        <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{headerTitle}</h3>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'okay' | 'disabled')} className={statusSelectClass}>
              <option value="okay">OK</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-auto">
          {/* Common */}
          <Section title="Common">
            <div className="grid gap-6" style={{ gridTemplateColumns: 'minmax(0, calc(50% - 200px)) minmax(0, calc(50% + 200px))' }}>
              <Section title="Windows size">
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
              <div className="grid grid-rows-2 gap-6">
                <div className="grid grid-cols-3 gap-6">
                  {/* Input image size - compact inline fields */}
                  <Section title="Input image size">
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
                  <Section title="Input Format">
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
                  <Section title="BSWA">
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

                <div className="grid grid-cols-3 gap-6">
                  {/* Window calculate left as-is */}
                  <Section title="Window calculate">
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
                  <Section title="Sync Polarity">
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
                  <Section title="Byte swap">
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

          {/* Status groups */}
          <div className="grid grid-cols-5 gap-4 items-start">
            <div className="transform scale-90 origin-top-left">
            <Section title="Dark status :">
              <div className="space-y-6">
                {/* Header row with status select */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-300">Dark status :</span>
                  <select className={selectCls} defaultValue="okay">
                    <option value="okay">OK</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Enable window panel */}
                <Section title="Enable window">
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
                <Section title="Window count threshold">
                  <div className="flex justify-center" style={{ width: '220px', margin: '0 auto' }}>
                    <select className={`${selectCls} w-full`} defaultValue="2">
                      {[1,2,3,4,5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </Section>

                {/* Frame count threshold */}
                <Section title="Frame count threshold">
                  <div className="flex justify-center">
                    <input className={inputCls} defaultValue="10" />
                  </div>
                </Section>

                {/* Luminance average value threshold */}
                <Section title="Luminance average value threshold">
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
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-300">Bright status :</span>
                  <select className={selectCls} defaultValue="okay">
                    <option value="okay">OK</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <Section title="Enable window">
                  <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
                    {windows.map((w, idx) => (
                      <label key={w} className="inline-flex items-center gap-3">
                        <span className="text-gray-300 w-20">{w}</span>
                        <input type="checkbox" className={boxCls} defaultChecked={idx % 2 === 1} />
                      </label>
                    ))}
                  </div>
                </Section>

                <Section title="Window count threshold">
                  <div className="flex justify-center" style={{ width: '220px', margin: '0 auto' }}>
                    <select className={`${selectCls} w-full`} defaultValue="2">
                      {[1,2,3,4,5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </Section>

                <Section title="Frame count threshold">
                  <div className="flex justify-center">
                    <input className={inputCls} defaultValue="100" />
                  </div>
                </Section>

                <Section title="Luminance average value threshold">
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
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-300">Solid status :</span>
                  <select className={selectCls} defaultValue="okay">
                    <option value="okay">OK</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <Section title="Enable window">
                  <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
                    {windows.map((w, idx) => (
                      <label key={w} className="inline-flex items-center gap-3">
                        <span className="text-gray-300 w-20">{w}</span>
                        <input type="checkbox" className={boxCls} defaultChecked={idx % 2 === 1} />
                      </label>
                    ))}
                  </div>
                </Section>

                <Section title="Window count threshold">
                  <div className="flex justify-center" style={{ width: '220px', margin: '0 auto' }}>
                    <select className={`${selectCls} w-full`} defaultValue="2">
                      {[1,2,3,4,5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </Section>

                <Section title="Frame count threshold">
                  <div className="flex justify-center">
                    <input className={inputCls} defaultValue="100" />
                  </div>
                </Section>

                <Section title="G/B threshold">
                  <div className="grid items-center" style={{ gridTemplateColumns: '60px 64px 60px 64px', columnGap: '8px' }}>
                    <span className="text-gray-300 font-semibold">MAX :</span>
                    <input className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-16" defaultValue="2" />
                    <span className="text-gray-300 font-semibold">MIN :</span>
                    <input className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-16" defaultValue="" />
                  </div>
                </Section>

                <Section title="G/R threshold">
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
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">Phase status :</span>
                      <select className={selectCls} defaultValue="okay">
                        <option value="okay">OK</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Section title="Enable window">
                        <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
                          {windows.map((w, idx) => (
                            <label key={w} className="inline-flex items-center gap-3">
                              <span className="text-gray-300 w-20">{w}</span>
                              <input type="checkbox" className={boxCls} defaultChecked={idx % 2 === 0} />
                            </label>
                          ))}
                        </div>
                      </Section>
                      <Section title="Phase threshold for window">
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
                      <Section title="Window count threshold">
                        <div className="flex justify-center" style={{ width: '220px', margin: '0 auto' }}>
                          <select className={`${selectCls} w-full`} defaultValue="2">
                            {[1,2,3,4,5].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                      </Section>
                      <Section title="Phase scale">
                        <div className="flex justify-center" style={{ width: '220px', margin: '0 auto' }}>
                          <select className={`${selectCls} w-full`} defaultValue="x1">
                            <option value="x1">x1</option>
                            <option value="x2">x2</option>
                          </select>
                        </div>
                      </Section>
                      <Section title="Frame count threshold">
                        <div className="flex justify-center">
                          <input className={inputCls} defaultValue="100" />
                        </div>
                      </Section>
                      <Section title="Frame Stride">
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
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">Frozen status :</span>
                      <select className={selectCls} defaultValue="okay">
                        <option value="okay">OK</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                    <Section title="Frame count threshold">
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

        <div className="px-5 py-3 border-t border-gray-700 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 hover:bg-gray-600">Cancel</button>
          <button onClick={() => onSave({})} className="px-3 py-1.5 text-sm rounded bg-primary-600 hover:bg-primary-500 text-white">Save</button>
        </div>
      </div>
    </div>
  );
};
