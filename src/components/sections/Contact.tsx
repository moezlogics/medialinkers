import { Suspense } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Highlight from "@/components/site/Highlight";
import ContactForm from "@/components/site/ContactForm";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { Icon } from "@/lib/icons";
import Scene3D from "@/components/three/Scene3D";
import { whatsappLink } from "@/lib/utils";
import type { SectionProps } from "./types";

export default function Contact({ data, ctx }: SectionProps) {
  const c = ctx.settings.contact;
  const H = ctx.headingAs;
  const rows = [
    c.phone && { icon: Phone, label: "Call us", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    c.email && { icon: Mail, label: "Email us", value: c.email, href: `mailto:${c.email}` },
    c.address && { icon: MapPin, label: "Office", value: [c.address, c.city].filter(Boolean).join(", ") },
    c.hours && { icon: Clock, label: "Hours", value: c.hours },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <section className="relative overflow-hidden">
      <Scene3D variant="corner" theme="contact" />
      <div className="container-x relative grid gap-8 py-10 md:py-14 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
        <div className="anim-rise">
          {H === "h1" && <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: ctx.page?.title || "Contact", path: ctx.path }]} />}
          {data.eyebrow && <p className="eyebrow mb-3 mt-5 text-muted">{data.eyebrow}</p>}
          <H className="h-display text-4xl sm:text-5xl lg:text-6xl">
            <Highlight text={data.title} />
          </H>
          {data.text && <p className="mt-5 max-w-lg text-muted md:text-lg">{data.text}</p>}
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {rows.map((r) => {
              const inner = (
                <>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-white transition-colors group-hover:bg-accent"><r.icon className="size-4" /></span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted">{r.label}</span>
                    <span className="block break-words font-semibold">{r.value}</span>
                  </span>
                </>
              );
              return (
                <li key={r.label}>
                  {r.href ? (
                    <a href={r.href} className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-3 transition-colors hover:border-ink">{inner}</a>
                  ) : (
                    <div className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-3">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
          {c.whatsapp && (
            <a href={whatsappLink(c.whatsapp, "Hi Media Linkers!")} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#25d366] p-4 font-semibold text-white transition-transform hover:-translate-y-0.5">
              <span className="flex items-center gap-3"><Icon name="whatsapp" className="size-6" /> Prefer WhatsApp? Chat with us now</span>
              <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
        <div>
          <Suspense fallback={<div className="h-[560px] animate-pulse rounded-[1.75rem] bg-white" />}>
            <ContactForm title={data.formTitle} services={ctx.services.map((s) => s.title)} />
          </Suspense>
        </div>
      </div>
      {data.showMap && c.mapEmbed && (
        <div className="container-x pb-10">
          <div className="overflow-hidden rounded-[1.75rem] border border-line [&_iframe]:h-[380px] [&_iframe]:w-full" dangerouslySetInnerHTML={{ __html: c.mapEmbed }} />
        </div>
      )}
    </section>
  );
}
