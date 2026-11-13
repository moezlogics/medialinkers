import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { PostDoc } from "@/lib/types";

export default function PostCard({ post, priority = false }: { post: PostDoc; priority?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-35px_rgba(0,0,0,.4)]">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-ink" tabIndex={-1} aria-hidden="true">
        {post.coverImage ? (
          <Image src={post.coverImage} alt={post.coverAlt || post.title} fill priority={priority} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="grain relative flex size-full items-end overflow-hidden bg-ink p-5">
            <span className="absolute -right-8 -top-8 size-40 rounded-full bg-accent/50 blur-2xl transition-transform duration-700 group-hover:scale-150" />
            <span className="relative line-clamp-3 font-display text-2xl font-bold leading-tight text-white">{post.title}</span>
          </div>
        )}
        {post.category && <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">{post.category.name}</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-center gap-3 text-xs text-muted">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span className="size-1 rounded-full bg-muted/50" />
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {post.readingTime || 1} min read</span>
        </div>
        <h3 className="mt-3 font-display text-xl font-bold leading-snug">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 hover:text-accent">{post.title}</Link>
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 flex-1 text-[15px] leading-relaxed text-muted">{post.excerpt}</p>}
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
          Read article
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
