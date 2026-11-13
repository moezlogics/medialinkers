import Hero from "./Hero";
import PageHero from "./PageHero";
import Logos from "./Logos";
import Marquee from "./Marquee";
import Statement from "./Statement";
import Services from "./Services";
import Stats from "./Stats";
import Process from "./Process";
import Features from "./Features";
import ImageText from "./ImageText";
import RichText from "./RichText";
import AuditCta from "./AuditCta";
import Industries from "./Industries";
import Testimonials from "./Testimonials";
import Work from "./Work";
import Pricing from "./Pricing";
import FaqSection from "./FaqSection";
import Blog from "./Blog";
import BlogList from "./BlogList";
import Contact from "./Contact";
import Team from "./Team";
import Cta from "./Cta";
import Embed from "./Embed";
import type { Section } from "@/lib/types";
import type { SectionCtx } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const MAP: Record<string, (p: { data: any; ctx: SectionCtx }) => any> = {
  hero: Hero,
  pageHero: PageHero,
  logos: Logos,
  marquee: Marquee,
  statement: ({ data }) => <Statement data={data} />,
  services: Services,
  stats: Stats,
  process: ({ data, ctx }) => <Process data={data} headingAs={ctx.headingAs} />,
  features: Features,
  imageText: ImageText,
  richText: RichText,
  auditCta: ({ data }) => <AuditCta data={data} />,
  industries: Industries,
  testimonials: Testimonials,
  work: Work,
  pricing: Pricing,
  faq: FaqSection,
  blog: Blog,
  blogList: BlogList,
  contact: Contact,
  team: Team,
  cta: Cta,
  embed: Embed,
};

export default function SectionRenderer({ sections, ctx }: { sections: Section[]; ctx: Omit<SectionCtx, "headingAs"> }) {
  const visible = sections.filter((s) => s.enabled !== false && MAP[s.type]);
  return (
    <>
      {visible.map((s, i) => {
        const C = MAP[s.type];
        return <C key={s.uid || i} data={s.data || {}} ctx={{ ...ctx, headingAs: i === 0 ? "h1" : "h2" }} />;
      })}
    </>
  );
}
