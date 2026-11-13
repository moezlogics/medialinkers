import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

type Cached = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { _mongoose?: Cached };
const cached: Cached = g._mongoose ?? { conn: null, promise: null };
g._mongoose = cached;

// Unknown fields in query filters are dropped. User input is always cast with String() before it reaches a filter.
mongoose.set("strictQuery", true);

export async function connectDB() {
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local");
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

/** Plain JSON-safe copy of a lean document (ObjectIds and Dates become strings). */
export function toPlain<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}
