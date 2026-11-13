import Link from "next/link";
import SectionHeading from "@/components/site/SectionHeading";
import { PricingTabs } from "@/components/site/PackageCards";
import type { SectionProps } from "./types";

export default function Pricing({ data, ctx }: SectionProps) {
  const groups = ctx.services
    .filter((s) => s.packages?.length && (!data.service || s.slug === data.service))
    .map((s) => ({ slug: s.slug, title: s.shortTitle || s.title, packages: s.packages }));
  if (!groups.length) return null;
  return (
    <section className="section" id="packages">
      <div className="container-x">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} text={data.text} align="center" as={ctx.headingAs} />
        <PricingTabs groups={groups} />
        <p className="mt-8 text-center text-sm text-muted">Need a custom plan? <Link href="/contact-us" className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4">Talk to us</Link> — we’ll tailor it to your goals.</p>
      </div>
    </section>
  );
}
