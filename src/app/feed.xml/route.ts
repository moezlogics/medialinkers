import { getPosts, getSettings } from "@/lib/data";
import { absUrl } from "@/lib/utils";

export const revalidate = 3600;

const esc = (s = "") => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET() {
  const [settings, { posts }] = await Promise.all([getSettings(), getPosts({ limit: 30 })]);
  const items = posts
    .map(
      (p) => `<item><title>${esc(p.title)}</title><link>${absUrl(`/blog/${p.slug}`)}</link><guid>${absUrl(`/blog/${p.slug}`)}</guid><pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate><description>${esc(p.excerpt)}</description>${p.category ? `<category>${esc(p.category.name)}</category>` : ""}</item>`,
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(settings.siteName)} Blog</title><link>${absUrl("/blog")}</link><description>${esc(settings.seo.defaultDescription)}</description><language>en</language><atom:link href="${absUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
