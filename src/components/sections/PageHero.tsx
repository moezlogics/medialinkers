import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Highlight from "@/components/site/Highlight";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Scene3D, { type SceneTheme } from "@/components/three/Scene3D";
import { themeForPage } from "@/components/three/layouts";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

export default function PageHero({ data, ctx }: SectionProps) {
  const H = ctx.headingAs;
  const dark = data.variant === "dark";
  const accent = data.variant === "accent";
  const theme = (data.shapes && data.shapes !== "auto" ? data.shapes : themeForPage(ctx.page?.slug)) as SceneTheme;
  const crumbs = [{ name: "Home", path: "/" }, { name: ctx.page?.title || "", path: ctx.path }];
  return (
    <section className={cn("relative overflow-hidden", dark && "bg-ink text-white", accent && "bg-accent text-white")}>
      {!data.image && data.shapes !== "none" && <Scene3D variant={dark || accent ? "dark" : "page"} theme={theme} />}
      <div className={cn("container-x relative grid items-center gap-8 py-10 md:py-14", data.image && "lg:grid-cols-[1.3fr_1fr]")}>
        <div className="anim-rise">
          {data.showBreadcrumb !== false && <Breadcrumbs items={crumbs} dark={dark || accent} />}
          {data.eyebrow && <p className={cn("eyebrow mb-3 mt-5", dark || accent ? "text-white/70" : "text-muted")}>{data.eyebrow}</p>}
          <H className={cn("h-display max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl", !data.eyebrow && "mt-5")}>
            <Highlight text={data.title} tone={dark || accent ? "lime" : "accent"} />
          </H>
          {data.text && <p className={cn("mt-5 max-w-2xl text-base leading-relaxed md:text-lg", dark || accent ? "text-white/75" : "text-muted")}>{data.text}</p>}
          {(data.primaryCta?.label || data.secondaryCta?.label) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {data.primaryCta?.label && (
                <Link href={data.primaryCta.href || "#"} className={cn("btn", accent ? "btn-dark" : "btn-accent")}>
                  {data.primaryCta.label} <ArrowUpRight className="size-4" />
                </Link>
              )}
              {data.secondaryCta?.label && (
                <Link href={data.secondaryCta.href || "#"} className="btn btn-outline">
                  {data.secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
        {data.image && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
            <Image src={data.image} alt={data.title?.replace(/\*/g, "") || ""} fill priority sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}
