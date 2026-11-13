import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";
import { Icon } from "@/lib/icons";
import type { ServiceDoc, SiteSettings } from "@/lib/types";

const SOCIALS: [keyof SiteSettings["social"], string, string][] = [
  ["facebook", "facebook", "Facebook"],
  ["instagram", "instagram", "Instagram"],
  ["linkedin", "linkedin", "LinkedIn"],
  ["x", "x", "X"],
  ["youtube", "youtube", "YouTube"],
  ["tiktok", "tiktok", "TikTok"],
];

export default function Footer({ settings, services }: { settings: SiteSettings; services: Pick<ServiceDoc, "title" | "slug">[] }) {
  const year = new Date().getFullYear();
  const socials = SOCIALS.filter(([k]) => settings.social[k]);
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="container-x pt-14 md:pt-20">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="space-y-6">
            <Logo src={settings.logoDark || settings.logo} name={settings.siteName} dark />
            <p className="max-w-sm leading-relaxed text-white/60">{settings.footer.about}</p>
            <div>
              <p className="mb-1 font-display text-xl font-semibold">{settings.footer.newsletterTitle}</p>
              <p className="mb-3 text-sm text-white/50">{settings.footer.newsletterText}</p>
              <NewsletterForm />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Services</p>
              <ul className="space-y-2.5">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/${s.slug}`} className="text-white/80 transition-colors hover:text-accent">{s.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
            {settings.footer.columns.map((col) => (
              <div key={col.title}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} className="text-white/80 transition-colors hover:text-accent">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1 lg:hidden" />
          </div>
        </div>

        <div className="grid gap-6 border-b border-white/10 py-8 md:grid-cols-3">
          {settings.contact.phone && (
            <a href={`tel:${settings.contact.phone.replace(/\s/g, "")}`} className="group flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors group-hover:bg-accent"><Phone className="size-4" /></span>
              <span><span className="block text-xs text-white/40">Call us</span>{settings.contact.phone}</span>
            </a>
          )}
          {settings.contact.email && (
            <a href={`mailto:${settings.contact.email}`} className="group flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors group-hover:bg-accent"><Mail className="size-4" /></span>
              <span><span className="block text-xs text-white/40">Email</span>{settings.contact.email}</span>
            </a>
          )}
          {settings.contact.address && (
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-white/10"><MapPin className="size-4" /></span>
              <span><span className="block text-xs text-white/40">Visit</span>{[settings.contact.address, settings.contact.city].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start justify-between gap-4 py-6 text-sm text-white/50 md:flex-row md:items-center">
          <p>{settings.footer.copyright.replace("{year}", String(year))}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link href="/terms-conditions" className="hover:text-white">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-white">Sitemap</Link>
            {socials.length > 0 && (
              <div className="flex gap-2">
                {socials.map(([k, icon, label]) => (
                  <a key={k} href={settings.social[k]} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-accent">
                    <Icon name={icon} className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Link href="/contact-us" aria-label="Start a project" className="group block select-none border-t border-white/10">
        <div className="container-x flex items-center justify-between gap-4 py-4">
          <span className="min-w-0 whitespace-nowrap font-display text-[10.5vw] font-extrabold uppercase leading-[0.9] tracking-tighter text-stroke text-white/90 transition-colors duration-500 group-hover:text-accent group-hover:[-webkit-text-stroke-color:var(--accent)] lg:text-[8.4vw] 2xl:text-[8rem]">
            {settings.siteName}
          </span>
          <ArrowUpRight className="hidden size-24 shrink-0 text-accent transition-transform duration-500 group-hover:rotate-45 lg:block" />
        </div>
      </Link>
    </footer>
  );
}
