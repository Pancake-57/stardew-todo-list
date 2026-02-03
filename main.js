const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    x: Math.round((screenWidth - 800) / 2),
    y: Math.round((screenHeight - 600) / 2) - 50,
    transparent: true,
    frame: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}




ipcMain.on('get-window-size', () => {
    if (mainWindow) {
        const size = mainWindow.getSize();
        mainWindow.webContents.send('window-size', {
            width: size[0],
            height: size[1]
        });
    }
});

ipcMain.on('set-auto-launch', (event, enable) => {
    app.setLoginItemSettings({
        openAtLogin: enable,
        path: process.execPath,
        args: []
    });
    mainWindow.webContents.send('auto-launch-status', enable);
});

ipcMain.on('get-auto-launch-status', () => {
    const settings = app.getLoginItemSettings();
    mainWindow.webContents.send('auto-launch-status', settings.openAtLogin);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});