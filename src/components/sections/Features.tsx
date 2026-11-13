import SectionHeading from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

type Card = { icon?: string; title: string; text?: string };

export function FeatureGrid({ items, columns = "3", dark = false }: { items: Card[]; columns?: string; dark?: boolean }) {
  const cols = columns === "2" ? "sm:grid-cols-2" : columns === "4" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={cn("grid gap-3 md:gap-4", cols)}>
      {items.map((c, i) => (
        <Reveal key={i} delay={(i % 4) * 0.06}>
          <div
            className={cn(
              "group relative h-full overflow-hidden rounded-[1.5rem] p-6 transition-all duration-500 hover:-translate-y-1",
              dark ? "bg-white/[0.06] hover:bg-white/[0.1]" : "border border-line bg-white hover:border-accent hover:shadow-[0_20px_50px_-30px_var(--accent)]",
            )}
          >
            <span className={cn("grid size-12 place-items-center rounded-2xl transition-all duration-500 group-hover:rotate-6 group-hover:bg-accent group-hover:text-white", dark ? "bg-white/10" : "bg-paper")}>
              <Icon name={c.icon || "sparkles"} className="size-5" />
            </span>
            <h3 className="mt-5 font-display text-lg font-bold leading-tight md:text-xl">{c.title}</h3>
            {c.text && <p className={cn("mt-2 text-sm leading-relaxed md:text-[15px]", dark ? "text-white/60" : "text-muted")}>{c.text}</p>}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export default function Features({ data, ctx }: SectionProps) {
  const items: Card[] = (data.items || []).filter((c: Card) => c.title);
  if (!items.length) return null;
  const dark = data.variant === "dark";
  return (
    <section className={cn("section", dark && "bg-ink text-white")}>
      <div className="container-x">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} text={data.text} dark={dark} as={ctx.headingAs} />
        <FeatureGrid items={items} columns={data.columns} dark={dark} />
      </div>
    </section>
  );
}
