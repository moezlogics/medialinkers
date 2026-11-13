import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageView from "@/components/site/PageView";
import { getPage, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage("blog"), getSettings()]);
  if (!page) return {};
  return buildMetadata(settings, { seo: page.seo, title: page.title, path: "/blog" });
}

export default async function BlogIndex() {
  const page = await getPage("blog");
  if (!page) notFound();
  return <PageView page={page} blogPage={1} />;
}
