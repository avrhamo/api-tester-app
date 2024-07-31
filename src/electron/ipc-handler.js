const { MongoClient } = require('mongodb');

let client = null;

const connectToDatabase = async (connectionString) => {
  try {
    client = new MongoClient(connectionString);
    await client.connect();
    console.log('Connected to MongoDB');
    return { success: true };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return { success: false, error: error.message };
  }
};

const listDatabases = async () => {
  try {
    const adminDb = client.db().admin();
    const dbList = await adminDb.listDatabases();
    return dbList.databases.map(db => db.name);
  } catch (error) {
    console.error('Error listing databases:', error);
    throw error;
  }
};

const listCollections = async (dbName) => {
  try {
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    return collections.map(col => col.name);
  } catch (error) {
    console.error('Error listing collections:', error);
    throw error;
  }
};

const handleGetCollectionFields = async ({ database, collection }) => {
  console.log('handleGetCollectionFields called with:', { database, collection });
  try {
    const db = client.db(database);
    console.log('Attempting to find a sample document');
    const sampleDocument = await db.collection(collection).findOne();
    
    console.log("Sample document:", sampleDocument);

    if (!sampleDocument) {
      console.log('No sample document found');
      return [];
    }

    // ... rest of the function ...
  } catch (error) {
    console.error('Error in handleGetCollectionFields:', error);
    throw error;
  }
};

module.exports = {
  connectToDatabase,
  listDatabases,
  listCollections,
  handleGetCollectionFields,
};