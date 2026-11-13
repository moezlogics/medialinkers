import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import Highlight from "@/components/site/Highlight";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

export default function ImageText({ data, ctx }: SectionProps) {
  const H = ctx.headingAs;
  const bullets: string[] = (data.bullets || []).filter(Boolean);
  return (
    <section className="section">
      <div className={cn("container-x grid items-center gap-8 lg:gap-14", data.image && "lg:grid-cols-2")}>
        <Reveal className={cn(data.imagePosition === "left" && "lg:order-2")}>
          {data.eyebrow && <p className="eyebrow mb-3 text-muted">{data.eyebrow}</p>}
          {data.title && (
            <H className="text-3xl font-bold leading-[1.05] sm:text-4xl lg:text-5xl">
              <Highlight text={data.title} />
            </H>
          )}
          {data.content && <div className="rich prose prose-lg mt-5 max-w-none" dangerouslySetInnerHTML={{ __html: data.content }} />}
          {bullets.length > 0 && (
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-white"><Check className="size-3" /></span>
                  <span className="text-[15px]">{b}</span>
                </li>
              ))}
            </ul>
          )}
          {data.cta?.label && (
            <Link href={data.cta.href || "#"} className="btn btn-dark mt-7">
              {data.cta.label} <ArrowUpRight className="size-4" />
            </Link>
          )}
        </Reveal>
        {data.image && (
          <Reveal className={cn("relative", data.imagePosition === "left" && "lg:order-1")}>
            <div className="absolute -inset-3 -z-10 rotate-2 rounded-[2.2rem] bg-accent/15" aria-hidden="true" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
              <Image src={data.image} alt={String(data.title || "").replace(/\*/g, "")} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
