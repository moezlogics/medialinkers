import Link from "next/link";
import { AlertTriangle, CheckCircle2, ExternalLink, FileCode2, Image as ImageIcon, XCircle } from "lucide-react";
import SettingsForm from "@/components/admin/SettingsForm";
import { getSession } from "@/lib/auth";
import { seoHealth } from "@/lib/seo-health";
import { absUrl, cn } from "@/lib/utils";

export default async function SeoPage() {
  const [session, health] = await Promise.all([getSession(), seoHealth()]);
  const errors = health.issues.filter((i) => i.level === "error").length;
  const warnings = health.issues.length - errors;
  const tools = [
    { label: "sitemap.xml", href: "/sitemap.xml" },
    { label: "robots.txt", href: "/robots.txt" },
    { label: "llms.txt", href: "/llms.txt" },
    { label: "RSS feed", href: "/feed.xml" },
    { label: "Rich Results Test", href: `https://search.google.com/test/rich-results?url=${encodeURIComponent(absUrl("/"))}`, external: true },
    { label: "PageSpeed Insights", href: `https://pagespeed.web.dev/report?url=${encodeURIComponent(absUrl("/"))}`, external: true },
    { label: "Search Console", href: "https://search.google.com/search-console", external: true },
  ];

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-5">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">SEO health</h1>
          <p className="mt-1 text-sm text-ink/55">A live scan of every published page, service, post and case study.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-ink p-5 text-white">
            <p className="text-xs uppercase tracking-widest text-white/50">Health score</p>
            <p className={cn("mt-1 font-display text-5xl font-extrabold", health.score >= 80 ? "text-lime" : health.score >= 50 ? "text-amber-300" : "text-red-300")}>{health.score}%</p>
            <p className="text-xs text-white/50">{health.total} URLs scanned</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5"><XCircle className="size-5 text-red-600" /><p className="mt-2 font-display text-3xl font-bold">{errors}</p><p className="text-xs text-ink/55">Errors to fix</p></div>
          <div className="rounded-2xl border border-line bg-white p-5"><AlertTriangle className="size-5 text-amber-500" /><p className="mt-2 font-display text-3xl font-bold">{warnings}</p><p className="text-xs text-ink/55">Warnings</p></div>
          <Link href="/newlogin/media" className="rounded-2xl border border-line bg-white p-5 hover:border-ink/25"><ImageIcon className="size-5 text-sky-600" /><p className="mt-2 font-display text-3xl font-bold">{health.mediaNoAlt}<span className="text-base text-ink/40">/{health.mediaTotal}</span></p><p className="text-xs text-ink/55">Images missing alt text</p></Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tools.map((t) => (
            <a key={t.href} href={t.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-line hover:ring-ink/20">
              {t.external ? <ExternalLink className="size-3.5" /> : <FileCode2 className="size-3.5" />} {t.label}
            </a>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
          {health.issues.length === 0 ? (
            <p className="flex items-center gap-2 p-6 text-sm font-semibold text-green-700"><CheckCircle2 className="size-5" /> Everything looks great — no SEO issues found.</p>
          ) : (
            <ul className="divide-y divide-line">
              {health.issues.map((i, n) => (
                <li key={n} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4">
                  <span className="flex min-w-0 flex-1 items-start gap-3">
                    {i.level === "error" ? <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />}
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{i.message}</span>
                      <span className="block truncate text-xs text-ink/50">{i.type}: {i.item} · {i.viewHref}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-2 pl-7 sm:pl-0">
                    <a href={i.viewHref} target="_blank" className="rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ring-line hover:ring-ink/20">View</a>
                    <Link href={i.editHref} className="rounded-lg bg-ink px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-accent">Fix</Link>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {session?.role === "admin" && (
        <section className="border-t border-line pt-8">
          <SettingsForm mode="seo" />
        </section>
      )}
    </div>
  );
}
