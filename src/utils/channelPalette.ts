// CEID slot colors 0..7
export const channelHex: string[] = [
  '#93c5fd', // 0 blue-300
  '#a7f3d0', // 1 green-200
  '#fecaca', // 2 red-200
  '#fde68a', // 3 yellow-300
  '#a78bfa', // 4 purple-300
  '#34d399', // 5 emerald-400
  '#60a5fa', // 6 blue-400
  '#f472b6', // 7 pink-400
  '#64748b', // 8 slate-500 (legacy CIED color)
  '#92400e', // 9 amber/brown (legacy CIED color)
];

// Tailwind bg classes approximating the above
export const channelBgClass: string[] = [
  'bg-blue-300',
  'bg-green-200',
  'bg-red-200',
  'bg-yellow-300',
  'bg-purple-300',
  'bg-emerald-400',
  'bg-blue-400',
  'bg-pink-400',
  'bg-slate-500',
  'bg-amber-800',
];

export const getChannelHex = (index: number): string => channelHex[index % channelHex.length];
export const getChannelBgClass = (index: number): string => channelBgClass[index % channelBgClass.length];


