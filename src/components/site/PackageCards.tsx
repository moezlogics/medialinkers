"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServicePackage } from "@/lib/types";

export function PackageGrid({ packages, serviceTitle }: { packages: ServicePackage[]; serviceTitle: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4", packages.length >= 3 ? "lg:grid-cols-3" : packages.length === 2 ? "md:grid-cols-2" : "max-w-md")}>
      {packages.map((p) => {
        const f = !!p.featured;
        const params = new URLSearchParams({ service: serviceTitle, package: p.name });
        return (
          <div
            key={p.name}
            className={cn(
              "relative flex min-w-0 flex-col rounded-[1.75rem] p-6 transition-transform duration-500 hover:-translate-y-1 md:p-7",
              f ? "bg-ink text-white shadow-[0_30px_60px_-30px_var(--accent)] lg:scale-[1.03]" : "border border-line bg-white",
            )}
          >
            {f && (
              <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <Flame className="size-3.5" /> Best seller
              </span>
            )}
            <h3 className="font-display text-2xl font-bold">{p.name}</h3>
            {p.perfectFor && <p className={cn("mt-2 text-sm", f ? "text-white/60" : "text-muted")}>{p.perfectFor}</p>}
            <div className="mt-6 flex flex-wrap items-end gap-x-2 gap-y-1">
              {p.oldPrice && (
                <span className={cn("pb-1.5 text-lg line-through", f ? "text-white/40" : "text-muted")}>
                  {p.currency}
                  {Number(p.oldPrice).toLocaleString() !== "NaN" ? Number(p.oldPrice).toLocaleString() : p.oldPrice}
                </span>
              )}
              <span className="font-display text-[2.6rem] font-extrabold leading-none tracking-tight sm:text-5xl">
                <span className="mr-0.5 align-top text-xl font-bold">{p.currency}</span>
                {Number(p.price).toLocaleString() !== "NaN" ? Number(p.price).toLocaleString() : p.price}
              </span>
              <span className={cn("pb-1 text-sm", f ? "text-white/60" : "text-muted")}>{p.period}</span>
            </div>
            <ul className="mt-6 flex-1 space-y-2.5 border-t border-current/10 pt-6">
              {p.features.filter(Boolean).map((feat) => (
                <li key={feat} className="flex gap-2.5 text-[15px]">
                  <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", f ? "bg-lime text-ink" : "bg-accent/10 text-accent")}>
                    <Check className="size-3" />
                  </span>
                  <span className={f ? "text-white/85" : ""}>{feat}</span>
                </li>
              ))}
            </ul>
            {p.goal && <p className={cn("mt-5 rounded-2xl p-3 text-sm", f ? "bg-white/10 text-white/80" : "bg-paper text-muted")}><b className={f ? "text-white" : "text-ink"}>Goal:</b> {p.goal}</p>}
            <Link href={`/contact-us?${params}`} className={cn("btn mt-6 w-full !py-4", f ? "btn-accent" : "btn-dark")}>
              {p.ctaLabel || "Get started"} <ArrowUpRight className="size-4" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export function PricingTabs({ groups }: { groups: { slug: string; title: string; packages: ServicePackage[] }[] }) {
  const [active, setActive] = useState(groups[0]?.slug);
  const current = groups.find((g) => g.slug === active) || groups[0];
  if (!current) return null;
  return (
    <div>
      {groups.length > 1 && (
        <div role="tablist" aria-label="Service" className="no-scrollbar mx-auto mb-8 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-white p-1">
          {groups.map((g) => (
            <button
              key={g.slug}
              role="tab"
              aria-selected={g.slug === current.slug}
              onClick={() => setActive(g.slug)}
              className={cn("relative whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-colors", g.slug === current.slug ? "text-white" : "text-ink hover:bg-paper")}
            >
              {g.slug === current.slug && <span className="anim-pop absolute inset-0 rounded-full bg-ink" />}
              <span className="relative">{g.title}</span>
            </button>
          ))}
        </div>
      )}
      <div key={current.slug} className="anim-rise pt-3">
          <PackageGrid packages={current.packages} serviceTitle={current.title} />
      </div>
    </div>
  );
}
