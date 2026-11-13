import type { SiteSettings } from "./types";

export const defaultSettings: SiteSettings = {
  siteName: "Media Linkers",
  tagline: "Pakistan's No. 1 Digital Marketing Agency",
  logo: "",
  logoDark: "",
  favicon: "",
  accentColor: "#ff5a1f",
  accent2Color: "#d4ff3a",
  contact: {
    phone: "+92 300 0000000",
    email: "info@medialinkers.pk",
    whatsapp: "+923000000000",
    address: "Pakistan",
    city: "Islamabad",
    country: "PK",
    hours: "Mon – Sat, 10:00 – 19:00",
    mapEmbed: "",
  },
  social: { facebook: "", instagram: "", linkedin: "", x: "", youtube: "", tiktok: "" },
  announcement: { enabled: true, text: "Free manual SEO audit — an expert report in your inbox within 24 hours", link: "#free-audit" },
  headerCta: { label: "Free Audit", href: "#free-audit" },
  nav: [
    { label: "Home", href: "/" },
    {
      label: "Services",
      href: "/services",
      children: [],
    },
    { label: "About", href: "/about-us" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact-us" },
  ],
  footer: {
    about:
      "Since 2008, Media Linkers has helped Pakistani and global brands grow traffic, leads and sales with SEO, content, social media, PPC and high-performing websites.",
    columns: [
      {
        title: "Company",
        links: [
          { label: "About Us", href: "/about-us" },
          { label: "Pricing", href: "/pricing" },
          { label: "Case Studies", href: "/case-studies" },
          { label: "Blog", href: "/blog" },
          { label: "FAQs", href: "/faqs" },
          { label: "Contact", href: "/contact-us" },
        ],
      },
      {
        title: "Free Tools",
        links: [
          { label: "Free SEO Audit", href: "#free-audit" },
          { label: "SEO Packages", href: "/seo-packages" },
          { label: "Social Media Packages", href: "/smm-packages" },
          { label: "Request a Proposal", href: "/contact-us" },
        ],
      },
    ],
    copyright: "© {year} Media Linkers. All rights reserved.",
    newsletterTitle: "Growth tips, monthly",
    newsletterText: "SEO, ads and social media insights that actually move numbers. No spam.",
  },
  seo: {
    titleTemplate: "%s | Media Linkers",
    defaultTitle: "Media Linkers — Best Digital Marketing Agency in Pakistan",
    defaultDescription:
      "Media Linkers is Pakistan's No. 1 digital marketing agency with 17+ years of experience in SEO, content marketing, social media, PPC and web development.",
    keywords: "digital marketing agency pakistan, seo services pakistan, social media marketing, ppc advertising, web design pakistan",
    ogImage: "",
    twitterHandle: "",
    allowIndexing: true,
    robotsExtra: "",
    googleVerification: "",
    bingVerification: "",
    llmsTxt: "",
  },
  organization: {
    legalName: "Media Linkers",
    foundingYear: "2008",
    priceRange: "$$",
    latitude: "",
    longitude: "",
    areaServed: "Pakistan, United States, United Kingdom, UAE",
  },
  scripts: { ga4Id: "", gtmId: "", metaPixelId: "", headCode: "", bodyCode: "" },
  smtp: { host: "", port: 587, secure: false, user: "", pass: "", from: "", notifyTo: "" },
  floating: { whatsapp: true, backToTop: true },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepMerge<T>(base: T, over: any): T {
  if (Array.isArray(base)) return (Array.isArray(over) ? over : base) as T;
  if (base && typeof base === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: any = { ...base };
    if (over && typeof over === "object") {
      for (const k of Object.keys(over)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const b = (base as any)[k];
        out[k] = b !== undefined && b !== null && typeof b === "object" && !Array.isArray(b) ? deepMerge(b, over[k]) : over[k] ?? b;
      }
    }
    return out;
  }
  return (over ?? base) as T;
}
