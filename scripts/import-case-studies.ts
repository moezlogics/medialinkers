import mongoose from "mongoose";
import sharp from "sharp";
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { Readable } from "node:stream";
import { Media, Project, Service } from "../src/lib/models";
import { CASE_STUDIES } from "./case-studies";

const DIR = path.resolve(process.cwd(), "..", "case studies");

/** Stores a local screenshot in the media library (WebP) once; returns url + size. */
async function uploadLocal(file: string, alt: string) {
  const existing = await Media.findOne({ originalName: file }).lean<{ url: string; width: number; height: number }>();
  if (existing) return existing;
  const full = path.join(DIR, file);
  if (!existsSync(full)) {
    console.warn("  ! screenshot not found:", full);
    return null;
  }
  const out = await sharp(readFileSync(full)).webp({ quality: 88 }).toBuffer({ resolveWithObject: true });
  const slug = alt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  const filename = `${Date.now().toString(36)}-${slug}.webp`;
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db!, { bucketName: "media" });
  const fileId = await new Promise<unknown>((resolve, reject) => {
    const up = bucket.openUploadStream(filename, { metadata: { mime: "image/webp" } });
    Readable.from(out.data).pipe(up).on("error", reject).on("finish", () => resolve(up.id));
  });
  const doc = { fileId, filename, originalName: file, url: `/media/${filename}`, mime: "image/webp", size: out.data.length, width: out.info.width, height: out.info.height, alt, title: alt };
  await Media.create(doc);
  return doc;
}

/** Creates or refreshes every case study (matched by slug). */
export async function importCaseStudies({ overwrite = false } = {}) {
  const services = await Service.find({}, "slug").lean<{ _id: unknown; slug: string }[]>();
  const bySlug = new Map(services.map((s) => [s.slug, String(s._id)]));
  for (const cs of CASE_STUDIES) {
    const exists = await Project.exists({ slug: cs.slug });
    if (exists && !overwrite) {
      console.log("  = case study exists:", cs.slug);
      continue;
    }
    const proofs = [];
    for (const p of cs.proofs) {
      const m = await uploadLocal(p.file, p.caption);
      if (m) proofs.push({ image: m.url, caption: p.caption, width: m.width, height: m.height });
    }
    const missing = cs.services.filter((s) => !bySlug.has(s));
    if (missing.length) console.warn("  ! unknown service slugs:", missing.join(", "));
    const doc = {
      title: cs.title,
      slug: cs.slug,
      client: cs.client,
      confidential: !!cs.confidential,
      website: cs.confidential ? "" : cs.website || "",
      industry: cs.industry,
      location: cs.location,
      period: cs.period,
      duration: cs.duration,
      serviceRefs: cs.services.map((s) => bySlug.get(s)).filter(Boolean),
      excerpt: cs.excerpt,
      accent: cs.accent,
      featured: cs.featured,
      order: cs.order,
      results: cs.results,
      trend: cs.trend,
      challenge: cs.challenge,
      approach: cs.approach,
      outcome: cs.outcome,
      proofs,
      status: "published",
      seo: cs.seo,
    };
    await Project.updateOne({ slug: cs.slug }, { $set: doc }, { upsert: true });
    console.log(exists ? "  ↻ case study updated:" : "  + case study created:", cs.slug);
  }
}
