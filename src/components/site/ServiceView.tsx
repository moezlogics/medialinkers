import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Check, CornerLeftUp } from "lucide-react";
import Breadcrumbs from "./Breadcrumbs";
import Scene3D from "@/components/three/Scene3D";
import { themeForService } from "@/components/three/layouts";
import Highlight from "./Highlight";
import JsonLd from "./JsonLd";
import SectionHeading from "./SectionHeading";
import FaqList from "./FaqList";
import ContactForm from "./ContactForm";
import { PackageGrid } from "./PackageCards";
import { CountUp } from "./motion";
import { Reveal } from "./Reveal";
import { FeatureGrid } from "@/components/sections/Features";
import Process from "@/components/sections/Process";
import AuditCta from "@/components/sections/AuditCta";
import Stats from "@/components/sections/Stats";
import { CaseStudyShowcase } from "@/components/sections/Work";
import { getProjectsForService } from "@/lib/data";
import { Icon } from "@/lib/icons";
import { breadcrumbLd, customLd, faqLd, serviceLd, webPageLd } from "@/lib/seo";
import type { ServiceChild, ServiceDoc, SiteSettings } from "@/lib/types";
import { serviceUrl } from "@/lib/utils";

type Props = {
  service: ServiceDoc;
  /** Main service when `service` is a sub-service */
  parent?: ServiceDoc | null;
  /** All main services (with their sub-services) */
  services: ServiceDoc[];
  settings: SiteSettings;
};

function ServiceCard({ item, href, index }: { item: ServiceChild; href: string; index: number }) {
  return (
    <Reveal delay={(index % 3) * 0.06}>
      <Link href={href} className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-line bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-ink hover:bg-ink hover:text-white">
        <Icon name={item.icon} className="pointer-events-none absolute -bottom-5 -right-5 size-28 text-ink/[0.04] transition-all duration-700 group-hover:rotate-12 group-hover:text-white/[0.07]" />
        <div className="flex items-center justify-between">
          <span className="grid size-12 place-items-center rounded-full border border-line bg-paper transition-colors duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
            <Icon name={item.icon} className="size-5" />
          </span>
          <span className="grid size-9 place-items-center rounded-full border border-line transition-all duration-500 group-hover:rotate-45 group-hover:border-lime group-hover:bg-lime group-hover:text-ink">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        <h3 className="mt-5 font-display text-xl font-bold leading-tight">{item.title}</h3>
        {item.excerpt && <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted transition-colors group-hover:text-white/70">{item.excerpt}</p>}
      </Link>
    </Reveal>
  );
}

export default async function ServiceView({ service: s, parent = null, services, settings }: Props) {
  const path = serviceUrl(s, parent);
  const short = s.shortTitle || s.title;
  const parentShort = parent ? parent.shortTitle || parent.title : "";
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    ...(parent ? [{ name: parentShort, path: serviceUrl(parent) }] : []),
    { name: short, path },
  ];
  const ctx = { settings, services, path, headingAs: "h2" as const };

  const children = s.children || [];
  const siblings = parent ? (parent.children || []).filter((c) => c.slug !== s.slug) : [];
  const related = parent ? [] : services.filter((x) => x.slug !== s.slug).slice(0, 3);

  // On a main service, hide "included" items that already have their own sub-service page
  const features = (s.features || []).filter((f) => !children.some((c) => c.title.toLowerCase().includes(f.title.toLowerCase())));

  // Sub-services fall back to their main service for shared blocks
  const process = s.process?.length ? s.process : parent?.process || [];
  const stats = s.stats?.length ? s.stats : parent?.stats || [];
  const statsTitle = s.stats?.length ? s.statsTitle : parent?.statsTitle;
  const packages = s.packages?.length ? s.packages : parent?.packages || [];
  const packagesOwner = s.packages?.length ? s : parent || s;
  const packagesTitle = (s.packages?.length ? s.packagesTitle : parent?.packagesTitle) || `${packagesOwner.shortTitle || packagesOwner.title} *packages*`;

  // Proof: case studies that used this service (or its family); best overall work otherwise
  const family = [s._id, parent?._id, ...children.map((c) => c._id)].filter(Boolean).join(",");
  const work = await getProjectsForService(family, 3);

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ name: s.seo?.metaTitle || s.title, description: s.seo?.metaDescription || s.excerpt, path, dateModified: s.updatedAt }),
          serviceLd(s, settings, { path, parent }),
          breadcrumbLd(crumbs),
          faqLd(s.faqs || []),
          customLd(s.seo?.schemaJson),
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-x relative grid items-center gap-10 py-10 md:py-14 lg:grid-cols-[1.35fr_1fr]">
          <div className="anim-rise">
            <Breadcrumbs items={crumbs} />
            <div className="mb-3 mt-5 flex flex-wrap items-center gap-2">
              {s.heroEyebrow && <p className="eyebrow text-muted">{s.heroEyebrow}</p>}
              {parent && (
                <Link href={serviceUrl(parent)} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold transition-colors hover:border-ink">
                  <CornerLeftUp className="size-3.5 text-accent" /> Part of {parentShort}
                </Link>
              )}
            </div>
            <h1 className="h-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              <Highlight text={s.heroTitle || s.title} />
            </h1>
            {s.heroText && <p className="mt-5 max-w-2xl leading-relaxed text-muted md:text-lg">{s.heroText}</p>}
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#consultation" className="btn btn-accent !px-6 !py-4">{s.ctaLabel || "Request free consultation"} <ArrowUpRight className="size-4" /></a>
              {packages.length ? <a href="#packages" className="btn btn-outline !px-6 !py-4">View packages</a> : <a href="#free-audit" className="btn btn-outline !px-6 !py-4">Free SEO audit</a>}
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[420px]">
            <div className="absolute -inset-[8%]"><Scene3D variant="orbit" theme={themeForService(s.slug, parent?.slug)} /></div>
            <div className="absolute inset-[33%] grid place-items-center rounded-full bg-ink text-white shadow-[0_30px_80px_-20px_var(--accent)]">
              <Icon name={s.icon} className="size-1/2" />
            </div>
            {stats.slice(0, 3).map((st, i) => (
              <div
                key={i}
                className="animate-float absolute max-w-[170px] rounded-2xl border border-line bg-white px-4 py-3 shadow-xl"
                style={{ ...[{ top: "4%", left: "0%" }, { top: "40%", right: "-2%" }, { bottom: "4%", left: "8%" }][i], animationDelay: `${i * 1.2}s` }}
              >
                <CountUp value={st.value} className="block font-display text-2xl font-extrabold text-accent" />
                <span className="line-clamp-2 text-xs leading-tight text-muted">{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      {(s.whyTitle || s.content) && (
        <section className="section bg-white">
          <div className="container-x grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
            <Reveal>
              <p className="eyebrow mb-3 text-muted">Why it matters</p>
              <h2 className="text-3xl font-bold leading-[1.05] sm:text-4xl lg:text-5xl"><Highlight text={s.whyTitle} /></h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rich prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: s.content || "" }} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Sub-service pages */}
      {children.length > 0 && (
        <section className="section" id="services">
          <div className="container-x">
            <SectionHeading eyebrow={`${short} services`} title={s.featuresTitle || `Explore our ${short} *services*`} text="Every service has its own dedicated team and playbook. Pick one to see how we do it." />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
              {children.map((c, i) => <ServiceCard key={c.slug} item={c} href={serviceUrl(c, s)} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* What's included */}
      {features.length > 0 && (
        <section className={children.length ? "section !pt-0" : "section"}>
          <div className="container-x">
            {children.length ? (
              <SectionHeading eyebrow="And more" title="Also *included*" />
            ) : (
              <SectionHeading eyebrow="What’s included" title={s.featuresTitle || `What’s included in ${short}`} />
            )}
            <FeatureGrid items={features} columns={features.length % 3 === 0 ? "3" : features.length === 4 ? "4" : "3"} />
          </div>
        </section>
      )}

      {process.length > 0 && <Process data={{ eyebrow: "How we work", title: "From vision to *results*", steps: process }} />}

      {work.items.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHeading
              eyebrow={work.matched ? `${parentShort || short} case studies` : "Case studies"}
              title={work.matched ? `Real ${parentShort || short} *results*` : "Recent client *results*"}
              text={work.matched ? "Numbers from real client accounts — not projections." : "A look at what our team has delivered for clients recently."}
              action={<Link href="/case-studies" className="btn btn-dark shrink-0">All case studies <ArrowUpRight className="size-4" /></Link>}
            />
            <CaseStudyShowcase projects={work.items} services={services} />
          </div>
        </section>
      )}

      {stats.length > 0 && <Stats data={{ eyebrow: "Proof", title: statsTitle || "Results that *matter*", items: stats, variant: "dark" }} ctx={ctx} />}

      <AuditCta
        data={{
          eyebrow: "Free audit",
          title: s.ctaTitle || parent?.ctaTitle || "Get your free *audit* today",
          text: s.ctaText || parent?.ctaText || "Share your website and email. Our specialists review it by hand and send a clear, prioritised report within 24 hours.",
          placeholder: "yourwebsite.com",
          buttonLabel: "Get my free audit",
          points: ["Manual expert review", "Delivered within 24 hours", "No obligation"],
        }}
      />

      {packages.length > 0 && (
        <section className="section" id="packages">
          <div className="container-x">
            <SectionHeading eyebrow="Pricing" title={packagesTitle} align="center" />
            <PackageGrid packages={packages} serviceTitle={packagesOwner.title} />
          </div>
        </section>
      )}

      {s.faqs?.length > 0 && (
        <section className="section">
          <div className="container-x grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:gap-14">
            <Reveal>
              <p className="eyebrow mb-3 text-muted">FAQs</p>
              <h2 className="text-3xl font-bold leading-[1.05] sm:text-4xl lg:text-5xl">{short} — <Highlight text="*FAQs*" /></h2>
            </Reveal>
            <FaqList items={s.faqs} />
          </div>
        </section>
      )}

      {/* Consultation form */}
      <section className="section scroll-mt-24 bg-ink text-white" id="consultation">
        <div className="container-x grid items-start gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="eyebrow mb-3 text-white/60">Free consultation</p>
            <h2 className="h-display text-4xl sm:text-5xl lg:text-6xl">Let’s grow your <Highlight text="*business*" tone="lime" /></h2>
            <p className="mt-5 max-w-md text-white/70 md:text-lg">Tell us about your goals. We’ll reply within one business day with a clear plan — no obligation.</p>
            <ul className="mt-6 space-y-2">
              {["Free strategy call with a specialist", "Custom plan & transparent pricing", "No long lock-in contracts"].map((t) => (
                <li key={t} className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-lime text-ink"><Check className="size-3" /></span>{t}</li>
              ))}
            </ul>
          </div>
          <div className="text-ink">
            <Suspense fallback={<div className="h-[520px] animate-pulse rounded-[1.75rem] bg-white/10" />}>
              <ContactForm services={services.map((x) => x.title)} defaultService={(parent || s).title} type="quote" />
            </Suspense>
          </div>
        </div>
      </section>

      {/* More from the same family (sub-service) */}
      {parent && (
        <section className="section">
          <div className="container-x">
            <SectionHeading
              eyebrow="Explore more"
              title={`More ${parentShort} *services*`}
              action={<Link href={serviceUrl(parent)} className="btn btn-dark shrink-0">All {parentShort} services <ArrowUpRight className="size-4" /></Link>}
            />
            {siblings.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {siblings.map((c) => (
                  <Link key={c.slug} href={serviceUrl(c, parent)} className="group flex items-center gap-4 rounded-[1.5rem] border border-line bg-white p-4 transition-all hover:-translate-y-1 hover:border-ink">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-paper transition-colors group-hover:bg-accent group-hover:text-white"><Icon name={c.icon} className="size-5" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-bold leading-tight">{c.title}</span>
                      <span className="line-clamp-1 text-sm text-muted">{c.excerpt}</span>
                    </span>
                    <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:rotate-45" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="Explore more" title="Related *services*" />
            <div className="grid gap-3 md:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={serviceUrl(r)} className="group flex items-center gap-4 rounded-[1.5rem] border border-line bg-white p-5 transition-all hover:-translate-y-1 hover:border-ink">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-paper transition-colors group-hover:bg-accent group-hover:text-white"><Icon name={r.icon} className="size-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold leading-tight">{r.title}</span>
                    <span className="line-clamp-1 text-sm text-muted">{r.excerpt}</span>
                  </span>
                  <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:rotate-45" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
