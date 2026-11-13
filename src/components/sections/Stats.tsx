import SectionHeading from "@/components/site/SectionHeading";
import { CountUp } from "@/components/site/motion";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

type StatItem = { value: string; label: string };

export default function Stats({ data, ctx }: SectionProps) {
  const items: StatItem[] = (data.items || []).filter((s: StatItem) => s.value);
  if (!items.length) return null;
  const dark = data.variant !== "light";
  return (
    <section className={cn("section relative overflow-hidden", dark && "grain bg-ink text-white")}>
      {dark && <div className="pointer-events-none absolute -left-40 top-0 size-[500px] rounded-full bg-accent/25 blur-[140px]" aria-hidden="true" />}
      <div className="container-x relative">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} text={data.text} dark={dark} as={ctx.headingAs} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.map((s, i) => {
            const big = i === 0;
            return (
              <Reveal
                key={i}
                delay={i * 0.06}
                className={cn(
                  "group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] p-5 transition-colors duration-500 md:p-7",
                  big ? "col-span-2 row-span-2 min-h-[220px] bg-accent text-white md:min-h-[320px]" : dark ? "min-h-[150px] bg-white/[0.06] hover:bg-white/[0.1]" : "min-h-[150px] border border-line bg-white",
                )}
              >
                {big && <span className="pointer-events-none absolute -bottom-16 -right-10 size-56 rounded-full border-[28px] border-white/15" aria-hidden="true" />}
                <span className={cn("text-xs font-semibold uppercase tracking-[0.16em]", big ? "text-white/70" : dark ? "text-white/40" : "text-muted")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative">
                  <CountUp value={s.value} className={cn("block font-display font-extrabold leading-none tracking-tight", big ? "text-7xl md:text-[8rem]" : "text-4xl md:text-5xl")} />
                  <p className={cn("mt-2 leading-snug", big ? "max-w-xs text-lg text-white/85" : dark ? "text-sm text-white/60" : "text-sm text-muted")}>{s.label}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
