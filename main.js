const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')

let mainWindow = null
const isDev = process.env.NODE_ENV === 'development'

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false, // 창을 먼저 숨김
    fullscreen: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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
  return app.getVersion()
})