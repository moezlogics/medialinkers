import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Category, Page, Post, Project, Service } from "@/lib/models";
import { absUrl } from "@/lib/utils";

export const revalidate = 3600;

type Row = { _id: unknown; slug: string; updatedAt?: Date; coverImage?: string; image?: string; parent?: unknown };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const [pages, services, posts, categories, projects] = await Promise.all([
    Page.find({ status: "published", showInSitemap: { $ne: false }, "seo.noindex": { $ne: true } }, "slug updatedAt").lean<Row[]>(),
    Service.find({ status: "published" }, "slug updatedAt image parent seo.noindex").lean<(Row & { seo?: { noindex?: boolean } })[]>(),
    Post.find({ status: "published", publishedAt: { $lte: new Date() }, "seo.noindex": { $ne: true } }, "slug updatedAt coverImage").lean<Row[]>(),
    Category.find({}, "slug updatedAt").lean<Row[]>(),
    Project.find({ status: "published", "seo.noindex": { $ne: true } }, "slug updatedAt coverImage").lean<Row[]>(),
  ]);

  const img = (r: Row) => (r.coverImage || r.image ? [absUrl(r.coverImage || r.image)] : undefined);

  // Sub-services live under their main service: /seo-services/local-seo
  const bySlug = new Map(services.map((s) => [String(s._id), s.slug]));
  const serviceRows = services
    .filter((s) => !s.seo?.noindex && (!s.parent || bySlug.has(String(s.parent))))
    .map((s) => ({ ...s, path: s.parent ? `/${bySlug.get(String(s.parent))}/${s.slug}` : `/${s.slug}` }));

  return [
    ...pages.map((p) => ({
      url: absUrl(p.slug === "home" ? "/" : `/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: p.slug === "home" ? 1 : ["services", "case-studies", "contact-us"].includes(p.slug) ? 0.9 : 0.7,
    })),
    ...serviceRows.map((s) => ({ url: absUrl(s.path), lastModified: s.updatedAt, changeFrequency: "weekly" as const, priority: s.parent ? 0.8 : 0.9, images: img(s) })),
    ...posts.map((p) => ({ url: absUrl(`/blog/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.7, images: img(p) })),
    ...categories.map((c) => ({ url: absUrl(`/blog/category/${c.slug}`), lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...projects.map((p) => ({ url: absUrl(`/case-studies/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6, images: img(p) })),
  ];
}
