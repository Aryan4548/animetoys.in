import "dotenv/config";
import mongoose from "mongoose";

/**
 * Standalone Mongoose connection for CLI scripts (create-admin, seed). These
 * run outside the Next.js request lifecycle via `tsx`, so they load their
 * own .env and open/close their own connection rather than reusing
 * src/lib/db.ts's cached-connection pattern (which is designed for the
 * Next.js server process).
 */
export async function connectStandalone(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Copy .env.example to .env and configure it first.");
    process.exit(1);
  }
  mongoose.set("strictQuery", true);
  return mongoose.connect(uri);
}

export async function disconnectStandalone(): Promise<void> {
  await mongoose.disconnect();
}
