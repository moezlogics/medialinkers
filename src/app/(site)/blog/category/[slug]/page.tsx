import type { Metadata } from "next";
import { categoryMeta, renderCategory } from "@/components/site/category";

export const revalidate = 3600;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return categoryMeta(slug);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  return renderCategory(slug);
}
