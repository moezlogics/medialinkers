import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/site/SectionHeading";
import PostCard from "@/components/site/PostCard";
import { Reveal } from "@/components/site/Reveal";
import { getPosts } from "@/lib/data";
import type { SectionProps } from "./types";

export default async function Blog({ data, ctx }: SectionProps) {
  const { posts } = await getPosts({ limit: Number(data.count) || 3 });
  if (!posts.length) return null;
  const action = data.cta?.label ? (
    <Link href={data.cta.href || "/blog"} className="btn btn-dark shrink-0">{data.cta.label} <ArrowUpRight className="size-4" /></Link>
  ) : null;
  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} text={data.text} action={action} as={ctx.headingAs} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08} className="relative">
              <PostCard post={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
