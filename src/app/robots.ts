import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/data";
import { absUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSettings();
  if (!s.seo.allowIndexing) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  // Extra "Disallow: /path" lines can be added in Admin > SEO
  const extra = s.seo.robotsExtra
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^disallow:/i.test(l))
    .map((l) => l.replace(/^disallow:\s*/i, ""));
  return {
    // The admin path is protected and sends noindex headers; it is intentionally not listed here.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", ...extra] }],
    sitemap: absUrl("/sitemap.xml"),
    host: absUrl("/"),
  };
}
