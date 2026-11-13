import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageView from "@/components/site/PageView";
import { getPage, getSettings } from "@/lib/data";
import { isPreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage("home", await isPreview()), getSettings()]);
  if (!page) return {};
  return buildMetadata(settings, { seo: page.seo, title: page.seo?.metaTitle || settings.seo.defaultTitle, path: "/" });
}

export default async function HomePage() {
  const page = await getPage("home", await isPreview());
  if (!page) notFound();
  return <PageView page={page} />;
}
