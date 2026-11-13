import "server-only";
import { connectDB } from "./db";
import { Media, Page, Post, Project, Service } from "./models";
import { plainHighlight, stripHtml } from "./utils";

export type Issue = { level: "error" | "warning"; item: string; type: string; message: string; editHref: string; viewHref: string };

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Scans published content and lists on-page SEO problems with links to fix them. */
export async function seoHealth() {
  await connectDB();
  const [pages, services, posts, projects, mediaNoAlt, mediaTotal] = await Promise.all([
    Page.find({ status: "published" }).lean<any[]>(),
    Service.find({ status: "published" }).lean<any[]>(),
    Post.find({ status: "published" }).lean<any[]>(),
    Project.find({ status: "published" }).lean<any[]>(),
    Media.countDocuments({ mime: /^image\//, $or: [{ alt: "" }, { alt: { $exists: false } }] }),
    Media.countDocuments({ mime: /^image\// }),
  ]);
  const serviceSlug = new Map(services.map((s) => [String(s._id), s.slug]));

  type Row = { type: string; title: string; seo: any; text: string; editHref: string; viewHref: string; cover?: string; coverAlt?: string; isPost?: boolean };
  const rows: Row[] = [
    ...pages.map((p) => ({
      type: "Page",
      title: p.title,
      seo: p.seo || {},
      text: (p.sections || []).filter((s: any) => s.enabled !== false).map((s: any) => [s.data?.title, s.data?.text, s.data?.content, ...(s.data?.items || []).map((i: any) => `${i?.title || i?.q || ""} ${i?.text || i?.a || ""}`)].join(" ")).join(" "),
      editHref: `/newlogin/pages/${p._id}`,
      viewHref: p.slug === "home" ? "/" : `/${p.slug}`,
    })),
    ...services.map((s) => ({
      type: s.parent ? "Sub-service" : "Service",
      title: s.title,
      seo: s.seo || {},
      text: [s.heroText, s.content, ...(s.features || []).map((f: any) => `${f.title} ${f.text}`), ...(s.faqs || []).map((f: any) => `${f.q} ${f.a}`)].join(" "),
      editHref: `/newlogin/services/${s._id}`,
      viewHref: s.parent ? `/${serviceSlug.get(String(s.parent))}/${s.slug}` : `/${s.slug}`,
    })),
    ...posts.map((p) => ({ type: "Post", title: p.title, seo: p.seo || {}, text: p.content || "", editHref: `/newlogin/posts/${p._id}`, viewHref: `/blog/${p.slug}`, cover: p.coverImage, coverAlt: p.coverAlt, isPost: true })),
    ...projects.map((p) => ({ type: "Case study", title: p.title, seo: p.seo || {}, text: `${p.excerpt || ""} ${p.content || ""}`, editHref: `/newlogin/projects/${p._id}`, viewHref: `/case-studies/${p.slug}` })),
  ];

  const issues: Issue[] = [];
  const titles = new Map<string, string[]>();
  const descs = new Map<string, string[]>();

  for (const r of rows) {
    const base = { item: r.title, type: r.type, editHref: r.editHref, viewHref: r.viewHref };
    const title = plainHighlight(r.seo.metaTitle || r.title);
    const words = stripHtml(r.text).split(" ").filter(Boolean).length;
    if (r.seo.noindex) issues.push({ ...base, level: "warning", message: "Hidden from Google (noindex is on)" });
    if (!r.seo.metaDescription) issues.push({ ...base, level: "error", message: "Missing meta description" });
    else if (r.seo.metaDescription.length > 165) issues.push({ ...base, level: "warning", message: `Meta description too long (${r.seo.metaDescription.length} chars)` });
    else if (r.seo.metaDescription.length < 70) issues.push({ ...base, level: "warning", message: `Meta description too short (${r.seo.metaDescription.length} chars)` });
    if (r.seo.metaTitle && r.seo.metaTitle.length > 65) issues.push({ ...base, level: "warning", message: `Meta title too long (${r.seo.metaTitle.length} chars)` });
    if (!r.seo.focusKeyword && r.type !== "Page") issues.push({ ...base, level: "warning", message: "No focus keyword set" });
    if (r.seo.focusKeyword && !title.toLowerCase().includes(String(r.seo.focusKeyword).toLowerCase())) issues.push({ ...base, level: "warning", message: `Focus keyword “${r.seo.focusKeyword}” not in the title` });
    if (r.isPost && words < 300) issues.push({ ...base, level: "warning", message: `Thin content (${words} words)` });
    if (r.isPost && !r.cover) issues.push({ ...base, level: "warning", message: "No cover image" });
    if (r.isPost && r.cover && !r.coverAlt) issues.push({ ...base, level: "warning", message: "Cover image has no alt text" });
    titles.set(title.toLowerCase(), [...(titles.get(title.toLowerCase()) || []), r.title]);
    if (r.seo.metaDescription) descs.set(r.seo.metaDescription.toLowerCase(), [...(descs.get(r.seo.metaDescription.toLowerCase()) || []), r.title]);
  }

  for (const r of rows) {
    const t = plainHighlight(r.seo.metaTitle || r.title).toLowerCase();
    if ((titles.get(t)?.length || 0) > 1) issues.push({ item: r.title, type: r.type, editHref: r.editHref, viewHref: r.viewHref, level: "error", message: "Duplicate title — another page uses the same title" });
    if (r.seo.metaDescription && (descs.get(r.seo.metaDescription.toLowerCase())?.length || 0) > 1)
      issues.push({ item: r.title, type: r.type, editHref: r.editHref, viewHref: r.viewHref, level: "warning", message: "Duplicate meta description" });
  }

  const pagesWithIssues = new Set(issues.map((i) => i.editHref)).size;
  const score = rows.length ? Math.round(((rows.length - pagesWithIssues) / rows.length) * 100) : 100;
  return { total: rows.length, score, issues: issues.sort((a, b) => (a.level === b.level ? 0 : a.level === "error" ? -1 : 1)), mediaNoAlt, mediaTotal };
}
