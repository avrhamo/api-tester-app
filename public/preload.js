const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

fs.writeFileSync(path.join(__dirname, 'preload-executed.txt'), 'Preload script executed at ' + new Date().toISOString());

console.log('Preload script is running');

contextBridge.exposeInMainWorld('electron', {
  connectToDatabase: (connectionString) => ipcRenderer.invoke('connect-to-database', connectionString),
  listDatabases: () => ipcRenderer.invoke('list-databases'),
  listCollections: (dbName) => ipcRenderer.invoke('list-collections', dbName),
  disconnectFromDatabase: () => ipcRenderer.invoke('disconnect-from-database'),
  fetchCollectionData: (dbName, collectionName, limit) => 
    ipcRenderer.invoke('fetch-collection-data', dbName, collectionName, limit),
});

console.log('Electron APIs exposed to renderer');