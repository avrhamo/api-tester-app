const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { connectToDatabase, listDatabases, listCollections, handleGetCollectionFields } = require('../src/electron/ipc-handler');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('connect-to-database', async (event, connectionString) => {
  return connectToDatabase(connectionString);
});

ipcMain.handle('list-databases', async () => {
  return listDatabases();
});

ipcMain.handle('list-collections', async (event, dbName) => {
  return listCollections(dbName);
});

ipcMain.handle('get-collection-fields', async (event, args) => {
  console.log('Received get-collection-fields request with args:', args);
  try {
    const result = await handleGetCollectionFields(args);
    console.log('handleGetCollectionFields result:', result);
    return result;
  } catch (error) {
    console.error('Error in get-collection-fields handler:', error);
    throw error;
  }
});