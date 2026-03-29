import { MongoClient } from 'mongodb';

let cachedClient = null;

export async function connectDB() {
  if (cachedClient) {
    try {
      // ping to check if still alive
      await cachedClient.db('admin').command({ ping: 1 });
      return cachedClient;
    } catch {
      cachedClient = null;
    }
  }
  const uri = Netlify.env.get('MONGODB_URI');
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  await client.connect();
  cachedClient = client;
  return client;
}

export function getDB(client) {
  return client.db('jwelleryWeb');
}
