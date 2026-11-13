import "server-only";
import * as cheerio from "cheerio";
import { slugify } from "./utils";

/** Adds ids to h2/h3 headings and returns a table of contents. Also lazy-loads images. */
export function withToc(html = "") {
  const $ = cheerio.load(html, null, false);
  const toc: { id: string; text: string; level: number }[] = [];
  const used = new Set<string>();
  $("h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    if (!text) return;
    let id = $(el).attr("id") || slugify(text) || "section";
    let n = 2;
    while (used.has(id)) id = `${slugify(text)}-${n++}`;
    used.add(id);
    $(el).attr("id", id);
    toc.push({ id, text, level: el.tagName === "h3" ? 3 : 2 });
  });
  $("img").each((_, el) => {
    if (!$(el).attr("loading")) $(el).attr("loading", "lazy");
    $(el).attr("decoding", "async");
  });
  $("a[href^='http']").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href.includes("medialinkers.pk")) $(el).attr("rel", "noopener noreferrer").attr("target", "_blank");
  });
  return { html: $.html(), toc };
}
