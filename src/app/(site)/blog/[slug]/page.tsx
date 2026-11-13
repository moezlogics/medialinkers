import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Clock, List } from "lucide-react";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import JsonLd from "@/components/site/JsonLd";
import PostCard from "@/components/site/PostCard";
import ShareButtons from "@/components/site/ShareButtons";
import FaqList from "@/components/site/FaqList";
import AuditCta from "@/components/sections/AuditCta";
import { getPost, getPosts, getSettings } from "@/lib/data";
import { isPreview } from "@/lib/preview";
import { articleLd, breadcrumbLd, buildMetadata, customLd, faqLd } from "@/lib/seo";
import { withToc } from "@/lib/toc";
import { absUrl, formatDate } from "@/lib/utils";

export const revalidate = 3600;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug, await isPreview()), getSettings()]);
  if (!post) return { title: "Post not found", robots: { index: false } };
  return buildMetadata(settings, {
    seo: post.seo,
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug, await isPreview()), getSettings()]);
  if (!post) notFound();
  const { html, toc } = withToc(post.content);
  const { posts: related } = await getPosts({ limit: 3, exclude: post._id, category: post.category?._id });
  const path = `/blog/${post.slug}`;
  const crumbs = [{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, ...(post.category ? [{ name: post.category.name, path: `/blog/category/${post.category.slug}` }] : []), { name: post.title, path }];
  const author = post.author?.name || post.authorName || settings.siteName;

  return (
    <>
      <JsonLd data={[articleLd(post, settings), breadcrumbLd(crumbs), faqLd(post.faqs || []), customLd(post.seo?.schemaJson)]} />
      <article>
        <header className="relative overflow-hidden">
          <div className="container-x relative max-w-5xl py-10 text-center md:py-14">
            <div className="flex justify-center"><Breadcrumbs items={crumbs.slice(0, -1).concat([{ name: "Article", path }])} /></div>
            {post.category && (
              <Link href={`/blog/category/${post.category.slug}`} className="mt-6 inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                {post.category.name}
              </Link>
            )}
            <h1 className="anim-rise h-display mx-auto mt-5 max-w-4xl text-4xl sm:text-5xl lg:text-6xl">{post.title}</h1>
            {post.excerpt && <p className="mx-auto mt-5 max-w-2xl text-muted md:text-lg">{post.excerpt}</p>}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-2">
                {post.author?.avatar ? (
                  <Image src={post.author.avatar} alt={author} width={32} height={32} className="size-8 rounded-full object-cover" />
                ) : (
                  <span className="grid size-8 place-items-center rounded-full bg-ink text-xs font-bold text-white">{author.slice(0, 1)}</span>
                )}
                <span className="font-semibold text-ink">{author}</span>
              </span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, { day: "numeric", month: "long", year: "numeric" })}</time>
              <span className="flex items-center gap-1"><Clock className="size-4" /> {post.readingTime || 1} min read</span>
            </div>
          </div>
        </header>

        {post.coverImage && (
          <div className="container-x max-w-6xl">
            <div className="relative aspect-[16/8] overflow-hidden rounded-[2rem]">
              <Image src={post.coverImage} alt={post.coverAlt || post.title} fill priority sizes="(min-width:1280px) 1200px, 100vw" className="object-cover" />
            </div>
          </div>
        )}

        <div className="container-x grid max-w-6xl gap-10 py-10 md:py-14 lg:grid-cols-[1fr_260px]">
          <div className="min-w-0">
            <div className="rich prose prose-lg max-w-none prose-headings:font-display" dangerouslySetInnerHTML={{ __html: html }} />
            {post.faqs && post.faqs.length > 0 && (
              <section className="mt-12">
                <h2 className="mb-5 font-display text-3xl font-bold">Frequently asked questions</h2>
                <FaqList items={post.faqs} />
              </section>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {post.tags.map((t) => <span key={t} className="rounded-full border border-line bg-white px-3 py-1 text-sm">#{t}</span>)}
              </div>
            )}
            <div className="mt-8 flex flex-col gap-4 rounded-[1.5rem] border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold">Found this useful? Share it.</p>
              <ShareButtons url={absUrl(path)} title={post.title} />
            </div>
            <div className="mt-6 flex gap-4 rounded-[1.5rem] bg-ink p-6 text-white">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-accent font-display text-xl font-bold">{author.slice(0, 1)}</span>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50">Written by</p>
                <p className="font-display text-xl font-bold">{author}</p>
                <p className="mt-1 text-sm text-white/70">{post.author?.bio || `${settings.siteName} helps businesses grow with SEO, content, social media and PPC since 2008.`}</p>
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            {toc.length > 1 && (
              <nav aria-label="Table of contents" className="rounded-[1.5rem] border border-line bg-white p-5">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider"><List className="size-4 text-accent" /> On this page</p>
                <ol className="space-y-1.5 text-sm">
                  {toc.map((t) => (
                    <li key={t.id} className={t.level === 3 ? "pl-4" : ""}>
                      <a href={`#${t.id}`} className="block leading-snug text-muted transition-colors hover:text-accent">{t.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <div className="rounded-[1.5rem] bg-accent p-5 text-white">
              <p className="font-display text-xl font-bold leading-tight">Get a free SEO audit of your website</p>
              <p className="mt-2 text-sm text-white/85">Reviewed by a human expert. In your inbox within 24 hours.</p>
              <a href="#free-audit" className="btn btn-dark mt-4 w-full">Request free audit <ArrowUpRight className="size-4" /></a>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section !pt-0">
          <div className="container-x">
            <h2 className="mb-6 font-display text-3xl font-bold">Keep reading</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <PostCard key={p.slug} post={p} />)}
            </div>
          </div>
        </section>
      )}
      <AuditCta data={{ eyebrow: "Free SEO audit", title: "How does *your* website really score?", text: "Send us your website and email. A senior SEO specialist reviews it by hand and emails you a prioritised action plan within 24 hours.", buttonLabel: "Get my free audit", points: ["Manual expert review", "Delivered within 24 hours", "100% free"] }} />
    </>
  );
}
