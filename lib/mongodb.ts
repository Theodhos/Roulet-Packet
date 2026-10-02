import { MongoClient } from "mongodb";

const DB_NAME = "package_roulette";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Lazily connects on first use so a missing MONGODB_URI never crashes
 * `next build` (route handlers only call this at request time). In dev,
 * the client is cached on `global` so hot-reload doesn't open a new
 * connection on every edit.
 */
function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    return global._mongoClientPromise;
  }

  return new MongoClient(uri).connect();
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}
