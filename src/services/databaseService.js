export const connectToDatabase = async (connectionString) => {
    const result = await window.electron.connectToDatabase(connectionString);
    if (!result.success) {
      throw new Error(result.error);
    }
  };
  
export const disconnectFromDatabase = async () => {
  const result = await window.electron.disconnectFromDatabase();
  if (!result.success) {
    throw new Error(result.error);
  }
};

export const listDatabases = async () => {
  return await window.electron.listDatabases();
};

export const listCollections = async (dbName) => {
  return await window.electron.listCollections(dbName);
};

export const getCollectionFields = async (database, collection) => {
  try {
    const fields = await ipcRenderer.invoke('get-collection-fields', { database, collection });
    return fields;
  } catch (error) {
    console.error('Error fetching collection fields:', error);
    throw error;
  }
};
  