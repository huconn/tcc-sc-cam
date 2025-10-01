import React, { useMemo, useState } from 'react';
import { useCameraStore } from '@/store/cameraStore';

export const DtsMapPanel: React.FC = () => {
  const dtsMap = useCameraStore(s => (s as any).originalDtsMap);
  const [query, setQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const nodes = dtsMap?.nodes ?? [];
  const filtered = useMemo(() => {
    if (!query) return nodes.slice(0, 200);
    const q = query.toLowerCase();
    return nodes.filter(n => n.path?.toLowerCase().includes(q) || n.name?.toLowerCase().includes(q)).slice(0, 200);
  }, [nodes, query]);

  const selectedNode = useMemo(() => nodes.find(n => n.path === selectedPath), [nodes, selectedPath]);

  return (
    <div className="w-[560px] border-l border-gray-700 bg-gray-900 flex">
      <div className="w-[280px] flex flex-col border-r border-gray-700">
        <div className="p-3 border-b border-gray-700">
          <div className="text-sm text-gray-300 font-semibold">DTS Map</div>
          <div className="text-xs text-gray-500">Nodes: {nodes.length}</div>
          {!dtsMap && (
            <div className="mt-2 text-xs text-yellow-500">
              No DTB loaded. Please load a DTB file.
            </div>
          )}
          <input
            className="mt-2 w-full bg-gray-800 text-gray-200 text-sm px-2 py-1 rounded border border-gray-700 outline-none focus:border-gray-500"
            placeholder="Search path or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-auto text-sm">
          {filtered.map((n, i) => (
            <button
              key={n.path + ':' + i}
              onClick={() => setSelectedPath(n.path)}
              className={`w-full text-left px-3 py-2 border-b border-gray-800 hover:bg-gray-800 ${selectedPath === n.path ? 'bg-gray-800' : ''}`}
            >
              <div className="text-gray-200 truncate" title={n.name}>{n.name}</div>
              <div className="text-gray-500 text-xs break-all" title={n.path}>{n.path}</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-3 text-xs text-gray-500">No nodes found.</div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <div className="text-sm text-gray-300 font-semibold">Node Details</div>
          {!selectedNode && <div className="text-xs text-gray-500">Select a node to inspect properties.</div>}
          {selectedNode && (
            <div className="mt-2 space-y-1 text-sm">
              <div className="text-gray-400"><span className="text-gray-500">name:</span> {selectedNode.name}</div>
              <div className="text-gray-400 break-all"><span className="text-gray-500">path:</span> {selectedNode.path}</div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-3">
          {selectedNode && (
            <div className="text-xs">
              <div className="text-gray-500 mb-2">properties</div>
              <div className="rounded border border-gray-700 bg-gray-900">
                {Object.entries(selectedNode.props ?? {}).map(([k, v]) => {
                  let display: string
                  if (Array.isArray(v)) display = v.join(' ')
                  else display = String(v)
                  return (
                    <div key={k} className="px-3 py-1 border-b border-gray-800 flex gap-2">
                      <div className="text-gray-300 min-w-[180px] break-all">{k}</div>
                      <div className="text-gray-400 break-all">{display}</div>
                    </div>
                  )
                })}
                {Object.keys(selectedNode.props ?? {}).length === 0 && (
                  <div className="px-3 py-2 text-gray-500">(no properties)</div>
                )}
              </div>

              <div className="text-gray-500 mt-3 mb-1">raw json</div>
              <pre className="text-[11px] leading-[1.3] text-gray-400 bg-gray-900 border border-gray-700 rounded p-2 overflow-auto h-[calc(100vh-300px)]">
{JSON.stringify(selectedNode, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


