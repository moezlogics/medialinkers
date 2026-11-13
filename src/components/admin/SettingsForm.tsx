"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { api, Button, Card, Field, Input, PageHeader, Switch, Tabs } from "./ui";
import { FieldGrid } from "./fields";
import { ImageField } from "./MediaLibrary";
import { useSaveShortcut } from "./useSaveShortcut";
import type { Field as FieldDef } from "@/lib/sections";
import type { SiteSettings } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const LINK_FIELDS: FieldDef[] = [
  { name: "label", label: "Label", type: "text" },
  { name: "href", label: "Link", type: "text", placeholder: "/page or https://…" },
];

const NAV_FIELDS: FieldDef[] = [...LINK_FIELDS, { name: "children", label: "Dropdown links (optional)", type: "list", itemLabel: "Link", fields: LINK_FIELDS }];

export const SEO_TABS = ["seo", "robots", "organization"];

export default function SettingsForm({ mode = "settings" }: { mode?: "settings" | "seo" }) {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(mode === "seo" ? "seo" : "general");

  useEffect(() => {
    api<{ settings: SiteSettings }>("/api/admin/settings").then((j) => {
      setS(j.settings);
      setSaved(JSON.stringify(j.settings));
    }).catch(() => {});
  }, []);

  const dirty = !!s && JSON.stringify(s) !== saved;
  const save = useCallback(async () => {
    if (!s) return;
    setSaving(true);
    try {
      const j = await api<{ settings: SiteSettings }>("/api/admin/settings", { method: "PUT", body: s });
      setS(j.settings);
      setSaved(JSON.stringify(j.settings));
      toast.success("Settings saved — live on the site");
    } catch {
    } finally {
      setSaving(false);
    }
  }, [s]);
  useSaveShortcut(save, dirty);

  if (!s) return <div className="grid h-64 place-items-center text-ink/40"><Loader2 className="size-6 animate-spin" /></div>;

  const set = (k: keyof SiteSettings, v: any) => setS({ ...s, [k]: v });
  const sub = (k: keyof SiteSettings) => ({ data: s[k] as any, onChange: (v: any) => set(k, v) });

  const tabs =
    mode === "seo"
      ? [{ id: "seo", label: "Global SEO" }, { id: "robots", label: "Robots & AI" }, { id: "organization", label: "Business schema" }]
      : [
          { id: "general", label: "Brand" },
          { id: "contact", label: "Contact & social" },
          { id: "header", label: "Header & menu" },
          { id: "footer", label: "Footer" },
          { id: "tracking", label: "Tracking & scripts" },
          { id: "email", label: "Email alerts" },
        ];

  return (
    <div>
      <PageHeader
        title={mode === "seo" ? "SEO settings" : "Settings"}
        description={mode === "seo" ? "Site-wide meta defaults, indexing, verification and structured data." : "Brand, contact details, navigation, tracking codes and integrations."}
        actions={
          <>
            {dirty && <span className="text-xs font-semibold text-amber-600">Unsaved changes</span>}
            <Button onClick={save} loading={saving}><Save className="size-4" /> Save settings</Button>
          </>
        }
      />
      <div className="mb-4"><Tabs tabs={tabs} active={tab} onChange={setTab} /></div>

      {tab === "general" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Brand">
            <div className="grid gap-4">
              <Field label="Site name"><Input value={s.siteName} onChange={(e) => set("siteName", e.target.value)} /></Field>
              <Field label="Tagline"><Input value={s.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Main brand colour">
                  <div className="flex gap-2"><input type="color" value={s.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="h-10 w-12 rounded-lg border border-line" aria-label="Main colour" /><Input value={s.accentColor} onChange={(e) => set("accentColor", e.target.value)} /></div>
                </Field>
                <Field label="Highlight colour">
                  <div className="flex gap-2"><input type="color" value={s.accent2Color} onChange={(e) => set("accent2Color", e.target.value)} className="h-10 w-12 rounded-lg border border-line" aria-label="Highlight colour" /><Input value={s.accent2Color} onChange={(e) => set("accent2Color", e.target.value)} /></div>
                </Field>
              </div>
            </div>
          </Card>
          <Card title="Logos & icon">
            <div className="grid gap-4">
              <ImageField label="Logo (light background)" help="Leave empty to use the built-in text logo." value={s.logo} onChange={(v) => set("logo", v)} />
              <ImageField label="Logo (dark background)" value={s.logoDark} onChange={(v) => set("logoDark", v)} />
              <ImageField label="Favicon / app icon" help="Square PNG or SVG, at least 512×512." value={s.favicon} onChange={(v) => set("favicon", v)} />
            </div>
          </Card>
          <Card title="Floating buttons" className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <Switch checked={s.floating.whatsapp} onChange={(v) => set("floating", { ...s.floating, whatsapp: v })} label="WhatsApp chat button" help="Uses the WhatsApp number from Contact." />
              <Switch checked={s.floating.backToTop} onChange={(v) => set("floating", { ...s.floating, backToTop: v })} label="Back to top button" />
            </div>
          </Card>
        </div>
      )}

      {tab === "contact" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Contact details" description="Used in the header, footer, contact page and business schema.">
            <FieldGrid
              {...sub("contact")}
              fields={[
                { name: "phone", label: "Phone", type: "text" },
                { name: "whatsapp", label: "WhatsApp number", type: "text", help: "With country code, e.g. +923001234567" },
                { name: "email", label: "Email", type: "text" },
                { name: "hours", label: "Business hours", type: "text" },
                { name: "address", label: "Street address", type: "text" },
                { name: "city", label: "City", type: "text" },
                { name: "country", label: "Country code", type: "text", help: "e.g. PK" },
                { name: "mapEmbed", label: "Google Maps embed code", type: "textarea", help: "Google Maps → Share → Embed a map → copy HTML." },
              ]}
            />
          </Card>
          <Card title="Social profiles" description="Shown in the footer and added to your Organization schema (sameAs).">
            <FieldGrid
              {...sub("social")}
              fields={(["facebook", "instagram", "linkedin", "x", "youtube", "tiktok"] as const).map((k) => ({ name: k, label: k === "x" ? "X / Twitter" : k[0].toUpperCase() + k.slice(1), type: "url" as const, placeholder: "https://" }))}
            />
          </Card>
        </div>
      )}

      {tab === "header" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Menu" description="The “Services” item automatically shows your services and sub-services as a mega menu." className="lg:col-span-2">
            <FieldGrid data={{ nav: s.nav }} onChange={(v) => set("nav", v.nav)} fields={[{ name: "nav", label: "Menu items", type: "list", itemLabel: "Menu item", fields: NAV_FIELDS }]} />
          </Card>
          <Card title="Header button">
            <FieldGrid {...sub("headerCta")} fields={LINK_FIELDS} />
          </Card>
          <Card title="Announcement bar">
            <div className="space-y-4">
              <Switch checked={s.announcement.enabled} onChange={(v) => set("announcement", { ...s.announcement, enabled: v })} label="Show announcement bar" />
              <FieldGrid {...sub("announcement")} fields={[{ name: "text", label: "Text", type: "text", full: true }, { name: "link", label: "Link (optional)", type: "text", full: true }]} />
            </div>
          </Card>
        </div>
      )}

      {tab === "footer" && (
        <Card>
          <FieldGrid
            {...sub("footer")}
            fields={[
              { name: "about", label: "About text", type: "textarea" },
              { name: "newsletterTitle", label: "Newsletter heading", type: "text" },
              { name: "newsletterText", label: "Newsletter text", type: "text" },
              { name: "copyright", label: "Copyright line", type: "text", help: "{year} is replaced with the current year.", full: true },
              { name: "columns", label: "Link columns", type: "list", itemLabel: "Column", fields: [{ name: "title", label: "Column title", type: "text", full: true }, { name: "links", label: "Links", type: "list", itemLabel: "Link", fields: LINK_FIELDS }] },
            ]}
          />
        </Card>
      )}

      {tab === "tracking" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Analytics & pixels" description="Paste only the ID — the code is added for you on every page.">
            <FieldGrid
              {...sub("scripts")}
              fields={[
                { name: "ga4Id", label: "Google Analytics 4 ID", type: "text", placeholder: "G-XXXXXXXXXX" },
                { name: "gtmId", label: "Google Tag Manager ID", type: "text", placeholder: "GTM-XXXXXXX" },
                { name: "metaPixelId", label: "Meta (Facebook) Pixel ID", type: "text", placeholder: "1234567890" },
              ]}
            />
          </Card>
          <Card title="Custom code" description="For other tools (chat widgets, heatmaps…). Only paste code from sources you trust.">
            <FieldGrid
              {...sub("scripts")}
              fields={[
                { name: "headCode", label: "Code in <head>", type: "textarea" },
                { name: "bodyCode", label: "Code before </body>", type: "textarea" },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === "email" && (
        <Card title="Email alerts & confirmations" description="Get an email for every form submission and audit request. Visitors who request a free audit also get an automatic “we’re on it — report within 24 hours” email. Works with Gmail (app password), Zoho, Outlook or any SMTP server.">
          <FieldGrid
            {...sub("smtp")}
            fields={[
              { name: "notifyTo", label: "Send alerts to", type: "text", placeholder: "you@medialinkers.pk" },
              { name: "from", label: "From address", type: "text", placeholder: "Media Linkers <no-reply@medialinkers.pk>" },
              { name: "host", label: "SMTP host", type: "text", placeholder: "smtp.gmail.com" },
              { name: "port", label: "Port", type: "number" },
              { name: "user", label: "SMTP username", type: "text" },
              { name: "pass", label: "SMTP password", type: "text", help: "Stored securely and never shown again after saving." },
              { name: "secure", label: "Use SSL (port 465)", type: "toggle" },
            ]}
          />
        </Card>
      )}

      {tab === "seo" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Default meta tags" description="Used on any page that has no custom SEO set." className="lg:col-span-2">
            <FieldGrid
              {...sub("seo")}
              fields={[
                { name: "defaultTitle", label: "Home / default title", type: "text", full: true },
                { name: "titleTemplate", label: "Title template", type: "text", help: "%s is replaced by the page title, e.g. %s | Media Linkers" },
                { name: "twitterHandle", label: "X / Twitter handle", type: "text", placeholder: "@medialinkers" },
                { name: "defaultDescription", label: "Default meta description", type: "textarea" },
                { name: "keywords", label: "Default keywords", type: "textarea" },
                { name: "ogImage", label: "Default social share image (1200×630)", type: "image", help: "Leave empty to auto-generate branded images per page." },
              ]}
            />
          </Card>
          <Card title="Search engine verification" className="lg:col-span-2">
            <FieldGrid
              {...sub("seo")}
              fields={[
                { name: "googleVerification", label: "Google Search Console code", type: "text", help: "Only the content value of the google-site-verification meta tag." },
                { name: "bingVerification", label: "Bing Webmaster code", type: "text", help: "Only the content value of the msvalidate.01 meta tag." },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === "robots" && (
        <div className="grid gap-4">
          <Card title="Indexing">
            <Switch checked={s.seo.allowIndexing} onChange={(v) => set("seo", { ...s.seo, allowIndexing: v })} label="Allow search engines to index this website" help="Turn off only on a staging/test copy of the site." />
            {!s.seo.allowIndexing && (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700"><AlertTriangle className="size-4" /> The whole website is hidden from Google while this is off.</p>
            )}
          </Card>
          <Card title="robots.txt extra rules" description="One rule per line, e.g. Disallow: /thank-you. The sitemap and API rules are added automatically.">
            <FieldGrid {...sub("seo")} fields={[{ name: "robotsExtra", label: "Extra Disallow lines", type: "textarea" }]} />
            <a href="/robots.txt" target="_blank" className="mt-2 inline-block text-sm font-semibold text-accent">View robots.txt →</a>
          </Card>
          <Card title="llms.txt (AI search)" description="A plain summary of your site for AI assistants like ChatGPT and Perplexity. Leave empty to generate it automatically from your services and posts.">
            <FieldGrid {...sub("seo")} fields={[{ name: "llmsTxt", label: "Custom llms.txt", type: "textarea" }]} />
            <a href="/llms.txt" target="_blank" className="mt-2 inline-block text-sm font-semibold text-accent">View llms.txt →</a>
          </Card>
        </div>
      )}

      {tab === "organization" && (
        <Card title="Business details for Google" description="Added to every page as Organization / ProfessionalService structured data, which helps with your Knowledge Panel and local results.">
          <FieldGrid
            {...sub("organization")}
            fields={[
              { name: "legalName", label: "Legal business name", type: "text" },
              { name: "foundingYear", label: "Founded (year)", type: "text" },
              { name: "priceRange", label: "Price range", type: "text", placeholder: "$$" },
              { name: "areaServed", label: "Areas served", type: "text", help: "Comma separated, e.g. Pakistan, UAE, UK" },
              { name: "latitude", label: "Latitude (optional)", type: "text" },
              { name: "longitude", label: "Longitude (optional)", type: "text" },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
