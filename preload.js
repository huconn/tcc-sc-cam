const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  // Add file system operations
  saveFile: (fileName, content) => ipcRenderer.invoke('save-file', fileName, content),
  loadFile: () => ipcRenderer.invoke('load-file'),
  exportDTS: (config) => ipcRenderer.invoke('export-dts', config),
  // Get app version
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
})