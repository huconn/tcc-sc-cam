const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

let mainWindow = null
const isDev = process.env.NODE_ENV === 'development'

const createWindow = () => {
  const devTools = true;           // 최상위 조건: DevTools 기능 활성화 여부 (F12, Ctrl+Shift+I)
  const enableDevTools = true;     // 하위 조건: 로딩 시 콘솔 자동 열기 여부
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false, // 창을 먼저 숨김
    fullscreen: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: devTools,  // true: F12, Ctrl+Shift+I 작동 | false: 완전 비활성화
      spellcheck: false
    },
    icon: path.join(__dirname, 'assets/telechips.ico'),
    titleBarStyle: 'default',
    autoHideMenuBar: true  // 항상 메뉴 숨김
  })

  // 창이 준비되면 표시
  mainWindow.once('ready-to-show', () => {
    try { mainWindow.maximize() } catch {}
    mainWindow.show()
    
    // devTools가 true이고 enableDevTools가 true면 자동으로 DevTools 열기
    if (devTools && enableDevTools) {
      mainWindow.webContents.openDevTools()
    }
  })

  // In development, load from Vite dev server
  if (isDev) {
    mainWindow.loadURL('http://localhost:5175')
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
  }

  // 창 닫기 전에 renderer에 알림
  mainWindow.on('close', (event) => {
    // renderer에서 localStorage 정리할 시간을 주기 위해 잠시 대기
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.executeJavaScript(`
        localStorage.removeItem('selectedSoc');
        localStorage.removeItem('selectedModule');
        console.log('Window closing: localStorage cleared');
      `).catch(() => {});
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle IPC for getting app version
ipcMain.handle('get-app-version', () => {
  const version = app.getVersion()

  // In development, add git hash
  if (isDev) {
    try {
      const { execSync } = require('child_process')
      const gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
      return `${version}-${gitHash}-dev`
    } catch (error) {
      // If git is not available or not a git repo
      return `${version}-dev`
    }
  }

  // In production, return clean version
  return version
})

// Allow user to pick a DTB and convert to JSON map
ipcMain.handle('convert-dtb', async (_evt, inputPathOptional) => {
  try {
    let inputPath = inputPathOptional
    if (!inputPath) {
      const r = await dialog.showOpenDialog(mainWindow, {
        title: 'Select DTB/DTS/JSON file',
        filters: [
          { name: 'Device Tree Files', extensions: ['dtb', 'dts', 'json'] },
          { name: 'DTB', extensions: ['dtb'] },
          { name: 'DTS', extensions: ['dts'] },
          { name: 'JSON', extensions: ['json'] }
        ],
        properties: ['openFile']
      })
      if (r.canceled || !r.filePaths?.[0]) return { canceled: true }
      inputPath = r.filePaths[0]
    }

    const outDir = path.join(app.getPath('userData'), 'data')
    const outPath = path.join(outDir, 'dts-map.json')
    fs.mkdirSync(outDir, { recursive: true })

    // Use the shared converter logic
    const { convertDtbToJson } = require('./scripts/convert-dtb.cjs')
    // If JSON selected, read and return directly
    const ext = path.extname(inputPath).toLowerCase()
    let jsonText
    if (ext === '.json') {
      jsonText = fs.readFileSync(inputPath, 'utf-8')
    } else {
      // Resolve packaged dtc if available (needed for .dtb inputs)
      const dtcCandidatePacked = path.join(process.resourcesPath || process.cwd(), 'tools', 'DTC.exe')
      const dtcPath = process.env.DTC_PATH || (require('fs').existsSync(dtcCandidatePacked) ? dtcCandidatePacked : undefined)
      const dtc = dtcPath || 'dtc'
      jsonText = convertDtbToJson(dtc, inputPath)
    }
    fs.writeFileSync(outPath, jsonText, 'utf-8')

    return { canceled: false, inputPath, outPath, jsonText }
  } catch (e) {
    return { error: String(e.message || e) }
  }
})

// Save DTS and DTB from a provided DTS string
ipcMain.handle('save-dts-dtb', async (_evt, dtsText) => {
  try {
    if (typeof dtsText !== 'string' || !dtsText.trim()) return { error: 'Empty DTS text' }
    const save = await dialog.showSaveDialog(mainWindow, {
      title: 'Save DTS/DTB',
      filters: [{ name: 'Device Tree Source', extensions: ['dts'] }],
      defaultPath: 'output.dts'
    })
    if (save.canceled || !save.filePath) return { canceled: true }
    const dtsPath = save.filePath.endsWith('.dts') ? save.filePath : `${save.filePath}.dts`
    fs.writeFileSync(dtsPath, dtsText, 'utf-8')

    // Resolve dtc
    const path = require('node:path')
    const dtcCandidatePacked = path.join(process.resourcesPath || process.cwd(), 'tools', 'DTC.exe')
    const dtcPath = process.env.DTC_PATH || (fs.existsSync(dtcCandidatePacked) ? dtcCandidatePacked : undefined)
    const dtc = dtcPath || 'dtc'
    const { spawnSync } = require('node:child_process')
    const dtbPath = dtsPath.replace(/\.dts$/i, '.dtb')
    const res = spawnSync(dtc, ['-I', 'dts', '-O', 'dtb', '-o', dtbPath, dtsPath], { stdio: 'pipe', encoding: 'utf-8' })
    if (res.error) {
      return { error: `Failed to launch dtc at: ${dtc}\n${String(res.error)}` }
    }
    if (res.status !== 0) {
      const stderr = res.stderr?.trim() || 'dtc failed to compile dtb'
      return { error: `dtc error (path: ${dtc}):\n${stderr}` }
    }
    return { canceled: false, dtsPath, dtbPath }
  } catch (e) {
    return { error: String(e.message || e) }
  }
})