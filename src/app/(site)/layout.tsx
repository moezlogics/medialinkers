import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import FloatingActions from "@/components/site/FloatingActions";
import Analytics from "@/components/site/Analytics";
import JsonLd from "@/components/site/JsonLd";
import { getServices, getSettings } from "@/lib/data";
import { organizationLd } from "@/lib/seo";
import { Icon } from "@/lib/icons";
import { isPreview } from "@/lib/preview";
import PreviewBanner from "@/components/site/PreviewBanner";
import AuditDialog from "@/components/site/AuditDialog";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const preview = await isPreview();
  const links = services.map((s) => ({
    title: s.title,
    shortTitle: s.shortTitle,
    slug: s.slug,
    // Rendered here on the server: the browser never downloads the icon set
    icon: <Icon name={s.icon} className="size-full" />,
    excerpt: s.excerpt,
    children: (s.children || []).map((c) => ({ title: c.title, slug: c.slug, icon: <Icon name={c.icon} className="size-full" /> })),
  }));
  const brand = {
    "--accent": settings.accentColor || "#ff5a1f",
    "--accent-2": settings.accent2Color || "#d4ff3a",
  } as React.CSSProperties;

  return (
    <div style={brand} className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      {preview && <PreviewBanner />}
      <JsonLd data={organizationLd(settings)} />
      <Header
        settings={{ nav: settings.nav, announcement: settings.announcement, logo: settings.logo, logoDark: settings.logoDark, siteName: settings.siteName, headerCta: settings.headerCta, contact: settings.contact }}
        services={links}
        whatsappIcon={<Icon name="whatsapp" className="size-full" />}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} services={services.map((s) => ({ title: s.title, slug: s.slug }))} />
      <FloatingActions whatsapp={settings.contact.whatsapp} showWhatsapp={settings.floating.whatsapp} showTop={settings.floating.backToTop} whatsappIcon={<Icon name="whatsapp" className="size-full" />} />
      <AuditDialog />
      <Analytics settings={settings} />
    </div>
  );
}
