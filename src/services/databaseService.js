const { ipcRenderer } = window.require('electron');

export const connectToDatabase = async (connectionString) => {
  try {
    const result = await ipcRenderer.invoke('connect-to-database', connectionString);
    return result;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

export const listDatabases = async () => {
  try {
    const databases = await ipcRenderer.invoke('list-databases');
    return databases;
  } catch (error) {
    console.error('Error listing databases:', error);
    throw error;
  }
};

export const listCollections = async (dbName) => {
  try {
    const collections = await ipcRenderer.invoke('list-collections', dbName);
    return collections;
  } catch (error) {
    console.error('Error listing collections:', error);
    throw error;
  }
};

export const getCollectionFields = async (database, collection) => {
  console.log('Calling getCollectionFields with:', { database, collection });
  try {
    const fields = await ipcRenderer.invoke('get-collection-fields', { database, collection });
    console.log('Received fields:', fields);
    return fields;
  } catch (error) {
    console.error('Error fetching collection fields:', error);
    throw error;
  }
};