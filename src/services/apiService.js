const { ipcRenderer } = window.require('electron');

const fetchDataFromMongoDB = async (database, collection) => {
  try {
    const data = await ipcRenderer.invoke('fetch-mongodb-data', database, collection, 1);
    return data[0];
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    throw error;
  }
};

const mapDataToRequest = (mongoData, fieldMappings) => {
  const mappedData = {
    queryParams: {}, // Always initialize even if not used
    headers: {},     // Always initialize even if not used
    body: {}         // Always initialize even if not used
  };

  // Process URL parameters
  if (fieldMappings.urlParams) {
    Object.entries(fieldMappings.urlParams).forEach(([apiField, dbField]) => {
      if (dbField.collectionField && mongoData[dbField.collectionField] !== undefined) {
        mappedData.queryParams[apiField] = mongoData[dbField.collectionField];
      } else if (dbField.fixedValue !== undefined) {
        mappedData.queryParams[apiField] = dbField.fixedValue;
      }
    });
  }

  // Process headers
  if (fieldMappings.headers) {
    Object.entries(fieldMappings.headers).forEach(([apiField, dbField]) => {
      if (dbField.collectionField && mongoData[dbField.collectionField] !== undefined) {
        mappedData.headers[apiField] = mongoData[dbField.collectionField];
      } else if (dbField.fixedValue !== undefined) {
        mappedData.headers[apiField] = dbField.fixedValue;
      }
    });
  }

  // Process body
  if (fieldMappings.body) {
    Object.entries(fieldMappings.body).forEach(([apiField, dbField]) => {
      if (dbField.collectionField && mongoData[dbField.collectionField] !== undefined) {
        mappedData.body[apiField] = mongoData[dbField.collectionField];
      } else if (dbField.fixedValue !== undefined) {
        mappedData.body[apiField] = dbField.fixedValue;
      }
    });
  }

  console.log('Mapped Data:', mappedData);
  return mappedData;
};

const makeRequest = async (method, url, headers, queryParams, body) => {
  let fullUrl = new URL(url);
  
  // Add query parameters
  Object.entries(queryParams).forEach(([key, value]) => {
    fullUrl.searchParams.append(key, value);
  });

  const requestOptions = {
    method,
    url: fullUrl.toString(),
    headers: { ...headers, 'Content-Type': 'application/json' },
  };

  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && Object.keys(body).length > 0) {
    requestOptions.data = JSON.stringify(body);
  }

  return ipcRenderer.invoke('make-http-request', requestOptions);
};

const createRequestQueue = (concurrency) => {
  const queue = [];
  const executingRequests = new Set();

  const executeNext = async () => {
    if (executingRequests.size >= concurrency || queue.length === 0) return;

    const { resolve, reject, func } = queue.shift();
    executingRequests.add(func);

    try {
      const result = await func();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      executingRequests.delete(func);
      executeNext();
    }
  };

  return (func) => {
    return new Promise((resolve, reject) => {
      queue.push({ resolve, reject, func });
      executeNext();
    });
  };
};

export const executeApiTest = async (apiConfig, testParams) => {
  const { url, method, headers: configHeaders, fieldMappings, selectedCollection } = apiConfig;
  const { numRequests, concurrency } = testParams;

  const results = {
    totalRequests: numRequests,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: []
  };

  const enqueue = createRequestQueue(concurrency);

  const executeRequest = async () => {
    const startTime = Date.now();
    try {
      const mongoData = await fetchDataFromMongoDB(selectedCollection.database, selectedCollection.collection);
      const { queryParams, headers, body } = mapDataToRequest(mongoData, fieldMappings);

      const response = await makeRequest(
        method,
        url,
        { ...configHeaders, ...headers },
        queryParams,
        body
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        results.successfulRequests++;
      } else {
        results.failedRequests++;
      }
    } catch (error) {
      results.failedRequests++;
      console.error('API request failed:', error);
    }
    const endTime = Date.now();
    results.responseTimes.push(endTime - startTime);
  };

  const requests = Array.from({ length: numRequests }, () => enqueue(executeRequest));
  await Promise.all(requests);

  results.avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / numRequests;
  results.minResponseTime = Math.min(...results.responseTimes);
  results.maxResponseTime = Math.max(...results.responseTimes);

  return results;
};