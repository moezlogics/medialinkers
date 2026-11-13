import SectionRenderer from "@/components/sections/SectionRenderer";
import JsonLd from "./JsonLd";
import { getServices, getSettings } from "@/lib/data";
import { breadcrumbLd, customLd, faqLd, itemListLd, webPageLd } from "@/lib/seo";
import type { Faq, PageDoc } from "@/lib/types";

export function pagePath(slug: string) {
  return slug === "home" ? "/" : `/${slug}`;
}

/** Renders a CMS page (sections) with its structured data. */
export default async function PageView({ page, blogPage, blogCategory, pathOverride }: { page: PageDoc; blogPage?: number; blogCategory?: string; pathOverride?: string }) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const path = pathOverride || pagePath(page.slug);
  const enabled = page.sections.filter((s) => s.enabled !== false);
  const faqs: Faq[] = enabled.filter((s) => s.type === "faq").flatMap((s) => s.data.items || []);
  const hasServices = enabled.some((s) => s.type === "services");

  const ld = [
    webPageLd({ type: page.schemaType, name: page.seo?.metaTitle || page.title, description: page.seo?.metaDescription, path, dateModified: page.updatedAt }),
    page.slug !== "home" ? breadcrumbLd([{ name: "Home", path: "/" }, { name: page.title, path }]) : null,
    faqLd(faqs),
    hasServices && page.slug === "services" ? itemListLd(services.map((s) => ({ name: s.title, path: `/${s.slug}` }))) : null,
    customLd(page.seo?.schemaJson),
  ];

  return (
    <>
      <JsonLd data={ld} />
      <SectionRenderer sections={page.sections} ctx={{ settings, services, page, path, blogPage, blogCategory }} />
    </>
  );
}
