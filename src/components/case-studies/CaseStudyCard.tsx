import Link from "next/link";
import { ArrowUpRight, Lock, MapPin } from "lucide-react";
import TrendChart from "./TrendChart";
import { accentFor, clientName } from "@/lib/case-studies";
import type { ProjectDoc } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = { project: ProjectDoc; tags: string[]; index?: number; feature?: boolean; className?: string };

function Panel({ p, color, big }: { p: ProjectDoc; color: string; big?: boolean }) {
  const head = p.results?.[0];
  return (
    <div className={cn("relative isolate flex flex-col overflow-hidden bg-ink text-white", big ? "min-h-[300px] p-6 sm:p-8 lg:min-h-full" : "min-h-[250px] p-5 sm:p-6")}>
      {/* soft glow in the project colour */}
      <div className="pointer-events-none absolute -right-16 -top-20 -z-10 size-64 rounded-full opacity-25 blur-3xl transition-opacity duration-700 group-hover:opacity-40" style={{ background: color }} aria-hidden="true" />
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          {p.industry && <span className="truncate rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{p.industry}</span>}
          {p.confidential && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70" title="Brand name kept private at the client’s request">
              <Lock className="size-3" /> Confidential
            </span>
          )}
        </span>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-ink transition-all duration-500 group-hover:rotate-45 group-hover:bg-lime">
          <ArrowUpRight className="size-5" />
        </span>
      </div>
      {head && (
        <div className="mt-6">
          <p className={cn("font-display font-extrabold leading-none tracking-tight", big ? "text-6xl sm:text-7xl" : "text-5xl")} style={{ color }}>{head.value}</p>
          <p className="mt-2 max-w-[18rem] text-sm text-white/65">{head.label}</p>
        </div>
      )}
      {p.trend?.points && p.trend.points.length > 1 && (
        <div className={cn("pointer-events-none mt-auto pt-5 text-white", big ? "-mx-6 -mb-6 sm:-mx-8 sm:-mb-8" : "-mx-5 -mb-5 sm:-mx-6 sm:-mb-6")}>
          <TrendChart points={p.trend.points} color={color} />
        </div>
      )}
    </div>
  );
}

export default function CaseStudyCard({ project: p, tags, index = 0, feature = false, className }: Props) {
  const color = accentFor(p, index);
  const href = `/case-studies/${p.slug}`;
  const more = (p.results || []).slice(1, feature ? 4 : 3);
  const meta = [clientName(p) !== p.title ? clientName(p) : "", p.period].filter(Boolean).join(" · ");

  return (
    <article className={cn("group relative overflow-hidden rounded-[1.75rem] border border-line bg-white transition-all duration-500 hover:-translate-y-1 hover:border-ink/25 hover:shadow-[0_30px_70px_-35px_rgba(0,0,0,.45)]", feature ? "grid lg:grid-cols-[1.05fr_1fr]" : "flex flex-col", className)}>
      <Panel p={p} color={color} big={feature} />
      <div className={cn("flex flex-1 flex-col", feature ? "p-6 sm:p-8 lg:p-10" : "p-5 sm:p-6")}>
        {meta && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{meta}</p>}
        <h3 className={cn("mt-2 font-display font-bold leading-[1.1]", feature ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-[1.4rem]")}>
          <Link href={href} className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none">{p.title}</Link>
        </h3>
        {p.excerpt && <p className={cn("mt-3 text-muted", feature ? "md:text-lg" : "line-clamp-3 text-[15px]")}>{p.excerpt}</p>}
        {more.length > 0 && (
          <dl className={cn("mt-5 grid gap-3 border-t border-line pt-5", more.length >= 3 ? "grid-cols-3" : "grid-cols-2")}>
            {more.map((r) => (
              <div key={r.label} className="flex min-w-0 flex-col">
                <dt className="order-2 mt-1 text-xs leading-snug text-muted">{r.label}</dt>
                <dd className="order-1 font-display text-2xl font-extrabold leading-none">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
          {tags.slice(0, feature ? 4 : 3).map((t) => (
            <span key={t} className="rounded-full border border-line px-3 py-1 text-xs font-medium">{t}</span>
          ))}
          {p.location && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted"><MapPin className="size-3.5" />{p.location}</span>
          )}
        </div>
        {feature && (
          <span className="mt-6 inline-flex items-center gap-2 self-start font-semibold text-ink">
            Read the case study <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </article>
  );
}
