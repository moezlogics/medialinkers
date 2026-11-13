/**
 * Exports all website content (pages, services, posts, case studies, settings, media files…)
 * to one gzipped file, so it can be loaded into the live database with import-content.ts.
 * Users, leads and audit requests are NOT exported (the live site creates its own).
 *
 * Run: npx tsx scripts/export-content.ts [output-file]   (default: deploy/content.json.gz)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";
import { gzipSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export const CONTENT_COLLECTIONS = ["settings", "pages", "services", "categories", "posts", "projects", "testimonials", "redirects", "media", "media.files", "media.chunks"];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing in .env.local");
  const out = path.resolve(process.argv[2] || "deploy/content.json.gz");
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  const { EJSON } = mongoose.mongo.BSON;
  const data: Record<string, unknown[]> = {};
  for (const name of CONTENT_COLLECTIONS) {
    data[name] = await db.collection(name).find().toArray();
    console.log(`${name.padEnd(14)} ${data[name].length}`);
  }
  mkdirSync(path.dirname(out), { recursive: true });
  // Canonical EJSON keeps ObjectIds, dates and binary file chunks exactly as they are
  const body = gzipSync(EJSON.stringify({ exportedAt: new Date(), collections: data }, { relaxed: false }));
  writeFileSync(out, body);
  console.log(`Saved ${out} (${(body.length / 1024 / 1024).toFixed(2)} MB)`);
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
