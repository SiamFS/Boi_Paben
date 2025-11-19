import { MongoClient, ServerApiVersion } from 'mongodb';

let db = null;
let client = null;

export const connectDB = async () => {
  try {
    if (db) return db;

    client = new MongoClient(process.env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      },
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 60000,
      waitQueueTimeoutMS: 5000
    });    await client.connect();
    if (process.env.NODE_ENV !== 'production') {
      console.log('MongoDB connected successfully');
    }
    
    db = client.db('coverbook');
    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

export const getCollection = (collectionName) => {
  const database = getDB();
  return database.collection(collectionName);
};

export const getClient = () => {
  if (!client) {
    throw new Error('Database client not initialized');
  }
  return client;
};

export const closeDB = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
};

process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});