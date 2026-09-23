import mongoose from "mongoose";

// Read lazily (inside connectDB, not at module scope) so that simply
// *importing* this file — which happens for every API route during
// `next build`'s page-data-collection step — never fails just because
// `.env` hasn't been created yet. The error only fires when a request
// actually tries to talk to the database.
function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env and set MONGODB_URI to your local MongoDB connection string."
    );
  }
  return uri;
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Reuse the connection across hot reloads in dev and across serverless-style
// invocations. Stored on globalThis so it survives module re-evaluation.
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose
      .connect(getMongoUri(), {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => m);
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}

export default connectDB;
