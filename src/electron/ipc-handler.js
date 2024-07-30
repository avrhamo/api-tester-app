const { ipcMain } = require('electron');
const { MongoClient } = require('mongodb');

let client = null;

ipcMain.handle('connect-to-database', async (event, connectionString) => {
  try {
    client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-databases', async () => {
  if (!client) {
    throw new Error('Not connected to a database');
  }
  const adminDb = client.db().admin();
  const dbList = await adminDb.listDatabases();
  return dbList.databases.map(db => db.name);
});

ipcMain.handle('list-collections', async (event, dbName) => {
  if (!client) {
    throw new Error('Not connected to a database');
  }
  const db = client.db(dbName);
  const collections = await db.listCollections().toArray();
  return collections.map(collection => collection.name);
});

ipcMain.handle('disconnect-from-database', async () => {
  if (client) {
    await client.close();
    client = null;
    return { success: true };
  }
  return { success: false, error: 'Not connected to a database' };
});