import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Star } from "lucide-react";
import Highlight from "@/components/site/Highlight";
import { CountUp } from "@/components/site/motion";
import RotatingWord from "@/components/site/RotatingWord";
import Scene3D from "@/components/three/Scene3D";
import { Icon } from "@/lib/icons";
import type { SectionProps } from "./types";

/**
 * Home hero. Rendered on the server; only the rotating word, the counters and the
 * 3D shapes run in the browser, so the first paint is fast on any phone.
 */
export default function Hero({ data, ctx }: SectionProps) {
  const icons = ctx.services
    .filter((s) => s.showInHero !== false)
    .slice(0, 6)
    .map((s) => ({ label: s.shortTitle || s.title, href: `/${s.slug}`, icon: s.icon }));
  const words: string[] = (data.rotatingWords || []).filter(Boolean);
  const [before, after] = String(data.subtitle || "").split("{word}");
  const H = ctx.headingAs;
  const stats: { value: string; label: string }[] = data.stats || [];

  return (
    <section className="relative overflow-hidden pb-10 pt-6 md:pb-16 md:pt-10">
      {/* Clean background with a few floating 3D shapes */}
      <Scene3D variant="hero" />

      <div className="container-x relative">
        {/* Round service icons — "linked" together */}
        {data.showServiceIcons !== false && icons.length > 0 && (
          <nav aria-label="Our services" className="relative mx-auto mb-8 max-w-3xl md:mb-10">
            <svg className="pointer-events-none absolute left-[8%] right-[8%] top-[28px] h-1 w-[84%] sm:top-[36px] md:top-[44px]" preserveAspectRatio="none" viewBox="0 0 100 2" aria-hidden="true">
              <line x1="0" y1="1" x2="100" y2="1" stroke="var(--ink)" strokeOpacity=".25" strokeWidth="2" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" className="hero-link-line" />
            </svg>
            <ul className="relative flex items-start justify-between gap-1 sm:justify-center sm:gap-6 md:gap-8">
              {icons.map((it, idx) => (
                <li key={it.href} className="anim-pop w-[19%] sm:w-auto" style={{ animationDelay: `${100 + idx * 80}ms` }}>
                  <Link href={it.href} className="group flex flex-col items-center gap-2 text-center">
                    <span className="relative grid size-14 place-items-center rounded-full border-[1.5px] border-ink/70 bg-paper transition-all duration-500 group-hover:-translate-y-1 group-hover:border-ink group-hover:bg-ink group-hover:text-white group-hover:shadow-[0_12px_30px_-10px_var(--accent)] sm:size-[72px] md:size-[88px]">
                      <span className="absolute inset-0 scale-0 rounded-full bg-accent transition-transform duration-500 group-hover:scale-100" />
                      <Icon name={it.icon} className="relative size-6 transition-transform duration-500 group-hover:rotate-[360deg] sm:size-8 md:size-10" />
                    </span>
                    <span className="max-w-[90px] text-[11px] font-medium leading-tight text-ink/80 sm:text-xs md:text-sm">{it.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="relative mx-auto max-w-5xl text-center">
          {data.eyebrow && (
            <p
              style={{ animationDelay: "120ms" }}
              className="anim-rise mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur sm:text-[13px]"
            >
              <span className="size-2 rounded-full bg-accent" /> {data.eyebrow}
            </p>
          )}

          <div className="anim-rise" style={{ animationDelay: "180ms" }}>
            <H className="h-display text-[2.6rem] sm:text-6xl md:text-7xl lg:text-[5.6rem]">
              <Highlight text={data.title} />
            </H>
          </div>

          {data.subtitle && (
            <p style={{ animationDelay: "300ms" }} className="anim-rise mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-display text-xl font-semibold sm:text-2xl md:text-3xl">
              <span>{before}</span>
              {words.length > 0 && <RotatingWord words={words} />}
              <span>{after}</span>
            </p>
          )}

          {data.text && (
            <p style={{ animationDelay: "380ms" }} className="anim-rise mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed text-muted md:text-lg">
              {data.text}
            </p>
          )}

          <div style={{ animationDelay: "460ms" }} className="anim-rise mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {data.primaryCta?.label && (
              <Link href={data.primaryCta.href || "#"} className="btn btn-accent w-full !px-7 !py-4 text-base sm:w-auto">
                {data.primaryCta.label}
                <ArrowUpRight className="size-5" />
              </Link>
            )}
            {data.secondaryCta?.label && (
              <Link href={data.secondaryCta.href || "#"} className="btn btn-outline !px-7 !py-4 text-base">
                {data.secondaryCta.label}
                <ArrowDownRight className="size-5" />
              </Link>
            )}
          </div>

          {(stats.length > 0 || data.trustText) && (
            <div
              style={{ animationDelay: "700ms" }}
              className="anim-rise mx-auto mt-9 flex max-w-3xl flex-col items-center justify-center gap-5 rounded-3xl border border-line bg-white/70 p-4 backdrop-blur sm:flex-row sm:gap-8 sm:rounded-full sm:px-6"
            >
              {data.trustText && (
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["A", "B", "S", "M"].map((l, k) => (
                      <span key={l} className="grid size-8 place-items-center rounded-full border-2 border-white text-xs font-bold text-white" style={{ background: ["#ff5a1f", "#0b0b0f", "#7c3aed", "#16a34a"][k] }}>
                        {l}
                      </span>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="flex text-accent">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="size-3.5 fill-current" />)}</div>
                    <p className="text-xs font-semibold">{data.trustText}</p>
                  </div>
                </div>
              )}
              {stats.length > 0 && (
                <div className="flex items-center gap-6 sm:border-l sm:border-line sm:pl-8">
                  {stats.map((s) => (
                    <div key={s.label} className="text-center sm:text-left">
                      <CountUp value={s.value} className="block font-display text-2xl font-bold leading-none" />
                      <span className="text-xs text-muted">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {data.badgeText && (
          <Link href={data.primaryCta?.href || "#free-audit"} aria-label={data.primaryCta?.label || "Free audit"} className="group absolute -bottom-2 right-6 hidden size-32 lg:block xl:right-10">
            <svg viewBox="0 0 100 100" className="animate-spin-slow size-full" aria-hidden="true">
              <defs>
                <path id="hero-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
              </defs>
              <text fontSize="9.5" fontWeight="700" letterSpacing="2" fill="var(--ink)" style={{ textTransform: "uppercase" }}>
                <textPath href="#hero-circle">{String(data.badgeText).repeat(2).slice(0, 44)}</textPath>
              </text>
            </svg>
            <span className="absolute inset-0 m-auto grid size-14 place-items-center rounded-full bg-accent text-white transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110">
              <ArrowUpRight className="size-6" />
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
