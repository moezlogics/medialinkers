"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronRight, Menu, Phone, X } from "lucide-react";
import Logo from "./Logo";
import { cn, whatsappLink } from "@/lib/utils";
import type { NavItem, SiteSettings } from "@/lib/types";

/** Icons arrive already rendered from the server, so the icon set never ships to the browser. */
export type ServiceLink = {
  title: string;
  shortTitle?: string;
  slug: string;
  icon: ReactNode;
  excerpt?: string;
  children: { title: string; slug: string; icon: ReactNode }[];
};

export type HeaderSettings = Pick<SiteSettings, "nav" | "announcement" | "logo" | "logoDark" | "siteName" | "headerCta" | "contact">;

const ico = "[&>svg]:size-full";

export default function Header({ settings, services, whatsappIcon }: { settings: HeaderSettings; services: ServiceLink[]; whatsappIcon?: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<"closed" | "open" | "closing">("closed");
  const [mega, setMega] = useState(false);
  // The mega menu is only added to the page once it is first opened (keeps the HTML small)
  const [megaMounted, setMegaMounted] = useState(false);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [announce, setAnnounce] = useState(settings.announcement.enabled && !!settings.announcement.text);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const open = menu === "open";

  const closeMenu = useCallback(() => {
    setMenu((m) => (m === "open" ? "closing" : m));
    setTimeout(() => setMenu((m) => (m === "closing" ? "closed" : m)), 380);
  }, []);

  useEffect(() => {
    let ticking = false;
    const on = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        ticking = false;
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    // The audit popup (and other overlays) ask open menus to close
    const onOverlay = () => {
      setMega(false);
      setMenu((m) => (m === "open" ? "closed" : m));
    };
    window.addEventListener("ml:overlay", onOverlay);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("ml:overlay", onOverlay);
    };
  }, []);

  // Close menus after navigating
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenu("closed");
    setMega(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = menu !== "closed" ? "hidden" : "";
    if (menu !== "open") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menu, closeMenu]);

  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMega(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mega]);

  // Small delay so the pointer can travel from the nav link into the panel
  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaMounted(true);
    setMega(true);
  };
  const closeMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(false), 160);
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
  const inServices = pathname === "/services" || services.some((s) => pathname === `/${s.slug}` || pathname.startsWith(`/${s.slug}/`));
  const isServicesItem = (n: NavItem) => n.href === "/services";
  const current = services[active] || services[0];

  return (
    <>
      {announce && (
        <div className="relative z-50 bg-ink text-white">
          <div className="container-x flex items-center justify-center gap-3 py-2 pr-10 text-center text-xs sm:text-sm">
            <span className="relative flex size-2 shrink-0">
              <span className="ping-soft absolute inline-flex size-full rounded-full bg-lime" />
              <span className="relative inline-flex size-2 rounded-full bg-lime" />
            </span>
            {settings.announcement.link ? (
              <Link href={settings.announcement.link} className="group inline-flex items-center gap-1 hover:text-lime">
                {settings.announcement.text}
                <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <span>{settings.announcement.text}</span>
            )}
            <button onClick={() => setAnnounce(false)} aria-label="Close announcement" className="absolute right-3 rounded-full p-1 text-white/60 hover:text-white">
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 px-2 pt-2 sm:px-4">
        <div className="relative mx-auto max-w-[1320px]">
          <div
            className={cn(
              "flex items-center justify-between gap-4 rounded-full border px-3 py-2 transition-[background-color,border-color,box-shadow] duration-500 sm:px-4",
              scrolled || mega ? "border-line bg-white/90 shadow-[0_10px_40px_-20px_rgba(0,0,0,.35)] backdrop-blur-xl" : "border-transparent bg-transparent",
            )}
          >
            <Logo src={settings.logo} name={settings.siteName} />

            <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
              {settings.nav.map((item) =>
                isServicesItem(item) && services.length ? (
                  <div key={item.href} onMouseEnter={openMega} onMouseLeave={closeMega}>
                    <Link
                      href={item.href}
                      className={cn("flex items-center gap-1 rounded-full px-4 py-2 text-[15px] font-medium transition-colors hover:bg-ink/5", (inServices || mega) && "text-accent")}
                      aria-expanded={mega}
                      aria-haspopup="true"
                      onFocus={openMega}
                    >
                      {item.label}
                      <ChevronDown className={cn("size-4 transition-transform duration-300", mega && "rotate-180")} />
                    </Link>
                  </div>
                ) : item.children?.length ? (
                  <div key={item.href} className="group relative">
                    <Link href={item.href} className={cn("flex items-center gap-1 rounded-full px-4 py-2 text-[15px] font-medium transition-colors hover:bg-ink/5", isActive(item.href) && "text-accent")}>
                      {item.label}
                      <ChevronDown className="size-4 transition-transform duration-300 group-hover:rotate-180" />
                    </Link>
                    <div className="invisible absolute left-0 top-full w-60 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <ul className="rounded-2xl border border-line bg-white p-2 shadow-2xl">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-paper hover:text-accent">{c.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link key={item.href} href={item.href} className={cn("rounded-full px-4 py-2 text-[15px] font-medium transition-colors hover:bg-ink/5", isActive(item.href) && "text-accent")}>
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="flex items-center gap-2">
              {settings.contact.phone && (
                <a href={`tel:${settings.contact.phone.replace(/\s/g, "")}`} className="hidden items-center gap-2 px-2 text-sm font-semibold xl:flex">
                  <Phone className="size-4 text-accent" />
                  {settings.contact.phone}
                </a>
              )}
              <Link href={settings.headerCta.href || "/contact-us"} className="btn btn-accent hidden !py-3 sm:inline-flex">
                {settings.headerCta.label}
                <ArrowUpRight className="size-4" />
              </Link>
              <button onClick={() => setMenu("open")} className="grid size-11 place-items-center rounded-full bg-ink text-white lg:hidden" aria-label="Open menu" aria-expanded={open}>
                <Menu className="size-5" />
              </button>
            </div>
          </div>

          {/* Services mega menu (stays in the page so it can fade out too) */}
          {current && megaMounted && (
            <div
              className={cn(
                "absolute inset-x-0 top-full hidden pt-2 transition-[opacity,transform,visibility] duration-200 ease-out lg:block",
                mega ? "mega-in visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0",
              )}
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
              inert={!mega}
            >
              <div className="grid grid-cols-[280px_1fr_250px] gap-2 rounded-[1.75rem] border border-line bg-white p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,.45)]">
                {/* Main services */}
                <ul className="space-y-0.5 rounded-2xl bg-paper/70 p-2">
                  {services.map((s, i) => (
                    <li key={s.slug}>
                      <Link
                        href={`/${s.slug}`}
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        className={cn("group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors", i === active ? "bg-white shadow-sm" : "hover:bg-white/70")}
                      >
                        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full border transition-colors", i === active ? "border-accent bg-accent text-white" : "border-line bg-white")}>
                          <span className={cn("size-4", ico)}>{s.icon}</span>
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{s.shortTitle || s.title}</span>
                        <ChevronRight className={cn("size-4 shrink-0 transition-all", i === active ? "translate-x-0 text-accent opacity-100" : "-translate-x-1 opacity-0")} />
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Sub-services of the highlighted service */}
                <div className="flex flex-col p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-display text-xl font-bold leading-tight">{current.title}</p>
                      {current.excerpt && <p className="mt-1 line-clamp-2 max-w-md text-sm text-muted">{current.excerpt}</p>}
                    </div>
                    <Link href={`/${current.slug}`} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent">
                      Overview <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                  {current.children.length > 0 ? (
                    <ul key={current.slug} className="mt-4 grid flex-1 grid-cols-2 content-start gap-x-2 gap-y-0.5 border-t border-line pt-3">
                      {current.children.map((c, i) => (
                        <li key={c.slug} className="anim-slide" style={{ animationDelay: `${i * 25}ms` }}>
                          <Link href={`/${current.slug}/${c.slug}`} className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors hover:bg-paper">
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-paper text-ink/70 transition-colors group-hover:bg-accent group-hover:text-white">
                              <span className={cn("size-3.5", ico)}>{c.icon}</span>
                            </span>
                            <span className="min-w-0 flex-1 truncate">{c.title}</span>
                            <ArrowUpRight className="size-3.5 shrink-0 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-4 flex-1 border-t border-line pt-4 text-sm text-muted">See what’s included, our process, results and FAQs on the service page.</div>
                  )}
                  <Link href="/services" className="mt-3 inline-flex items-center gap-1 self-start text-xs font-semibold text-muted hover:text-ink">
                    View all services <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                <a href="#free-audit" className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-ink p-5 text-white">
                  <span className="absolute -right-10 -top-10 size-40 rounded-full bg-accent/60 blur-2xl transition-transform duration-700 group-hover:scale-150" />
                  <span className="relative text-xs uppercase tracking-widest text-white/60">Free SEO audit</span>
                  <span className="relative font-display text-2xl font-bold leading-tight">
                    An expert review in your inbox in <span className="text-lime">24 hours</span>
                  </span>
                  <span className="relative inline-flex items-center gap-1 text-sm font-semibold">
                    Request audit <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      {menu !== "closed" && (
        <div
          className={cn("fixed inset-0 z-[60] flex flex-col overflow-y-auto overscroll-contain bg-ink text-white lg:hidden", menu === "closing" ? "menu-out" : "menu-in")}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex items-center justify-between px-4 py-4">
            <Logo src={settings.logoDark || settings.logo} name={settings.siteName} dark />
            <button onClick={closeMenu} className="grid size-11 place-items-center rounded-full bg-white text-ink" aria-label="Close menu" autoFocus>
              <X className="size-5" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 px-4 pb-6">
            <ul className="divide-y divide-white/10">
              {settings.nav.map((item, i) => (
                <li key={item.href} className="anim-slide-in" style={{ animationDelay: `${150 + i * 50}ms` }}>
                  <Link href={item.href} className="flex items-center justify-between py-3 font-display text-3xl font-bold">
                    {item.label}
                    <ArrowUpRight className="size-6 text-accent" />
                  </Link>
                  {isServicesItem(item) && services.length > 0 && (
                    <ul className="space-y-1.5 pb-4">
                      {services.map((s) => {
                        const isOpen = expanded === s.slug;
                        return (
                          <li key={s.slug} className="rounded-2xl bg-white/5">
                            <div className="flex items-center">
                              <Link href={`/${s.slug}`} className="flex min-w-0 flex-1 items-center gap-3 p-2.5 text-[15px] font-medium">
                                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink">
                                  <span className={cn("size-4", ico)}>{s.icon}</span>
                                </span>
                                <span className="truncate">{s.shortTitle || s.title}</span>
                              </Link>
                              {s.children.length > 0 && (
                                <button
                                  onClick={() => setExpanded(isOpen ? null : s.slug)}
                                  aria-expanded={isOpen}
                                  aria-label={`${isOpen ? "Hide" : "Show"} ${s.shortTitle || s.title} services`}
                                  className="mr-1.5 grid size-10 shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/10"
                                >
                                  <ChevronDown className={cn("size-5 transition-transform duration-300", isOpen && "rotate-180")} />
                                </button>
                              )}
                            </div>
                            {s.children.length > 0 && (
                              <div className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")} inert={!isOpen}>
                                <div className="overflow-hidden">
                                  <div className="grid grid-cols-2 gap-1.5 px-2.5 pb-3">
                                    {s.children.map((c) => (
                                      <Link key={c.slug} href={`/${s.slug}/${c.slug}`} className="flex items-center gap-2 rounded-xl bg-white/5 px-2.5 py-2 text-[13px] leading-tight text-white/85">
                                        <span className={cn("size-3.5 shrink-0 text-lime", ico)}>{c.icon}</span>
                                        {c.title}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {!isServicesItem(item) && item.children?.length ? (
                    <div className="grid grid-cols-2 gap-2 pb-4">
                      {item.children.map((c) => (
                        <Link key={c.href} href={c.href} className="rounded-2xl bg-white/5 p-2.5 text-sm leading-tight">{c.label}</Link>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-2">
              <Link href={settings.headerCta.href || "/contact-us"} className="btn btn-accent w-full !py-4">
                {settings.headerCta.label} <ArrowUpRight className="size-4" />
              </Link>
              {settings.contact.whatsapp && (
                <a href={whatsappLink(settings.contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-light w-full !py-4">
                  <span className={cn("size-4", ico)}>{whatsappIcon}</span> Chat on WhatsApp
                </a>
              )}
            </div>
            <div className="mt-6 space-y-1 text-sm text-white/60">
              {settings.contact.email && <p>{settings.contact.email}</p>}
              {settings.contact.phone && <p>{settings.contact.phone}</p>}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
