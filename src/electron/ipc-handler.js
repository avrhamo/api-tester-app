const { ipcMain } = require('electron');
const { MongoClient } = require('mongodb');
const http = require('http');
const https = require('https');
const url = require('url');

let client = null;

function setupIpcHandlers() {
  ipcMain.handle('connect-to-database', async (event, connectionString) => {
    try {
      client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      return { success: true };
    } catch (error) {
      console.error('Error connecting to database:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('list-databases', async () => {
    if (!client || !client.topology || !client.topology.isConnected()) {
      throw new Error('Not connected to a database');
    }
    try {
      const adminDb = client.db().admin();
      const dbList = await adminDb.listDatabases();
      return dbList.databases.map(db => db.name);
    } catch (error) {
      console.error('Error listing databases:', error);
      throw error;
    }
  });

  ipcMain.handle('list-collections', async (event, dbName) => {
    if (!client || !client.topology || !client.topology.isConnected()) {
      throw new Error('Not connected to a database');
    }
    try {
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      return collections.map(collection => collection.name);
    } catch (error) {
      console.error('Error listing collections:', error);
      throw error;
    }
  });

  ipcMain.handle('get-collection-fields', async (event, dbName, collectionName) => {
    if (!client || !client.topology || !client.topology.isConnected()) {
      throw new Error('Not connected to a database');
    }
    try {
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      const sampleDocument = await collection.findOne();
  
      if (!sampleDocument) {
        return [];
      }
  
      const allFieldPaths = getNestedKeys(sampleDocument);
      return allFieldPaths;
    } catch (error) {
      console.error('Error getting collection fields:', error);
      throw error;
    }
  });
  

  ipcMain.handle('fetch-mongodb-data', async (event, database, collection, limit) => {
    if (!client || !client.topology || !client.topology.isConnected()) {
      throw new Error('Not connected to a database');
    }
    try {
      const db = client.db(database);
      const coll = db.collection(collection);
      const data = await coll.aggregate([{ $sample: { size: 1 } }]).toArray();
      return data;
    } catch (error) {
      console.error('Error fetching MongoDB data:', error);
      throw error;
    }
  });

  ipcMain.handle('make-http-request', async (event, { method, url: requestUrl, headers, data }) => {
    return new Promise((resolve, reject) => {
      const parsedUrl = url.parse(requestUrl);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: method.toUpperCase(),
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      };

      const req = (parsedUrl.protocol === 'https:' ? https : http).request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseBody,
          });
        });
      });
``
      req.on('error', (error) => {
        reject(error);
      });

      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        const bodyData = JSON.stringify(data);
        req.write(bodyData);
      }
      req.end();
    });
  });

  ipcMain.handle('disconnect-from-database', async () => {
    if (client) {
      try {
        await client.close();
        client = null;
        return { success: true };
      } catch (error) {
        console.error('Error disconnecting from database:', error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Not connected to a database' };
  });

  ipcMain.handle('fetch-collection-data', async (event, dbName, collectionName, limit = 100) => {
    if (!client) {
      throw new Error('Not connected to a database');
    }
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    return await collection.find().limit(limit).toArray();
  });
}

const getNestedKeys = (obj, parentPath = '', maxDepth = 5, currentDepth = 0) => {
  let keys = [];

  // Check if max depth is reached
  if (currentDepth >= maxDepth) {
    return keys;  // Stop recursion if max depth is reached
  }

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          // Only process the first element of the array
          const firstElement = obj[key][0];
          if (firstElement && typeof firstElement === 'object') {
            keys.push(`${currentPath}[0]`); // Show the array itself with the first element
            keys = keys.concat(getNestedKeys(firstElement, `${currentPath}[0]`, maxDepth, currentDepth + 1));
          } else {
            keys.push(currentPath); // Add the path without expanding if it's a primitive
          }
        } else {
          // Process nested objects
          keys = keys.concat(getNestedKeys(obj[key], currentPath, maxDepth, currentDepth + 1));
        }
      } else {
        // Add primitive data type path
        keys.push(currentPath);
      }
    }
  }

  return keys;
};

module.exports = { setupIpcHandlers };