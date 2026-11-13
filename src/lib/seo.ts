import type { Metadata } from "next";
import type { Faq, PostDoc, ProjectDoc, Seo, ServiceDoc, SiteSettings } from "./types";
import { absUrl, plainHighlight, SITE_URL, stripHtml, truncate } from "./utils";

type MetaInput = {
  seo?: Seo;
  title: string;
  description?: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
};

/** Default social image: generated on the fly from the page title. */
export function ogFallback(title: string) {
  return `/og?title=${encodeURIComponent(plainHighlight(title).slice(0, 90))}`;
}

export function buildMetadata(settings: SiteSettings, input: MetaInput): Metadata {
  const seo = input.seo ?? {};
  const rawTitle = seo.metaTitle || plainHighlight(input.title);
  const description = truncate(seo.metaDescription || input.description || settings.seo.defaultDescription, 170);
  const canonical = seo.canonical || absUrl(input.path);
  const image = seo.ogImage || input.image || settings.seo.ogImage || ogFallback(rawTitle);
  const index = settings.seo.allowIndexing && !seo.noindex && !input.noindex;
  const follow = settings.seo.allowIndexing && !seo.nofollow;
  // A custom meta title is used as-is; otherwise the site title template is applied by the root layout.
  const title = seo.metaTitle ? { absolute: seo.metaTitle } : rawTitle;

  return {
    title,
    description,
    keywords: seo.keywords || seo.focusKeyword || undefined,
    alternates: { canonical },
    robots: {
      index,
      follow,
      googleBot: { index, follow, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: {
      type: input.type ?? "website",
      url: canonical,
      siteName: settings.siteName,
      title: seo.ogTitle || rawTitle,
      description: seo.ogDescription || description,
      images: [{ url: image, width: 1200, height: 630, alt: seo.ogTitle || rawTitle }],
      locale: "en_PK",
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle || rawTitle,
      description: seo.ogDescription || description,
      images: [image],
      ...(settings.seo.twitterHandle ? { site: settings.seo.twitterHandle, creator: settings.seo.twitterHandle } : {}),
    },
  };
}

/* ---------------- JSON-LD builders ---------------- */

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export function organizationLd(s: SiteSettings) {
  const sameAs = Object.values(s.social).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": ORG_ID,
        name: s.siteName,
        legalName: s.organization.legalName || s.siteName,
        url: SITE_URL,
        logo: s.logo ? absUrl(s.logo) : absUrl("/icon.svg"),
        image: s.seo.ogImage ? absUrl(s.seo.ogImage) : absUrl(ogFallback(s.siteName)),
        description: s.seo.defaultDescription,
        foundingDate: s.organization.foundingYear || undefined,
        priceRange: s.organization.priceRange || undefined,
        email: s.contact.email || undefined,
        telephone: s.contact.phone || undefined,
        address: {
          "@type": "PostalAddress",
          streetAddress: s.contact.address || undefined,
          addressLocality: s.contact.city || undefined,
          addressCountry: s.contact.country || "PK",
        },
        ...(s.organization.latitude && s.organization.longitude
          ? { geo: { "@type": "GeoCoordinates", latitude: s.organization.latitude, longitude: s.organization.longitude } }
          : {}),
        areaServed: s.organization.areaServed ? s.organization.areaServed.split(",").map((a) => a.trim()) : undefined,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            telephone: s.contact.phone || undefined,
            email: s.contact.email || undefined,
            availableLanguage: ["English", "Urdu"],
          },
        ],
        sameAs: sameAs.length ? sameAs : undefined,
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: SITE_URL,
        name: s.siteName,
        description: s.tagline,
        publisher: { "@id": ORG_ID },
        inLanguage: "en",
      },
    ],
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absUrl(c.path) })),
  };
}

export function webPageLd(opts: { type?: string; name: string; description?: string; path: string; image?: string; dateModified?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": opts.type || "WebPage",
    "@id": absUrl(opts.path) + "#webpage",
    url: absUrl(opts.path),
    name: plainHighlight(opts.name),
    description: opts.description,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    inLanguage: "en",
    ...(opts.image ? { primaryImageOfPage: absUrl(opts.image) } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
  };
}

export function faqLd(faqs: Faq[]) {
  const list = faqs.filter((f) => f.q && f.a);
  if (!list.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: stripHtml(f.a) } })),
  };
}

function priceNumber(p?: string) {
  const n = parseFloat(String(p ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function currencyCode(c?: string) {
  const v = (c || "").trim().toLowerCase();
  if (v.startsWith("rs") || v === "pkr" || v === "₨") return "PKR";
  if (v === "£" || v === "gbp") return "GBP";
  if (v === "€" || v === "eur") return "EUR";
  if (v === "aed") return "AED";
  return "USD";
}

export function serviceLd(s: ServiceDoc, settings: SiteSettings, opts: { path: string; parent?: ServiceDoc | null } = { path: `/${s.slug}` }) {
  const { path, parent } = opts;
  // Sub-service pages are the best catalogue entries; otherwise fall back to the "what's included" list
  const catalogue = s.children?.length
    ? s.children.map((c) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: c.title, description: c.excerpt, url: absUrl(`${path}/${c.slug}`) } }))
    : (s.features || []).map((f) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: f.title, description: f.text } }));
  const packages = s.packages?.length ? s.packages : parent?.packages || [];
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absUrl(path) + "#service",
    name: s.title,
    serviceType: s.title,
    ...(parent ? { category: parent.title } : {}),
    description: s.seo?.metaDescription || s.excerpt || stripHtml(s.heroText),
    url: absUrl(path),
    provider: { "@id": ORG_ID },
    areaServed: settings.organization.areaServed ? settings.organization.areaServed.split(",").map((a) => a.trim()) : "Pakistan",
    ...(catalogue.length ? { hasOfferCatalog: { "@type": "OfferCatalog", name: s.featuresTitle ? plainHighlight(s.featuresTitle) : s.title, itemListElement: catalogue } } : {}),
    ...(packages.length
      ? {
          offers: packages
            .filter((p) => priceNumber(p.price) !== undefined)
            .map((p) => ({
              "@type": "Offer",
              name: p.name,
              price: priceNumber(p.price),
              priceCurrency: currencyCode(p.currency),
              description: p.perfectFor,
              url: absUrl(path) + "#packages",
              availability: "https://schema.org/InStock",
            })),
        }
      : {}),
  };
}

export function articleLd(p: PostDoc, settings: SiteSettings) {
  const path = `/blog/${p.slug}`;
  const image = p.seo?.ogImage || p.coverImage || ogFallback(p.title);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": absUrl(path) + "#article",
    mainEntityOfPage: { "@type": "WebPage", "@id": absUrl(path) },
    headline: truncate(p.seo?.metaTitle || p.title, 110),
    description: p.seo?.metaDescription || p.excerpt,
    image: [absUrl(image)],
    datePublished: p.publishedAt,
    dateModified: p.updatedAt || p.publishedAt,
    author: { "@type": "Person", name: p.author?.name || p.authorName || settings.siteName },
    publisher: { "@id": ORG_ID },
    articleSection: p.category?.name,
    keywords: p.tags?.join(", "),
    wordCount: stripHtml(p.content).split(" ").filter(Boolean).length,
    inLanguage: "en",
  };
}

/** Case study as an Article about the client's results, published by the agency. */
export function caseStudyLd(p: ProjectDoc, services: string[]) {
  const path = `/case-studies/${p.slug}`;
  const image = p.seo?.ogImage || p.coverImage || p.proofs?.[0]?.image || ogFallback(p.title);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": absUrl(path) + "#article",
    mainEntityOfPage: { "@type": "WebPage", "@id": absUrl(path) },
    headline: truncate(p.seo?.metaTitle || p.title, 110),
    description: p.seo?.metaDescription || p.excerpt,
    image: [absUrl(image)],
    datePublished: p.createdAt,
    dateModified: p.updatedAt || p.createdAt,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    articleSection: "Case study",
    about: [
      ...(p.confidential || !p.client ? [] : [{ "@type": "Organization", name: p.client, ...(p.website ? { url: p.website } : {}) }]),
      ...services.map((name) => ({ "@type": "Service", name, provider: { "@id": ORG_ID } })),
    ],
    keywords: [p.industry, ...services].filter(Boolean).join(", "),
    inLanguage: "en",
  };
}

export function itemListLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, url: absUrl(it.path), name: it.name })),
  };
}

/** Parse the custom JSON-LD typed by an admin. Invalid JSON is ignored. */
export function customLd(json?: string) {
  if (!json?.trim()) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
