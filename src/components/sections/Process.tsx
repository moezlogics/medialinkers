import SectionHeading from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/lib/icons";
import type { SectionProps } from "./types";

type Step = { title: string; text?: string; icon?: string };

export default function Process({ data, headingAs = "h2" }: Omit<SectionProps, "ctx"> & { headingAs?: "h1" | "h2" }) {
  const steps: Step[] = (data.steps || []).filter((s: Step) => s.title);
  if (!steps.length) return null;
  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} text={data.text} align="center" as={headingAs} />
        <ol className="relative grid gap-4 lg:gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` }}>
          {/* Connecting line (desktop) */}
          <div className="pointer-events-none absolute left-[10%] right-[10%] top-8 hidden h-[2px] bg-line lg:block" aria-hidden="true">
            <div className="process-line h-full origin-left bg-accent" />
          </div>
          {steps.map((s, i) => (
            <Reveal as="li" key={i} delay={i * 0.08} className="group relative">
              <div className="flex gap-4 lg:flex-col lg:items-center lg:text-center">
                <div className="relative shrink-0">
                  <span className="relative z-10 grid size-16 place-items-center rounded-full border-2 border-ink bg-paper transition-all duration-500 group-hover:-translate-y-1 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                    <Icon name={s.icon || "sparkles"} className="size-6" />
                  </span>
                  <span className="absolute -right-1 -top-1 z-20 grid size-6 place-items-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
                  {i < steps.length - 1 && <span className="absolute left-1/2 top-16 h-[calc(100%+1rem)] w-[2px] -translate-x-1/2 bg-line lg:hidden" aria-hidden="true" />}
                </div>
                <div className="pb-2 lg:mt-5">
                  <h3 className="font-display text-lg font-bold leading-tight md:text-xl">{s.title}</h3>
                  {s.text && <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>}
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
