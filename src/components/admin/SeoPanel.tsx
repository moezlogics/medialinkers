"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Monitor, Smartphone } from "lucide-react";
import { CharCounter, Field, Input, Switch, Textarea } from "./ui";
import { ImageField } from "./MediaLibrary";
import type { Seo } from "@/lib/types";
import { cn, plainHighlight, stripHtml } from "@/lib/utils";

type Props = {
  seo: Seo;
  onChange: (s: Seo) => void;
  fallbackTitle: string;
  fallbackDescription?: string;
  path: string;
  content?: string;
  titleTemplate?: string;
};

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.medialinkers.pk").replace(/\/$/, "");

export default function SeoPanel({ seo, onChange, fallbackTitle, fallbackDescription = "", path, content = "", titleTemplate = "%s | Media Linkers" }: Props) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const set = (k: keyof Seo, v: unknown) => onChange({ ...seo, [k]: v });
  const title = seo.metaTitle || titleTemplate.replace("%s", plainHighlight(fallbackTitle));
  const desc = seo.metaDescription || fallbackDescription;
  const url = SITE + path;

  const checks = useMemo(() => {
    const kw = (seo.focusKeyword || "").toLowerCase().trim();
    const text = stripHtml(content).toLowerCase();
    const words = text.split(" ").filter(Boolean).length;
    const list: { ok: "pass" | "warn" | "fail"; text: string }[] = [];
    list.push(title.length >= 30 && title.length <= 65 ? { ok: "pass", text: `Title length is good (${title.length})` } : { ok: "warn", text: `Title should be 30–65 characters (now ${title.length})` });
    list.push(!desc ? { ok: "fail", text: "Meta description is missing" } : desc.length >= 70 && desc.length <= 160 ? { ok: "pass", text: `Description length is good (${desc.length})` } : { ok: "warn", text: `Description should be 70–160 characters (now ${desc.length})` });
    if (kw) {
      list.push(title.toLowerCase().includes(kw) ? { ok: "pass", text: "Focus keyword appears in the title" } : { ok: "fail", text: "Add the focus keyword to the title" });
      list.push(desc.toLowerCase().includes(kw) ? { ok: "pass", text: "Focus keyword appears in the description" } : { ok: "warn", text: "Add the focus keyword to the description" });
      const slugKw = kw.replace(/\s+/g, "-");
      list.push(path.includes(slugKw) ? { ok: "pass", text: "Focus keyword is in the URL" } : { ok: "warn", text: "Consider using the focus keyword in the URL" });
      if (text) {
        const first = text.split(" ").slice(0, 120).join(" ");
        list.push(first.includes(kw) ? { ok: "pass", text: "Keyword appears in the first paragraph" } : { ok: "warn", text: "Use the keyword early in your content" });
        const count = text.split(kw).length - 1;
        const density = words ? (count * kw.split(" ").length * 100) / words : 0;
        list.push(density >= 0.5 && density <= 3 ? { ok: "pass", text: `Keyword density ${density.toFixed(1)}% (good)` } : { ok: "warn", text: `Keyword density ${density.toFixed(1)}% (aim for 0.5–3%)` });
      }
    } else {
      list.push({ ok: "warn", text: "Set a focus keyword to get keyword tips" });
    }
    if (content) list.push(words >= 300 ? { ok: "pass", text: `Content length: ${words} words` } : { ok: "warn", text: `Content is short (${words} words). Aim for 300+` });
    if (seo.noindex) list.push({ ok: "fail", text: "This page is set to noindex (hidden from Google)" });
    return list;
  }, [seo, title, desc, content, path]);

  const score = Math.round((checks.filter((c) => c.ok === "pass").length / checks.length) * 100);
  const Ico = { pass: CheckCircle2, warn: AlertTriangle, fail: XCircle };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <Field label="Focus keyword" help="The main search phrase you want this page to rank for.">
          <Input value={seo.focusKeyword || ""} onChange={(e) => set("focusKeyword", e.target.value)} placeholder="e.g. seo services in pakistan" />
        </Field>
        <Field label="Meta title" counter={<CharCounter value={seo.metaTitle || ""} min={30} max={65} />} help="Leave empty to use the page title with the site name.">
          <Input value={seo.metaTitle || ""} onChange={(e) => set("metaTitle", e.target.value)} placeholder={title} />
        </Field>
        <Field label="Meta description" counter={<CharCounter value={seo.metaDescription || ""} min={70} max={160} />}>
          <Textarea value={seo.metaDescription || ""} onChange={(e) => set("metaDescription", e.target.value)} placeholder={fallbackDescription || "A compelling summary that makes people click…"} />
        </Field>
        <Field label="Keywords (optional)" help="Comma separated. Google ignores this tag, but some other engines use it.">
          <Input value={seo.keywords || ""} onChange={(e) => set("keywords", e.target.value)} />
        </Field>
        <Field label="Canonical URL" help="Only set this if the same content lives at another URL.">
          <Input value={seo.canonical || ""} onChange={(e) => set("canonical", e.target.value)} placeholder={url} />
        </Field>
        <div className="grid gap-3 rounded-xl border border-line p-3 sm:grid-cols-2">
          <Switch checked={!!seo.noindex} onChange={(v) => set("noindex", v)} label="Hide from Google (noindex)" />
          <Switch checked={!!seo.nofollow} onChange={(v) => set("nofollow", v)} label="Don't follow links (nofollow)" />
        </div>

        <details className="rounded-xl border border-line p-3">
          <summary className="cursor-pointer text-sm font-semibold">Social sharing (Facebook, WhatsApp, LinkedIn, X)</summary>
          <div className="mt-3 space-y-3">
            <Field label="Social title"><Input value={seo.ogTitle || ""} onChange={(e) => set("ogTitle", e.target.value)} placeholder={title} /></Field>
            <Field label="Social description"><Textarea value={seo.ogDescription || ""} onChange={(e) => set("ogDescription", e.target.value)} placeholder={desc} /></Field>
            <ImageField label="Social image (1200×630)" help="Leave empty to auto-generate a branded image." value={seo.ogImage} onChange={(v) => set("ogImage", v)} />
          </div>
        </details>

        <details className="rounded-xl border border-line p-3">
          <summary className="cursor-pointer text-sm font-semibold">Custom structured data (JSON-LD)</summary>
          <div className="mt-3">
            <Field help="Advanced: extra schema.org JSON added to this page. Organization, breadcrumbs, FAQ, Service and Article schema are already added automatically.">
              <Textarea
                value={seo.schemaJson || ""}
                onChange={(e) => set("schemaJson", e.target.value)}
                rows={6}
                className="font-mono text-xs"
                placeholder='{"@context":"https://schema.org","@type":"Event", ...}'
              />
            </Field>
            {seo.schemaJson && (() => {
              try {
                JSON.parse(seo.schemaJson);
                return <p className="mt-1 text-xs font-semibold text-green-600">✓ Valid JSON</p>;
              } catch {
                return <p className="mt-1 text-xs font-semibold text-red-600">✗ Invalid JSON — it will not be saved</p>;
              }
            })()}
          </div>
        </details>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-line p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Google preview</p>
            <div className="flex rounded-lg bg-paper p-0.5">
              <button type="button" onClick={() => setDevice("desktop")} className={cn("rounded-md p-1.5", device === "desktop" && "bg-white shadow-sm")} aria-label="Desktop preview"><Monitor className="size-3.5" /></button>
              <button type="button" onClick={() => setDevice("mobile")} className={cn("rounded-md p-1.5", device === "mobile" && "bg-white shadow-sm")} aria-label="Mobile preview"><Smartphone className="size-3.5" /></button>
            </div>
          </div>
          <div className={cn("rounded-lg bg-white font-[arial,sans-serif]", device === "mobile" ? "max-w-[360px]" : "")}>
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-full bg-ink text-[10px] font-bold text-white">ML</span>
              <div className="leading-tight">
                <p className="text-[13px] text-[#202124]">Media Linkers</p>
                <p className="truncate text-[12px] text-[#4d5156]">{url.replace(/^https?:\/\//, "").replace(/\//g, " › ")}</p>
              </div>
            </div>
            <p className={cn("mt-1.5 line-clamp-2 text-[#1a0dab] hover:underline", device === "mobile" ? "text-[17px]" : "text-[20px]")}>{title.length > 65 ? title.slice(0, 62) + "…" : title}</p>
            <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[#4d5156]">{desc || <i>No description — Google will pick text from the page.</i>}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={seo.ogImage || `/og?title=${encodeURIComponent(plainHighlight(seo.ogTitle || fallbackTitle))}`} alt="" className="aspect-[1200/630] w-full object-cover" />
          <div className="bg-paper p-3">
            <p className="text-[11px] uppercase text-ink/50">{SITE.replace(/^https?:\/\//, "")}</p>
            <p className="line-clamp-1 text-sm font-semibold">{seo.ogTitle || title}</p>
            <p className="line-clamp-1 text-xs text-ink/55">{seo.ogDescription || desc}</p>
          </div>
        </div>

        <div className="rounded-xl border border-line p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">SEO analysis</p>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", score >= 80 ? "bg-green-100 text-green-700" : score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>{score}/100</span>
          </div>
          <ul className="space-y-1.5">
            {checks.map((c, i) => {
              const I = Ico[c.ok];
              return (
                <li key={i} className="flex items-start gap-2 text-[13px]">
                  <I className={cn("mt-0.5 size-4 shrink-0", c.ok === "pass" ? "text-green-600" : c.ok === "warn" ? "text-amber-500" : "text-red-600")} />
                  {c.text}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
