import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageView from "./PageView";
import { getCategory, getPage, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import type { PageDoc } from "@/lib/types";

export async function categoryMeta(slug: string, n = 1): Promise<Metadata> {
  const [cat, settings] = await Promise.all([getCategory(slug), getSettings()]);
  if (!cat) return {};
  const path = `/blog/category/${cat.slug}${n > 1 ? `/page/${n}` : ""}`;
  return buildMetadata(settings, {
    seo: cat.seo,
    title: `${cat.name} articles${n > 1 ? ` — Page ${n}` : ""}`,
    description: cat.description || `Latest ${cat.name} articles, guides and tips from Media Linkers.`,
    path,
  });
}

export async function renderCategory(slug: string, n = 1) {
  const [cat, blog] = await Promise.all([getCategory(slug), getPage("blog")]);
  if (!cat || !blog) notFound();
  const page: PageDoc = {
    ...blog,
    title: cat.name,
    sections: blog.sections.map((s) =>
      s.type === "pageHero" ? { ...s, data: { ...s.data, eyebrow: "Category", title: `${cat.name} *articles*`, text: cat.description || s.data.text } } : s,
    ),
    seo: { ...blog.seo, schemaJson: "" },
  };
  return <PageView page={page} blogPage={n} blogCategory={cat.slug} pathOverride={`/blog/category/${cat.slug}${n > 1 ? `/page/${n}` : ""}`} />;
}
