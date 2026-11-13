import Image from "next/image";
import { Quote, Star } from "lucide-react";
import SectionHeading from "@/components/site/SectionHeading";
import { getTestimonials } from "@/lib/data";
import type { TestimonialDoc } from "@/lib/types";
import type { SectionProps } from "./types";

function Card({ t, hidden }: { t: TestimonialDoc; hidden?: boolean }) {
  return (
    <figure aria-hidden={hidden || undefined} className="relative flex w-[300px] shrink-0 flex-col justify-between rounded-[1.75rem] border border-line bg-white p-6 sm:w-[380px]">
      <Quote className="absolute right-5 top-5 size-10 text-accent/15" />
      <div>
        <div className="flex gap-0.5 text-accent" aria-label={`${t.rating || 5} out of 5 stars`}>
          {Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
        </div>
        <blockquote className="mt-4 text-[15px] leading-relaxed text-ink/85 md:text-base">“{t.quote}”</blockquote>
      </div>
      <figcaption className="mt-6 flex items-center gap-3">
        {t.avatar ? (
          <Image src={t.avatar} alt={t.name} width={44} height={44} className="size-11 rounded-full object-cover" />
        ) : (
          <span className="grid size-11 place-items-center rounded-full bg-ink font-display font-bold text-white">{t.name.slice(0, 1)}</span>
        )}
        <span>
          <span className="block font-semibold">{t.name}</span>
          <span className="text-sm text-muted">{[t.role, t.company, t.location].filter(Boolean).join(" · ")}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default async function Testimonials({ data, ctx }: SectionProps) {
  const list = await getTestimonials();
  if (!list.length) return null;
  // Repeat short lists so the marquee always fills the screen
  const base = list.length < 4 ? [...list, ...list] : list;
  const row = [...base, ...base];
  return (
    <section className="section overflow-hidden">
      <div className="container-x">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} text={data.text} align="center" as={ctx.headingAs} />
      </div>
      <div className="marquee-mask marquee-pause space-y-3 md:space-y-4">
        <div className="animate-marquee flex w-max gap-3 [--marquee-speed:55s] md:gap-4">
          {row.map((t, i) => <Card key={i} t={t} hidden={i >= list.length} />)}
        </div>
        {list.length > 2 && (
          <div className="animate-marquee-rev flex w-max gap-3 [--marquee-speed:60s] md:gap-4" aria-hidden="true">
            {[...row].reverse().map((t, i) => <Card key={i} t={t} hidden />)}
          </div>
        )}
      </div>
    </section>
  );
}
