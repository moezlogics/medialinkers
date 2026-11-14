/**
 * Adds new case studies (and any missing screenshots) to the database. Safe to run on
 * every deploy: case studies that already exist are never overwritten.
 * Run: npx tsx scripts/sync-case-studies.ts
 */
import { config } from "dotenv";
// Reads .env.local first, then .env (whichever the server uses)
config({ path: [".env.local", ".env"], quiet: true });
import mongoose from "mongoose";
import { importCaseStudies } from "./import-case-studies";
import { Page } from "../src/lib/models";

// Totals across all case studies (Nov 2026)
export const CASE_STUDY_STATS = [
  { value: "850K+", label: "Organic clicks delivered" },
  { value: "90M+", label: "Google search impressions" },
  { value: "31×", label: "Biggest traffic jump" },
  { value: "6", label: "Countries · 15+ industries" },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing — add it to .env or .env.local");
  await mongoose.connect(uri);
  await importCaseStudies();
  // Refresh the totals on /case-studies only while they still show the first-launch numbers
  const res = await Page.updateOne(
    { slug: "case-studies", sections: { $elemMatch: { type: "stats", "data.items.0.value": "84K+" } } },
    { $set: { "sections.$.data.items": CASE_STUDY_STATS } },
  );
  if (res.modifiedCount) console.log("  ↻ /case-studies totals updated");
  await Page.updateOne(
    { slug: "case-studies", "seo.metaDescription": /84K\+ organic clicks/ },
    { $set: { "seo.metaDescription": "Real results from Media Linkers clients: 850K+ organic clicks and 90M+ Google impressions across 6 countries — SEO, local SEO, AI visibility and web development." } },
  );
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
