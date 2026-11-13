export function cn(...parts: unknown[]) {
  return parts.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return input
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stripHtml(html = "") {
  return html
    .replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingTime(html = "") {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function truncate(text = "", max = 160) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

export function formatDate(d?: string | Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", opts);
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function absUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/** Turn "Grow your *brand* fast" into parts so the starred word can be highlighted. */
export function splitHighlight(text = "") {
  return text.split(/(\*[^*]+\*)/g).filter(Boolean).map((part) =>
    part.startsWith("*") && part.endsWith("*") ? { text: part.slice(1, -1), hl: true } : { text: part, hl: false },
  );
}

export function plainHighlight(text = "") {
  return text.replace(/\*/g, "");
}

export function whatsappLink(num = "", text = "") {
  const n = num.replace(/[^\d]/g, "");
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** Public URL of a service. Sub-services live under their main service: /seo-services/local-seo */
export function serviceUrl(service: { slug: string }, parent?: { slug: string } | null) {
  return parent ? `/${parent.slug}/${service.slug}` : `/${service.slug}`;
}
