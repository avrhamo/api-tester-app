const { ipcRenderer } = window.require('electron');

export const connectToDatabase = async (connectionString) => {
  try {
    const result = await ipcRenderer.invoke('connect-to-database', connectionString);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

export const disconnectFromDatabase = async () => {
  try {
    const result = await ipcRenderer.invoke('disconnect-from-database');
    if (!result.success) {
      throw new Error(result.error);
    }
    return result;
  } catch (error) {
    console.error('Error disconnecting from database:', error);
    throw error;
  }
};

export const listDatabases = async () => {
  try {
    return await ipcRenderer.invoke('list-databases');
  } catch (error) {
    console.error('Error listing databases:', error);
    throw error;
  }
};

export const listCollections = async (dbName) => {
  try {
    return await ipcRenderer.invoke('list-collections', dbName);
  } catch (error) {
    console.error('Error listing collections:', error);
    throw error;
  }
};

export const getCollectionFields = async (dbName, collectionName) => {
  try {
    return await ipcRenderer.invoke('get-collection-fields', dbName, collectionName);
  } catch (error) {
    console.error('Error getting collection fields:', error);
    throw error;
  }
};