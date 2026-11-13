import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PostCard from "@/components/site/PostCard";
import { getCategories, getCategory, getPosts } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

export default async function BlogList({ data, ctx }: SectionProps) {
  const perPage = Number(data.perPage) || 9;
  const page = ctx.blogPage || 1;
  const category = ctx.blogCategory ? await getCategory(ctx.blogCategory) : null;
  const [{ posts, pages }, categories] = await Promise.all([
    getPosts({ page, perPage, category: category?._id }),
    data.showCategories !== false ? getCategories() : Promise.resolve([]),
  ]);
  const base = category ? `/blog/category/${category.slug}` : "/blog";
  const pageHref = (n: number) => (n <= 1 ? base : `${base}/page/${n}`);

  return (
    <section className="section !pt-6">
      <div className="container-x">
        {categories.length > 0 && (
          <nav aria-label="Categories" className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
            <Link href="/blog" className={cn("whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors", !category ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink")}>
              All posts
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/blog/category/${c.slug}`}
                className={cn("whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors", category?.slug === c.slug ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink")}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}

        {posts.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <div key={p.slug} className={cn("relative", i === 0 && page === 1 && "sm:col-span-2 lg:col-span-2")}>
                <PostCard post={p} priority={i < 2} />
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-line bg-white p-10 text-center text-muted">No posts here yet. Check back soon!</p>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link href={pageHref(page - 1)} rel="prev" className="grid size-11 place-items-center rounded-full border border-line bg-white hover:bg-ink hover:text-white" aria-label="Previous page">
                <ArrowLeft className="size-4" />
              </Link>
            )}
            {Array.from({ length: pages }).map((_, i) => (
              <Link
                key={i}
                href={pageHref(i + 1)}
                aria-current={page === i + 1 ? "page" : undefined}
                className={cn("grid size-11 place-items-center rounded-full border text-sm font-semibold", page === i + 1 ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink")}
              >
                {i + 1}
              </Link>
            ))}
            {page < pages && (
              <Link href={pageHref(page + 1)} rel="next" className="grid size-11 place-items-center rounded-full border border-line bg-white hover:bg-ink hover:text-white" aria-label="Next page">
                <ArrowRight className="size-4" />
              </Link>
            )}
          </nav>
        )}
      </div>
    </section>
  );
}
