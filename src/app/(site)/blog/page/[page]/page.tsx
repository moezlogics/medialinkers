import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import PageView from "@/components/site/PageView";
import { getPage, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: n } = await params;
  const [page, settings] = await Promise.all([getPage("blog"), getSettings()]);
  if (!page) return {};
  return buildMetadata(settings, { seo: { ...page.seo, metaTitle: "", canonical: "" }, title: `${page.title} — Page ${n}`, path: `/blog/page/${n}` });
}

export default async function BlogPaged({ params }: Props) {
  const { page: n } = await params;
  const num = Number(n);
  if (!Number.isInteger(num) || num < 1) notFound();
  if (num === 1) permanentRedirect("/blog");
  const page = await getPage("blog");
  if (!page) notFound();
  return <PageView page={page} blogPage={num} pathOverride={`/blog/page/${num}`} />;
}
