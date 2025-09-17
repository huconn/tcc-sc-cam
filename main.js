const { app, BrowserWindow } = require('electron')
const path = require('node:path')

let mainWindow = null
const isDev = process.env.NODE_ENV === 'development'

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false, // 창을 먼저 숨김
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'assets/icon.svg'),
    titleBarStyle: 'default',
    autoHideMenuBar: true
  })

  // 창이 준비되면 표시
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // In development, load from Vite dev server
  if (isDev) {
    mainWindow.loadURL('http://localhost:5175')
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
    // Open DevTools in production for debugging
    mainWindow.webContents.openDevTools()
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