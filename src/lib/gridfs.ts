import "server-only";
import mongoose from "mongoose";
import { connectDB } from "./db";

export async function mediaBucket() {
  const conn = await connectDB();
  return new mongoose.mongo.GridFSBucket(conn.connection.db!, { bucketName: "media" });
}
