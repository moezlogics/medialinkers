/**
 * Loads a content file made by export-content.ts into the database in .env.local.
 * By default it only fills EMPTY collections, so it never overwrites live content.
 *
 * Run: npx tsx scripts/import-content.ts deploy/content.json.gz
 *      npx tsx scripts/import-content.ts deploy/content.json.gz --replace   (replaces those collections)
 */
import { config } from "dotenv";
// Reads .env.local first, then .env (whichever the server uses)
config({ path: [".env.local", ".env"], quiet: true });
import mongoose from "mongoose";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import path from "node:path";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing — add it to .env or .env.local");
  const file = path.resolve(process.argv[2] || "deploy/content.json.gz");
  const replace = process.argv.includes("--replace");
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  const { EJSON } = mongoose.mongo.BSON;
  const dump = EJSON.parse(gunzipSync(readFileSync(file)).toString("utf8"), { relaxed: false }) as { collections: Record<string, Record<string, unknown>[]> };

  for (const [name, docs] of Object.entries(dump.collections)) {
    const col = db.collection(name);
    const existing = await col.countDocuments();
    if (existing && !replace) {
      console.log(`${name.padEnd(14)} skipped (already has ${existing}; use --replace to overwrite)`);
      continue;
    }
    if (existing) await col.deleteMany({});
    if (docs.length) await col.insertMany(docs, { ordered: false });
    console.log(`${name.padEnd(14)} ${docs.length} imported`);
  }
  // Indexes (unique slugs etc.) are created by the app's models on first start
  await mongoose.disconnect();
  console.log("Import complete ✔  Next: npm run seed (creates the admin user), then npm run build");
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
