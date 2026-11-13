import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Highlight from "@/components/site/Highlight";
import { Magnetic } from "@/components/site/motion";
import { Reveal } from "@/components/site/Reveal";
import Scene3D from "@/components/three/Scene3D";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

export default function Cta({ data, ctx }: SectionProps) {
  const v = data.variant || "dark";
  const H = ctx.headingAs;
  const tone = v === "dark" ? "bg-ink text-white" : v === "lime" ? "bg-lime text-ink" : "bg-accent text-white";
  return (
    <section className="section">
      <div className="container-x">
        <Reveal className={cn("grain relative overflow-hidden rounded-[2rem] p-7 sm:p-12 lg:p-16", tone)}>
          <Scene3D variant="dark" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              {data.eyebrow && <p className={cn("eyebrow mb-4", v === "lime" ? "text-ink/60" : "text-white/60")}>{data.eyebrow}</p>}
              <H className="h-display text-4xl sm:text-5xl lg:text-7xl">
                <Highlight text={data.title} tone={v === "dark" ? "lime" : "accent"} />
              </H>
              {data.text && <p className={cn("mt-5 max-w-xl md:text-lg", v === "lime" ? "text-ink/70" : "text-white/70")}>{data.text}</p>}
              {data.secondaryCta?.label && (
                <Link href={data.secondaryCta.href || "#"} className="mt-6 inline-flex items-center gap-2 font-semibold underline decoration-2 underline-offset-4">
                  {data.secondaryCta.label} <ArrowUpRight className="size-4" />
                </Link>
              )}
            </div>
            {data.primaryCta?.label && (
              <Magnetic className="shrink-0 self-start lg:self-center">
                <Link
                  href={data.primaryCta.href || "/contact-us"}
                  className={cn(
                    "group grid size-40 place-items-center rounded-full text-center font-display text-lg font-bold leading-tight transition-colors duration-500 sm:size-48",
                    v === "dark" ? "bg-accent text-white hover:bg-lime hover:text-ink" : "bg-ink text-white hover:bg-white hover:text-ink",
                  )}
                >
                  <span className="flex flex-col items-center gap-2 px-6">
                    <ArrowUpRight className="size-8 transition-transform duration-500 group-hover:rotate-45" />
                    {data.primaryCta.label}
                  </span>
                </Link>
              </Magnetic>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
