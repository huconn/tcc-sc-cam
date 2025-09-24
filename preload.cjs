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
  // Convert DTB to JSON map; if no path passed, shows file picker in main
  convertDTB: (inPath) => ipcRenderer.invoke('convert-dtb', inPath),
  // Save DTS and compiled DTB to disk
  saveDtsDtb: (dtsText) => ipcRenderer.invoke('save-dts-dtb', dtsText),
  // Get app version
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
})