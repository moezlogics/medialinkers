import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, CalendarRange, Expand, Lock, Quote, ShieldCheck } from "lucide-react";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import JsonLd from "@/components/site/JsonLd";
import { Reveal } from "@/components/site/Reveal";
import SectionHeading from "@/components/site/SectionHeading";
import TrendChart from "@/components/case-studies/TrendChart";
import CaseStudyCard from "@/components/case-studies/CaseStudyCard";
import { BrowserFrame, PhoneFrame, domainOf } from "@/components/case-studies/Frames";
import Cta from "@/components/sections/Cta";
import Scene3D from "@/components/three/Scene3D";
import { getProject, getProjects, getServices, getSettings } from "@/lib/data";
import { accentFor, clientName, projectServices, projectTags, serviceLinks } from "@/lib/case-studies";
import { Icon } from "@/lib/icons";
import { isPreview } from "@/lib/preview";
import { sectionDefaults } from "@/lib/sections";
import { breadcrumbLd, buildMetadata, caseStudyLd, customLd, webPageLd } from "@/lib/seo";

export const revalidate = 3600;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [p, settings] = await Promise.all([getProject(slug, await isPreview()), getSettings()]);
  if (!p) return { title: "Not found", robots: { index: false } };
  return buildMetadata(settings, { seo: p.seo, title: `${p.title} — Case Study`, description: p.excerpt, path: `/case-studies/${p.slug}`, image: p.coverImage || p.proofs?.[0]?.image, type: "article", modifiedTime: p.updatedAt });
}

/** "4.91K" → 4910, "1.2M" → 1200000, "13.7" → 13.7 */
function num(v?: string) {
  if (!v) return NaN;
  const m = v.replace(/,/g, "").match(/(-?[\d.]+)\s*([kKmM])?/);
  if (!m) return NaN;
  return parseFloat(m[1]) * (m[2] ? (/k/i.test(m[2]) ? 1e3 : 1e6) : 1);
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const [p, settings, services, all] = await Promise.all([getProject(slug, await isPreview()), getSettings(), getServices(), getProjects()]);
  if (!p) notFound();

  const path = `/case-studies/${p.slug}`;
  const crumbs = [{ name: "Home", path: "/" }, { name: "Case Studies", path: "/case-studies" }, { name: p.title, path }];
  const map = serviceLinks(services);
  const used = projectServices(p, map);
  const tags = projectTags(p, map);
  const index = Math.max(0, all.findIndex((x) => x.slug === p.slug));
  const color = accentFor(p, index);
  const head = p.results?.[0];
  const related = all.filter((x) => x.slug !== p.slug).slice(0, 2);
  const kicker = [used[0]?.mainShort ? `${used[0].mainShort} case study` : "Case study", p.industry].filter(Boolean).join(" · ");
  const ctx = { settings, services, path, headingAs: "h2" as const };
  const hasTrend = !!(p.trend?.points && p.trend.points.length > 1);
  const desktops = (p.screens || []).filter((x) => x.device !== "mobile");
  const phones = (p.screens || []).filter((x) => x.device === "mobile");
  const showSite = !hasTrend && (desktops.length > 0 || !!p.coverImage);

  const facts = [
    { label: "Client", value: clientName(p), icon: p.confidential ? Lock : null },
    { label: "Industry", value: p.industry },
    { label: "Market", value: p.location },
    { label: "Timeline", value: [p.period, p.duration && `(${p.duration})`].filter(Boolean).join(" ") },
  ].filter((f) => f.value);

  return (
    <>
      <JsonLd data={[webPageLd({ name: p.title, description: p.excerpt, path, dateModified: p.updatedAt }), caseStudyLd(p, tags), breadcrumbLd(crumbs), customLd(p.seo?.schemaJson)]} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <Scene3D variant="corner" theme="work" />
        <div className="container-x relative grid gap-8 py-10 md:py-14 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-12">
          <div className="anim-rise">
            <Breadcrumbs items={crumbs} />
            <p className="eyebrow mb-3 mt-5 text-muted">{kicker}</p>
            <h1 className="h-display text-4xl sm:text-5xl lg:text-6xl">{p.title}</h1>
            {p.excerpt && <p className="mt-5 max-w-2xl text-muted md:text-lg">{p.excerpt}</p>}
            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{f.label}</dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-semibold leading-snug">{f.icon && <f.icon className="size-3.5 shrink-0 text-muted" />}{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {used.length
                ? used.map((u) => (
                    <Link key={u.id} href={u.href} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:border-ink">{u.short}</Link>
                  ))
                : tags.map((t) => <span key={t} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium">{t}</span>)}
              {p.website && !p.confidential && (
                <a href={p.website} target="_blank" rel="noopener" className="ml-1 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
                  {p.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")} <ArrowUpRight className="size-4" />
                </a>
              )}
            </div>
          </div>

          {/* Website we built, or the headline result */}
          {showSite ? (
            <div className="anim-rise relative pb-10 pr-6 sm:pr-14" style={{ animationDelay: ".1s" }}>
              <BrowserFrame src={desktops[0]?.image || p.coverImage!} alt={`${clientName(p)} website on desktop`} url={domainOf(p.website)} priority sizes="(min-width:1024px) 45vw, 100vw" />
              {phones[0] && <PhoneFrame src={phones[0].image} alt={`${clientName(p)} website on mobile`} className="absolute -bottom-2 right-0 w-[30%] max-w-[170px]" />}
            </div>
          ) : (
          <div className="anim-rise relative isolate overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-[0_40px_90px_-40px_rgba(0,0,0,.6)] sm:p-8" style={{ animationDelay: ".1s" }}>
            <div className="pointer-events-none absolute -right-20 -top-24 -z-10 size-72 rounded-full opacity-30 blur-3xl" style={{ background: color }} aria-hidden="true" />
            <div className="flex items-center justify-between gap-3 text-sm text-white/60">
              {p.proofs?.length ? <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4" style={{ color }} /> Real client data</span> : <span />}
              {p.period && <span className="hidden items-center gap-1.5 sm:inline-flex"><CalendarRange className="size-4" /> {p.period}</span>}
            </div>
            {head && (
              <div className="mt-6">
                <p className="font-display text-6xl font-extrabold leading-none tracking-tight sm:text-7xl" style={{ color }}>{head.value}</p>
                <p className="mt-2 text-white/70">{head.label}</p>
              </div>
            )}
            {p.trend?.points && p.trend.points.length > 1 && (
              <div className="-mx-6 -mb-6 mt-6 sm:-mx-8 sm:-mb-8">
                <TrendChart points={p.trend.points} color={color} label={p.trend.label || "Growth trend"} />
              </div>
            )}
            {hasTrend && p.trend?.label && <p className="relative mt-2 text-right text-[11px] uppercase tracking-[0.14em] text-white/40">{p.trend.label}</p>}
          </div>
          )}
        </div>
      </section>

      {/* Results */}
      {p.results && p.results.length > 0 && (
        <section className="section !pt-2">
          <div className="container-x">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {p.results.map((r, i) => {
                const b = num(r.before);
                const a = num(r.after);
                const ratio = Number.isFinite(a) && Number.isFinite(b) && a > 0 ? Math.max(0.04, Math.min(1, b / a)) : null;
                return (
                  <Reveal key={r.label} delay={i * 0.06} className="flex flex-col rounded-[1.5rem] border border-line bg-white p-5 sm:p-6">
                    <p className="font-display text-4xl font-extrabold leading-none tracking-tight">{r.value}</p>
                    <p className="mt-2 text-sm text-muted">{r.label}</p>
                    {r.before && r.after && (
                      <div className="mt-auto pt-5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-muted">Before: {r.before}</span>
                          <span className="inline-flex items-center gap-1">After: {r.after}</span>
                        </div>
                        {ratio !== null && (
                          <div className="mt-2 space-y-1.5" aria-hidden="true">
                            <div className="h-1.5 rounded-full bg-ink/15" style={{ width: `${ratio * 100}%` }} />
                            <div className="bar-grow h-1.5 rounded-full bg-ink" />
                          </div>
                        )}
                      </div>
                    )}
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* The website we built */}
      {(desktops.length > 0 || phones.length > 0) && (
        <section className="section overflow-hidden bg-ink text-white">
          <div className="container-x">
            <SectionHeading
              eyebrow="Design & development"
              title={`The website we *built*`}
              text={p.website && !p.confidential ? `Live at ${domainOf(p.website)} — designed, developed and optimised by our team.` : "Designed, developed and optimised by our team."}
              action={p.website && !p.confidential ? <a href={p.website} target="_blank" rel="noopener" className="btn btn-light shrink-0">Visit the website <ArrowUpRight className="size-4" /></a> : undefined}
              dark
            />
            <div className={phones.length ? "grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-10" : "grid gap-6"}>
              <div className="space-y-6">
                {desktops.map((d, i) => (
                  <Reveal as="article" key={d.image + i}>
                    <BrowserFrame src={d.image} alt={d.caption || `${clientName(p)} website`} url={domainOf(p.website)} sizes="(min-width:1024px) 60vw, 100vw" imgClassName="aspect-[16/10]" />
                    {d.caption && <p className="mt-3 text-sm text-white/60">{d.caption}</p>}
                  </Reveal>
                ))}
              </div>
              {phones.length > 0 && (
                <div className="mx-auto grid w-full max-w-[260px] gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-1">
                  {phones.map((m, i) => (
                    <Reveal as="article" key={m.image + i} delay={0.08}>
                      <PhoneFrame src={m.image} alt={m.caption || `${clientName(p)} website on mobile`} />
                      {m.caption && <p className="mt-3 text-sm text-white/60">{m.caption}</p>}
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Story */}
      {(p.challenge || p.approach?.length || p.content || p.outcome) && (
        <section className="section bg-white">
          <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:gap-16">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow mb-3 text-muted">At a glance</p>
              <ul className="space-y-3">
                {(p.results || []).slice(0, 4).map((r) => (
                  <li key={r.label} className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                    <span className="text-sm text-muted">{r.label}</span>
                    <span className="font-display text-lg font-bold">{r.value}</span>
                  </li>
                ))}
              </ul>
              <a href="#free-audit" className="btn btn-dark mt-6 w-full">Get a free audit like this <ArrowRight className="size-4" /></a>
            </aside>
            <div className="min-w-0 space-y-12">
              {p.challenge && (
                <Reveal>
                  <h2 className="font-display text-3xl font-bold sm:text-4xl">The challenge</h2>
                  <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink/80">{p.challenge}</p>
                </Reveal>
              )}
              {p.approach && p.approach.length > 0 && (
                <div>
                  <h2 className="font-display text-3xl font-bold sm:text-4xl">What we did</h2>
                  <ol className="mt-6 grid gap-3 sm:grid-cols-2">
                    {p.approach.map((s, i) => (
                      <Reveal as="li" key={s.title} delay={(i % 2) * 0.06} className="relative rounded-[1.5rem] border border-line bg-paper/60 p-5">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-white"><Icon name={s.icon || "check"} className="size-[18px]" /></span>
                          <span className="font-display text-sm font-bold text-muted">Step {String(i + 1).padStart(2, "0")}</span>
                        </div>
                        <h3 className="mt-4 font-display text-lg font-bold leading-snug">{s.title}</h3>
                        {s.text && <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{s.text}</p>}
                      </Reveal>
                    ))}
                  </ol>
                </div>
              )}
              {p.content && <div className="rich prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: p.content }} />}
              {p.outcome && (
                <Reveal className="rounded-[1.75rem] bg-ink p-6 text-white sm:p-8">
                  <p className="eyebrow text-white/50">The outcome</p>
                  <p className="mt-3 font-display text-2xl font-bold leading-snug sm:text-3xl">{p.outcome}</p>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Proof */}
      {p.proofs && p.proofs.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="The proof" title="Straight from the *data*" text="Screenshots from the client’s own analytics. Click any image to view it full size." />
            <div className="grid gap-4 lg:grid-cols-2">
              {p.proofs.map((pr, i) => (
                <Reveal key={pr.image + i} delay={(i % 2) * 0.06} as="article" className={p.proofs!.length % 2 === 1 && i === 0 ? "lg:col-span-2" : ""}>
                  <a href={pr.image} target="_blank" rel="noopener" className="group block overflow-hidden rounded-[1.5rem] border border-line bg-white p-2 transition-colors hover:border-ink/30">
                    <div className="relative overflow-hidden rounded-[1.1rem] bg-paper">
                      <Image src={pr.image} alt={pr.caption || `${p.title} — result screenshot ${i + 1}`} width={pr.width || 1440} height={pr.height || 600} sizes="(min-width:1024px) 50vw, 100vw" className="h-auto w-full" />
                      <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity group-hover:opacity-100"><Expand className="size-4" /></span>
                    </div>
                    {pr.caption && <p className="px-3 pb-2 pt-3 text-sm text-muted">{pr.caption}</p>}
                  </a>
                </Reveal>
              ))}
            </div>
            {p.confidential && (
              <p className="mt-4 flex items-center gap-2 text-sm text-muted"><Lock className="size-4" /> The client’s brand name is kept private at their request. Full details are available on a call.</p>
            )}
          </div>
        </section>
      )}

      {p.quote?.text && (
        <section className="section !pt-0">
          <div className="container-x">
            <Reveal className="mx-auto max-w-4xl text-center">
              <Quote className="mx-auto size-10 text-accent" />
              <blockquote className="mt-4 font-display text-2xl font-bold leading-snug sm:text-3xl">“{p.quote.text}”</blockquote>
              {(p.quote.name || p.quote.role) && <p className="mt-4 text-muted">{[p.quote.name, p.quote.role].filter(Boolean).join(" · ")}</p>}
            </Reveal>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section !pt-0">
          <div className="container-x">
            <SectionHeading
              eyebrow="More results"
              title="Other *case studies*"
              action={<Link href="/case-studies" className="btn btn-outline shrink-0">All case studies <ArrowUpRight className="size-4" /></Link>}
            />
            <div className="grid gap-4 md:grid-cols-2">
              {related.map((r) => (
                <Reveal key={r.slug} className="flex [&>*]:w-full">
                  <CaseStudyCard project={r} tags={projectTags(r, map)} index={all.findIndex((x) => x.slug === r.slug)} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <Cta
        data={{ ...sectionDefaults("cta"), eyebrow: "Your turn", title: "Want results like *these*?", text: "Tell us where you want to grow. We’ll show you exactly how we’d get there — free, in one call.", secondaryCta: { label: "Or get a free SEO audit", href: "#free-audit" } }}
        ctx={ctx}
      />
    </>
  );
}
