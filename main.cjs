const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

let mainWindow = null
const isDev = process.env.NODE_ENV === 'development'

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false, // 창을 먼저 숨김
    fullscreen: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      // 프로덕션에서는 개발자 도구 비활성화 / 불필요한 네트워크 사용 최소화
      devTools: isDev,
      spellcheck: false
    },
    icon: path.join(__dirname, 'assets/telechips.ico'),
    titleBarStyle: 'default',
    autoHideMenuBar: true
  })

  // 창이 준비되면 표시
  mainWindow.once('ready-to-show', () => {
    try { mainWindow.maximize() } catch {}
    mainWindow.show()
  })

  // In development, load from Vite dev server
  if (isDev) {
    mainWindow.loadURL('http://localhost:5175')
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
    // 프로덕션에서는 개발자 도구를 열지 않음
  }

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
    let dtsTextForSave = ''
    if (ext === '.json') {
      jsonText = fs.readFileSync(inputPath, 'utf-8')
    } else {
      // Resolve packaged dtc if available (needed for .dtb inputs)
      const dtcCandidatePacked = path.join(process.resourcesPath || process.cwd(), 'tools', 'DTC.exe')
      const dtcPath = process.env.DTC_PATH || (require('fs').existsSync(dtcCandidatePacked) ? dtcCandidatePacked : undefined)
      const dtc = dtcPath || 'dtc'
      // If input is DTS, read it directly for saving later
      if (ext === '.dts') {
        dtsTextForSave = fs.readFileSync(inputPath, 'utf-8')
      }
      jsonText = convertDtbToJson(dtc, inputPath)
      // If it was DTB, convert to DTS explicitly for saving later
      if (ext === '.dtb') {
        const { spawnSync } = require('node:child_process')
        const resDts = spawnSync(dtc, ['-I', 'dtb', '-O', 'dts', inputPath], { stdio: 'pipe', encoding: 'utf-8' })
        if (resDts.status === 0) {
          dtsTextForSave = resDts.stdout
        }
      }
    }
    fs.writeFileSync(outPath, jsonText, 'utf-8')

    return { canceled: false, inputPath, outPath, jsonText, dtsText: dtsTextForSave }
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