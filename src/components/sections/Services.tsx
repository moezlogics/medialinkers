import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/lib/icons";
import type { ServiceDoc } from "@/lib/types";
import { serviceUrl } from "@/lib/utils";
import type { SectionProps } from "./types";

/** Small links to the sub-service pages of a service. Sits above the card's stretched link. */
function ChildLinks({ service, max, tone }: { service: ServiceDoc; max: number; tone: "card" | "row" }) {
  const kids = service.children || [];
  if (!kids.length) return null;
  const pill =
    tone === "card"
      ? "border-line bg-paper/70 text-ink/75 hover:border-accent hover:bg-accent hover:text-white group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white/85"
      : "border-line bg-white text-ink/75 hover:border-accent hover:bg-accent hover:text-white group-hover:border-white/25 group-hover:bg-white/10 group-hover:text-white/85";
  return (
    <ul className="relative z-10 flex flex-wrap gap-1.5">
      {kids.slice(0, max).map((c) => (
        <li key={c.slug}>
          <Link href={serviceUrl(c, service)} className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${pill}`}>
            {c.shortTitle || c.title}
          </Link>
        </li>
      ))}
      {kids.length > max && (
        <li>
          <Link href={`${serviceUrl(service)}#services`} className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${pill}`}>
            +{kids.length - max} more
          </Link>
        </li>
      )}
    </ul>
  );
}

export default function Services({ data, ctx }: SectionProps) {
  const list = data.limit ? ctx.services.slice(0, Number(data.limit)) : ctx.services;
  if (!list.length) return null;
  const action = data.cta?.label ? (
    <Link href={data.cta.href || "/services"} className="btn btn-dark shrink-0">
      {data.cta.label} <ArrowUpRight className="size-4" />
    </Link>
  ) : null;

  if (data.layout === "list") {
    return (
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow={data.eyebrow} title={data.title} text={data.text} action={action} as={ctx.headingAs} />
          <ul className="border-t border-line">
            {list.map((s, i) => (
              <Reveal as="li" key={s.slug} delay={i * 0.04}>
                <article className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 overflow-hidden border-b border-line py-5 md:grid-cols-[64px_1fr_1.3fr_auto] md:gap-x-8 md:py-7">
                  <span className="absolute inset-0 origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100" aria-hidden="true" />
                  <span className="relative font-display text-sm font-semibold text-muted transition-colors group-hover:text-white/50 md:text-base">{String(i + 1).padStart(2, "0")}</span>
                  <div className="relative flex items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-white transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white md:size-14">
                      <Icon name={s.icon} className="size-5 md:size-6" />
                    </span>
                    <h3 className="font-display text-xl font-bold leading-tight transition-colors group-hover:text-white md:text-3xl">
                      <Link href={serviceUrl(s)} className="after:absolute after:inset-0">{s.title}</Link>
                    </h3>
                  </div>
                  <div className="relative col-span-3 space-y-3 md:col-span-1">
                    <p className="text-muted transition-colors group-hover:text-white/70">{s.excerpt}</p>
                    <ChildLinks service={s} max={7} tone="row" />
                  </div>
                  <span className="pointer-events-none relative col-start-3 row-start-1 grid size-11 place-items-center rounded-full border border-line transition-all duration-500 group-hover:rotate-45 group-hover:border-lime group-hover:bg-lime group-hover:text-ink md:col-start-4">
                    <ArrowUpRight className="size-5" />
                  </span>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section className="section" id="services">
      <div className="container-x">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} text={data.text} action={action} as={ctx.headingAs} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {list.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 0.08}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-ink hover:bg-ink hover:text-white md:p-7">
                <Icon name={s.icon} className="pointer-events-none absolute -bottom-6 -right-6 size-36 text-ink/[0.04] transition-all duration-700 group-hover:rotate-12 group-hover:text-white/[0.07]" />
                <div className="flex items-start justify-between">
                  <span className="grid size-14 place-items-center rounded-full border border-line bg-paper transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                    <Icon name={s.icon} className="size-6" />
                  </span>
                  <span className="font-display text-sm font-semibold text-muted group-hover:text-white/40">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold leading-tight">
                  <Link href={serviceUrl(s)} className="after:absolute after:inset-0">{s.title}</Link>
                </h3>
                <p className="mt-3 leading-relaxed text-muted transition-colors group-hover:text-white/70">{s.excerpt}</p>
                <div className="mt-4 flex-1">
                  <ChildLinks service={s} max={4} tone="card" />
                </div>
                <span className="pointer-events-none mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                  Explore service
                  <span className="grid size-8 place-items-center rounded-full bg-ink text-white transition-all duration-500 group-hover:rotate-45 group-hover:bg-lime group-hover:text-ink">
                    <ArrowUpRight className="size-4" />
                  </span>
                </span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
