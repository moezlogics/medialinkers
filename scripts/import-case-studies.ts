import mongoose from "mongoose";
import sharp from "sharp";
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { Readable } from "node:stream";
import { Media, Project, Service } from "../src/lib/models";
import { CASE_STUDIES } from "./case-studies";

// Screenshots ship with the repo (scripts/case-study-images); the old outside folder still works
const DIRS = [path.resolve(process.cwd(), "scripts", "case-study-images"), path.resolve(process.cwd(), "..", "case studies")];

/** Stores a local screenshot in the media library (WebP) once; returns url + size. */
async function uploadLocal(file: string, alt: string) {
  const existing = await Media.findOne({ originalName: file }).lean<{ url: string; width: number; height: number }>();
  if (existing) return existing;
  const full = DIRS.map((d) => path.join(d, file)).find((f) => existsSync(f));
  if (!full) {
    console.warn("  ! screenshot not found:", path.join(DIRS[0], file));
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

type Uploaded = { image: string; caption: string; width: number; height: number };

async function uploadAll(items: { file: string; caption: string }[]) {
  const out: Uploaded[] = [];
  for (const p of items) {
    const m = await uploadLocal(p.file, p.caption);
    if (m) out.push({ image: m.url, caption: p.caption, width: m.width, height: m.height });
  }
  return out;
}

/**
 * Creates missing case studies. Existing ones are never overwritten (they may have been
 * edited in the admin panel) — only empty proof screenshots, website screenshots or cover
 * images are filled in. `overwrite: true` rewrites them from scripts/case-studies.ts.
 */
export async function importCaseStudies({ overwrite = false } = {}) {
  const services = await Service.find({}, "slug").lean<{ _id: unknown; slug: string }[]>();
  const bySlug = new Map(services.map((s) => [s.slug, String(s._id)]));
  let created = 0;
  let filled = 0;
  for (const cs of CASE_STUDIES) {
    const current = await Project.findOne({ slug: cs.slug }, "proofs screens coverImage").lean<{ proofs?: unknown[]; screens?: unknown[]; coverImage?: string }>();
    const exists = !!current;
    if (exists && !overwrite) {
      const set: Record<string, unknown> = {};
      if (!current.proofs?.length && cs.proofs.length) {
        const proofs = await uploadAll(cs.proofs);
        if (proofs.length) set.proofs = proofs;
      }
      if (!current.screens?.length && cs.screens?.length) {
        const shots = await uploadAll(cs.screens);
        if (shots.length) set.screens = shots.map((x, i) => ({ ...x, device: cs.screens![i]?.device || "desktop" }));
      }
      if (!current.coverImage && cs.cover) {
        const m = await uploadLocal(cs.cover, `${cs.client} website`);
        if (m) set.coverImage = m.url;
      }
      if (Object.keys(set).length) {
        await Project.updateOne({ slug: cs.slug }, { $set: set });
        console.log(`  + added ${Object.keys(set).join(", ")}: ${cs.slug}`);
        filled++;
      }
      continue;
    }
    const proofs = await uploadAll(cs.proofs);
    const screens = (await uploadAll(cs.screens || [])).map((x, i) => ({ ...x, device: cs.screens![i]?.device || "desktop" }));
    const cover = cs.cover ? await uploadLocal(cs.cover, `${cs.client} website`) : null;
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
      trend: cs.trend || { label: "", points: [] },
      challenge: cs.challenge,
      approach: cs.approach,
      outcome: cs.outcome,
      proofs,
      screens,
      coverImage: cover?.url || "",
      status: "published",
      seo: cs.seo,
    };
    await Project.updateOne({ slug: cs.slug }, { $set: doc }, { upsert: true });
    console.log(exists ? "  ↻ case study rewritten:" : "  + case study created:", cs.slug);
    created++;
  }
  console.log(`Case studies: ${created} created/rewritten, ${filled} updated with missing images, ${CASE_STUDIES.length - created - filled} unchanged`);
}
