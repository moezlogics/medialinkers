import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import Highlight from "@/components/site/Highlight";
import FaqList from "@/components/site/FaqList";
import { Reveal } from "@/components/site/Reveal";
import { whatsappLink } from "@/lib/utils";
import type { Faq } from "@/lib/types";
import type { SectionProps } from "./types";

export default function FaqSection({ data, ctx }: SectionProps) {
  const items: Faq[] = (data.items || []).filter((f: Faq) => f.q && f.a);
  if (!items.length) return null;
  const H = ctx.headingAs;
  return (
    <section className="section">
      <div className="container-x grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:gap-14">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          {data.eyebrow && <p className="eyebrow mb-3 text-muted">{data.eyebrow}</p>}
          {data.title && (
            <H className="text-3xl font-bold leading-[1.05] sm:text-4xl lg:text-5xl">
              <Highlight text={data.title} />
            </H>
          )}
          {data.text && <p className="mt-4 text-muted md:text-lg">{data.text}</p>}
          <div className="mt-6 rounded-[1.5rem] bg-ink p-6 text-white">
            <MessageCircle className="size-7 text-lime" />
            <p className="mt-3 font-display text-xl font-bold">Still have questions?</p>
            <p className="mt-1 text-sm text-white/60">Talk to a strategist — we reply within a few hours.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/contact-us" className="btn btn-accent !py-3">Contact us <ArrowUpRight className="size-4" /></Link>
              {ctx.settings.contact.whatsapp && (
                <a href={whatsappLink(ctx.settings.contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-light !py-3">WhatsApp</a>
              )}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <FaqList items={items} />
        </Reveal>
      </div>
    </section>
  );
}
