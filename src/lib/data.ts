import "server-only";
import { cache } from "react";
import { connectDB, toPlain } from "./db";
import { Category, Page, Post, Project, Redirect, Service, Setting, Testimonial } from "./models";
import { defaultSettings, deepMerge } from "./settings-defaults";
import type { CategoryDoc, PageDoc, PostDoc, ProjectDoc, ServiceChild, ServiceDoc, SiteSettings, TestimonialDoc } from "./types";

/**
 * Public data access. Every getter is de-duplicated per request with React `cache`.
 * `preview = true` (Draft Mode, admins only) also returns unpublished content.
 */

export const getSettings = cache(async (): Promise<SiteSettings> => {
  await connectDB();
  const doc = await Setting.findOne({ key: "site" }).lean<{ data: Partial<SiteSettings> }>();
  return deepMerge(defaultSettings, doc?.data ?? {});
});

export const getPage = cache(async (slug: string, preview = false): Promise<PageDoc | null> => {
  await connectDB();
  const doc = await Page.findOne(preview ? { slug } : { slug, status: "published" }).lean();
  return doc ? toPlain<PageDoc>(doc) : null;
});

/** Main (top-level) services, each with its published sub-services attached as `children`. */
export const getServices = cache(async (): Promise<ServiceDoc[]> => {
  await connectDB();
  const [top, kids] = await Promise.all([
    Service.find({ status: "published", parent: null }).sort({ order: 1, createdAt: 1 }).lean(),
    Service.find({ status: "published", parent: { $ne: null } }, "title shortTitle slug icon excerpt parent order").sort({ order: 1, createdAt: 1 }).lean(),
  ]);
  const parents = toPlain<ServiceDoc[]>(top);
  const children = toPlain<(ServiceChild & { parent: string })[]>(kids);
  return parents.map((p) => ({
    ...p,
    children: children.filter((c) => c.parent === p._id).map(({ _id, title, shortTitle, slug, icon, excerpt }) => ({ _id, title, shortTitle, slug, icon, excerpt })),
  }));
});

/** A single service or sub-service by slug (slugs are unique across both levels). */
export const getService = cache(async (slug: string, preview = false): Promise<ServiceDoc | null> => {
  await connectDB();
  const doc = await Service.findOne(preview ? { slug } : { slug, status: "published" }).lean();
  return doc ? toPlain<ServiceDoc>(doc) : null;
});

export const getServiceById = cache(async (id: string): Promise<ServiceDoc | null> => {
  await connectDB();
  const doc = await Service.findById(id).lean();
  return doc ? toPlain<ServiceDoc>(doc) : null;
});

export const getCategories = cache(async (): Promise<CategoryDoc[]> => {
  await connectDB();
  return toPlain<CategoryDoc[]>(await Category.find().sort({ name: 1 }).lean());
});

export const getCategory = cache(async (slug: string): Promise<CategoryDoc | null> => {
  await connectDB();
  const doc = await Category.findOne({ slug }).lean();
  return doc ? toPlain<CategoryDoc>(doc) : null;
});

const publishedPostFilter = () => ({ status: "published", publishedAt: { $lte: new Date() } });

type PostQuery = { page?: number; perPage?: number; category?: string; exclude?: string; limit?: number };

async function queryPosts(opts: PostQuery = {}) {
  await connectDB();
  const perPage = opts.limit ?? opts.perPage ?? 9;
  const page = Math.max(1, opts.page ?? 1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = publishedPostFilter();
  if (opts.category) filter.category = opts.category;
  if (opts.exclude) filter._id = { $ne: opts.exclude };
  const [docs, total] = await Promise.all([
    Post.find(filter, { content: 0 })
      .sort({ publishedAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("category", "name slug")
      .populate("author", "name avatar")
      .lean(),
    Post.countDocuments(filter),
  ]);
  return { posts: toPlain<PostDoc[]>(docs), total, pages: Math.max(1, Math.ceil(total / perPage)), page };
}

// `cache` compares arguments by identity, so the options are passed as a stable JSON key.
const cachedPosts = cache((key: string) => queryPosts(JSON.parse(key) as PostQuery));
export function getPosts(opts: PostQuery = {}) {
  return cachedPosts(JSON.stringify(opts));
}

export const getPost = cache(async (slug: string, preview = false): Promise<PostDoc | null> => {
  await connectDB();
  const doc = await Post.findOne(preview ? { slug } : { slug, ...publishedPostFilter() })
    .populate("category", "name slug")
    .populate("author", "name avatar bio")
    .lean();
  return doc ? toPlain<PostDoc>(doc) : null;
});

// Cards only need the summary, never the long story
const PROJECT_CARD = { content: 0, challenge: 0, approach: 0, outcome: 0, proofs: 0, gallery: 0, seo: 0 };
const PROJECT_SORT = { featured: -1, order: 1, createdAt: -1 } as const;

export const getProjects = cache(async (limit = 0, featuredOnly = false): Promise<ProjectDoc[]> => {
  await connectDB();
  const q = Project.find({ status: "published", ...(featuredOnly ? { featured: true } : {}) }, PROJECT_CARD).sort(PROJECT_SORT);
  if (limit) q.limit(limit);
  return toPlain<ProjectDoc[]>(await q.lean());
});

/**
 * Case studies for a service page: projects linked to the service, its main service or any
 * of its sub-services. Falls back to the best overall results so every page shows proof.
 */
export const getProjectsForService = cache(async (ids: string, limit = 3): Promise<{ items: ProjectDoc[]; matched: boolean }> => {
  await connectDB();
  const list = ids.split(",").filter(Boolean);
  const items = toPlain<ProjectDoc[]>(await Project.find({ status: "published", serviceRefs: { $in: list } }, PROJECT_CARD).sort(PROJECT_SORT).limit(limit).lean());
  if (items.length) return { items, matched: true };
  return { items: await getProjects(limit, true), matched: false };
});

export const getProject = cache(async (slug: string, preview = false): Promise<ProjectDoc | null> => {
  await connectDB();
  const doc = await Project.findOne(preview ? { slug } : { slug, status: "published" }).lean();
  return doc ? toPlain<ProjectDoc>(doc) : null;
});

export const getTestimonials = cache(async (): Promise<TestimonialDoc[]> => {
  await connectDB();
  return toPlain<TestimonialDoc[]>(await Testimonial.find({ status: "published" }).sort({ order: 1, createdAt: -1 }).lean());
});

export const getRedirect = cache(async (path: string) => {
  await connectDB();
  const clean = "/" + path.replace(/^\/+|\/+$/g, "");
  const doc = await Redirect.findOne({ from: { $in: [clean, clean + "/"] }, active: true }).lean<{ _id: string; to: string; code: number }>();
  if (doc) Redirect.updateOne({ _id: doc._id }, { $inc: { hits: 1 } }).catch(() => {});
  return doc ? { to: doc.to, code: doc.code } : null;
});
