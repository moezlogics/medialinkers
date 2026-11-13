import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CountUp } from "@/components/site/motion";
import type { SectionProps } from "./types";


export default function Statement({ data }: Omit<SectionProps, "ctx">) {
  const words = String(data.text || "").split(/\s+/).filter(Boolean);
  const stats: { value: string; label: string }[] = data.stats || [];
  if (!words.length) return null;
  return (
    <section className="section">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <div>{data.eyebrow && <p className="eyebrow text-muted lg:sticky lg:top-28">{data.eyebrow}</p>}</div>
          <div>
            {/* Words light up one by one while scrolling (CSS scroll timeline; fully visible without support) */}
            <p className="stmt font-display text-[1.75rem] font-semibold leading-[1.18] tracking-tight sm:text-4xl lg:text-[3.2rem]">
              {words.map((w, i) => {
                const start = 10 + (45 * i) / words.length;
                return (
                  <span key={i} className="stmt-word mr-[0.25em] inline-block" style={{ animationRange: `cover ${start.toFixed(1)}% cover ${(start + 45 / words.length + 4).toFixed(1)}%` }}>
                    {w}
                  </span>
                );
              })}
            </p>
            {(stats.length > 0 || data.cta?.label) && (
              <div className="mt-10 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid grid-cols-3 gap-6 sm:flex sm:gap-12">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <CountUp value={s.value} className="block font-display text-3xl font-bold md:text-5xl" />
                      <span className="text-sm text-muted">{s.label}</span>
                    </div>
                  ))}
                </div>
                {data.cta?.label && (
                  <Link href={data.cta.href || "#"} className="group inline-flex items-center gap-3 font-semibold">
                    <span className="grid size-14 place-items-center rounded-full bg-ink text-white transition-all duration-500 group-hover:rotate-45 group-hover:bg-accent">
                      <ArrowUpRight className="size-5" />
                    </span>
                    {data.cta.label}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
