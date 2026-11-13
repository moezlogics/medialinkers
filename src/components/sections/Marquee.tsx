import { Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

function Band({ items, className, reverse }: { items: string[]; className: string; reverse?: boolean }) {
  const loop = [...items, ...items, ...items, ...items];
  return (
    <div className={cn("overflow-hidden py-3 md:py-4", className)}>
      <div className={cn("flex w-max items-center gap-6 md:gap-10 [--marquee-speed:45s]", reverse ? "animate-marquee-rev" : "animate-marquee")}>
        {loop.map((w, i) => (
          <span key={i} aria-hidden={i >= items.length ? true : undefined} className="flex items-center gap-6 whitespace-nowrap font-display text-2xl font-extrabold uppercase tracking-tight md:gap-10 md:text-4xl">
            {w}
            <Sparkle className="size-6 shrink-0 fill-current md:size-8" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee({ data }: SectionProps<{ items?: string[]; variant?: string; tilted?: boolean }>) {
  const items = (data.items || []).filter(Boolean);
  if (!items.length) return null;
  const main = data.variant === "dark" ? "bg-ink text-white" : data.variant === "lime" ? "bg-lime text-ink" : "bg-accent text-white";
  if (!data.tilted) return <Band items={items} className={main} />;
  return (
    <section className="relative overflow-hidden py-10 md:py-14" aria-label={items.join(", ")}>
      <Band items={items} reverse className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[3deg] bg-ink text-white/90" />
      <Band items={items} className={cn("relative mx-[-5%] -rotate-[2deg] shadow-2xl", main)} />
    </section>
  );
}
