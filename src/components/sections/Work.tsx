import Link from "next/link";
import { ArrowUpRight, Briefcase } from "lucide-react";
import SectionHeading from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import CaseStudyCard from "@/components/case-studies/CaseStudyCard";
import CaseStudyFilter from "@/components/case-studies/CaseStudyFilter";
import { getProjects } from "@/lib/data";
import { projectServices, projectTags, serviceLinks } from "@/lib/case-studies";
import type { ProjectDoc, ServiceDoc } from "@/lib/types";
import type { SectionProps } from "./types";

/** Showcase: first case study wide, the rest in a row. Used on home and service pages. */
export function CaseStudyShowcase({ projects, services }: { projects: ProjectDoc[]; services: ServiceDoc[] }) {
  const map = serviceLinks(services);
  const [first, ...rest] = projects;
  return (
    <div className="grid gap-4">
      {first && (
        <Reveal>
          <CaseStudyCard project={first} tags={projectTags(first, map)} feature index={0} />
        </Reveal>
      )}
      {rest.length > 0 && (
        <div className={rest.length === 1 ? "grid" : "grid gap-4 md:grid-cols-2"}>
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08} className="flex [&>*]:w-full">
              <CaseStudyCard project={p} tags={projectTags(p, map)} index={i + 1} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function Work({ data, ctx }: SectionProps) {
  const limit = Number(data.limit) || 0;
  const grid = data.layout === "grid";
  const projects = await getProjects(limit, !grid && data.featuredOnly !== false);

  if (!projects.length) {
    if (!grid) return null;
    return (
      <section className="section">
        <div className="container-x">
          <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-10 text-center">
            <Briefcase className="mx-auto size-10 text-accent" />
            <p className="mt-4 font-display text-2xl font-bold">Case studies are on the way</p>
            <p className="mx-auto mt-2 max-w-md text-muted">We’re writing up detailed results from our client projects. Want to see examples for your industry? Ask us.</p>
            <Link href="/contact-us" className="btn btn-dark mt-6">Request examples <ArrowUpRight className="size-4" /></Link>
          </div>
        </div>
      </section>
    );
  }

  const action = data.cta?.label ? (
    <Link href={data.cta.href || "/case-studies"} className="btn btn-dark shrink-0">{data.cta.label} <ArrowUpRight className="size-4" /></Link>
  ) : null;
  const heading = data.title || data.eyebrow || data.text ? <SectionHeading eyebrow={data.eyebrow} title={data.title} text={data.text} action={action} as={ctx.headingAs} /> : null;

  if (!grid) {
    return (
      <section className="section">
        <div className="container-x">
          {heading}
          <CaseStudyShowcase projects={projects} services={ctx.services} />
        </div>
      </section>
    );
  }

  // Grid with filter chips, one chip per main service that has work to show
  const map = serviceLinks(ctx.services);
  const items = projects.map((p, i) => {
    const used = projectServices(p, map);
    return {
      id: p.slug,
      groups: [...new Set(used.map((u) => u.mainId))],
      region: p.location || "",
      node: <CaseStudyCard project={p} tags={projectTags(p, map)} index={i} />,
    };
  });
  // Countries, most case studies first
  const regionCount = new Map<string, number>();
  for (const it of items) if (it.region) regionCount.set(it.region, (regionCount.get(it.region) || 0) + 1);
  const regions = [...regionCount.entries()].sort((a, b) => b[1] - a[1]).map(([r]) => r);
  const filters = ctx.services
    .filter((s) => items.some((i) => i.groups.includes(s._id)))
    .map((s) => ({ value: s._id, label: s.shortTitle || s.title }));

  return (
    <section className="section">
      <div className="container-x">
        {heading}
        <CaseStudyFilter filters={filters} regions={regions} items={items} />
      </div>
    </section>
  );
}
