const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  connectToDatabase: (connectionString) => ipcRenderer.invoke('connect-to-database', connectionString),
  listDatabases: () => ipcRenderer.invoke('list-databases'),
  listCollections: (dbName) => ipcRenderer.invoke('list-collections', dbName),
  disconnectFromDatabase: () => ipcRenderer.invoke('disconnect-from-database'),
});