import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { categoryMeta, renderCategory } from "@/components/site/category";

export const revalidate = 3600;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string; page: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, page } = await params;
  return categoryMeta(slug, Number(page) || 1);
}

export default async function CategoryPaged({ params }: Props) {
  const { slug, page } = await params;
  const n = Number(page);
  if (!Number.isInteger(n) || n < 1) notFound();
  if (n === 1) permanentRedirect(`/blog/category/${slug}`);
  return renderCategory(slug, n);
}
