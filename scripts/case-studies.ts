/**
 * Case study content. Numbers come straight from the clients' Google Search Console,
 * Semrush, Business Profile and store dashboards (screenshots in scripts/case-study-images).
 * Used by the seed and by scripts/sync-case-studies.ts (run on every deploy).
 * Trend points trace the shape of each chart; studies without a clear trend have none.
 */
export type CaseStudySeed = {
  slug: string;
  title: string;
  client: string;
  confidential?: boolean;
  website?: string;
  industry: string;
  location: string;
  period: string;
  duration: string;
  /** Service slugs (main or sub-services) */
  services: string[];
  excerpt: string;
  accent: string;
  featured: boolean;
  order: number;
  results: { value: string; label: string; before?: string; after?: string }[];
  trend?: { label: string; points: number[] };
  challenge: string;
  approach: { title: string; text: string; icon: string }[];
  outcome: string;
  /** Data screenshots (file names inside scripts/case-study-images) */
  proofs: { file: string; caption: string }[];
  /** Screenshots of a website we built */
  screens?: { file: string; device: "desktop" | "mobile"; caption: string }[];
  /** Card / share image (file name), e.g. the desktop screenshot of a website we built */
  cover?: string;
  seo: { metaTitle: string; metaDescription: string };
};

export const CASE_STUDIES_BASE: CaseStudySeed[] = [
  {
    slug: "propertydealer-pk",
    title: "PropertyDealer.pk: from a brand-new website to 64K+ organic clicks",
    client: "PropertyDealer.pk",
    website: "https://propertydealer.pk",
    industry: "Real estate",
    location: "Pakistan",
    period: "Jan – Nov 2026",
    duration: "10 months",
    services: ["web-design-and-development-services-pakistan", "custom-web-design", "seo-services", "technical-seo", "ai-seo", "social-media-marketing", "seo-content-writing-service-pakistan"],
    excerpt:
      "We designed and built PropertyDealer.pk, then grew it with SEO, AI search optimisation (AEO & GEO), content and social media — from zero to 450+ visitors a day from Google and 5.8 million search impressions in 10 months.",
    accent: "#86efac",
    featured: true,
    order: 1,
    results: [
      { value: "64.1K", label: "organic clicks from Google in 10 months", before: "0", after: "64.1K" },
      { value: "5.81M", label: "search impressions", before: "0", after: "5.81M" },
      { value: "450+", label: "visitors a day from Google search", before: "0", after: "450" },
      { value: "6.9", label: "average position in Google" },
    ],
    trend: {
      label: "Daily organic clicks · Google Search Console",
      points: [0, 0, 1, 1, 2, 3, 5, 8, 14, 24, 38, 60, 95, 150, 230, 330, 390, 360, 385, 400, 410, 430, 460, 440, 450, 470, 440, 455, 445, 470],
    },
    challenge:
      "PropertyDealer.pk set out to compete with Pakistan’s biggest property portals as a brand-new domain — no traffic, no backlinks and no brand awareness. It needed a fast, search-friendly marketplace and a way to reach buyers, sellers and dealers in dozens of cities at the same time.",
    approach: [
      { title: "Built a fast, SEO-first marketplace", text: "A modern website with clean URLs, listing schema and pages that load instantly on mobile data.", icon: "code" },
      { title: "Pages for every city and society", text: "Scalable landing pages for 40+ cities, housing societies and property types, each matched to real search demand.", icon: "map-pin" },
      { title: "Content people search for daily", text: "Daily construction-rate updates, area unit tools and property guides that earn repeat visits and links.", icon: "pen" },
      { title: "Technical SEO for thousands of listings", text: "XML sitemaps, internal linking and crawl control so new listings get indexed within days.", icon: "settings" },
      { title: "AI search visibility (AEO & GEO)", text: "Answer-first guides, FAQ and listing schema, and brand mentions on trusted property sites so PropertyDealer.pk gets cited when people ask Google AI Overviews, ChatGPT or Perplexity about buying and renting in Pakistan.", icon: "bot" },
      { title: "Social media that brings people back", text: "Managed social channels and a WhatsApp channel that keep buyers and dealers coming back every day.", icon: "megaphone" },
      { title: "Monthly reporting and iteration", text: "Search Console and analytics reviews every month to double down on the pages that win.", icon: "line-chart" },
    ],
    outcome: "In 10 months PropertyDealer.pk grew from a new domain to 64,100 organic clicks and 5.81 million impressions — and now gets 450+ visitors a day from Google alone.",
    proofs: [{ file: "Screenshot 2026-11-12 174903.png", caption: "Google Search Console, Jan – Nov 2026: 64.1K clicks, 5.81M impressions, average position 6.9" }],
    screens: [
      { file: "propertydealer-site-desktop.webp", device: "desktop", caption: "Home page: city, area, type, price and size search in one place" },
      { file: "propertydealer-site-phone.webp", device: "mobile", caption: "Mobile: app-style bottom navigation and a quick “Add property” button" },
    ],
    cover: "propertydealer-site-desktop.webp",
    seo: {
      metaTitle: "PropertyDealer.pk Case Study: 0 to 64K Organic Clicks in 10 Months",
      metaDescription: "How Media Linkers built PropertyDealer.pk and grew it with SEO, content and social media to 64.1K organic clicks and 5.81M Google impressions in 10 months.",
    },
  },
  {
    slug: "nexus-expert-research",
    title: "Nexus Expert Research: 4.5× more organic clicks for a global B2B expert network",
    client: "Nexus Expert Research",
    website: "https://nexusexpertresearch.co",
    industry: "B2B research",
    location: "Global",
    period: "Aug – Nov 2026",
    duration: "3 months, year over year",
    services: ["seo-services", "ai-seo", "technical-seo", "international-seo", "seo-content-writing-service-pakistan", "blog-writing"],
    excerpt:
      "Nexus connects companies with hand-picked industry experts. Our SEO and AI visibility (AEO & GEO) work grew its organic clicks by 355% and search impressions almost 12× compared with the same period last year.",
    accent: "#a5b4fc",
    featured: true,
    order: 2,
    results: [
      { value: "+355%", label: "organic clicks vs. the same period last year", before: "1.08K", after: "4.91K" },
      { value: "11.9×", label: "more search impressions", before: "102K", after: "1.21M" },
      { value: "13.7", label: "average position, up from 18.8" },
      { value: "4.91K", label: "organic clicks in 3 months" },
    ],
    trend: {
      label: "Daily organic clicks · last 3 months",
      points: [38, 44, 40, 47, 52, 45, 58, 50, 61, 55, 49, 63, 58, 70, 52, 66, 72, 60, 75, 64, 80, 70, 62, 84, 76, 90, 72, 86],
    },
    challenge:
      "Nexus serves a niche, high-value B2B market: research firms, consultants and AI teams looking for expert calls, surveys and training data. Buyers search with very specific intent, but the site sat on page two for most of its key terms and missed the people actively looking for an expert network.",
    approach: [
      { title: "Intent-led keyword map", text: "Mapped searches around methodologies, use cases and client types — from expert calls to AI training data.", icon: "search" },
      { title: "Topic clusters that convert", text: "Service, methodology and client-type pages linked into clusters, backed by in-depth guides and client stories.", icon: "layers" },
      { title: "Technical clean-up", text: "Faster pages, structured data, fixed indexing gaps and a stronger internal-link structure.", icon: "settings" },
      { title: "International targeting", text: "Content and signals tuned for the US, UK and Asian markets where buyers are.", icon: "globe" },
      { title: "AI visibility: AEO, GEO & AI mentions", text: "Clear, citable answers about expert networks, entity and FAQ schema, and mentions on trusted B2B and research sites — so AI assistants like ChatGPT, Perplexity and Google AI Overviews know and recommend Nexus.", icon: "bot" },
      { title: "Authority building", text: "Relevant B2B mentions and links that lifted the whole domain, not just a few pages.", icon: "link" },
    ],
    outcome: "Year over year, Nexus now earns 4.5× the organic clicks and almost 12× the impressions, with its average position climbing from 18.8 to 13.7.",
    proofs: [{ file: "WhatsApp Image 2026-11-12 at 11.58.01 AM.jpeg", caption: "Google Search Console — last 3 months (solid) vs. the same period last year (dashed)" }],
    seo: {
      metaTitle: "Nexus Expert Research SEO Case Study: +355% Organic Clicks",
      metaDescription: "B2B SEO case study: how Media Linkers grew Nexus Expert Research’s organic clicks by 355% and impressions 11.9× year over year.",
    },
  },
  {
    slug: "stexol-chemicals",
    title: "Stexol Chemicals: 7.7× more organic clicks for a cosmetic raw-material supplier",
    client: "Stexol Chemicals",
    website: "https://stexolchemicals.com",
    industry: "Chemicals & B2B e-commerce",
    location: "Pakistan",
    period: "May – Nov 2026",
    duration: "6 months vs. previous 6",
    services: ["seo-services", "ecommerce-seo", "ai-seo", "on-page-seo", "product-description-writing"],
    excerpt:
      "Stexol supplies cosmetic and personal-care raw materials across Pakistan. Product-level SEO took it from 301 to 2,320 organic clicks and grew impressions 23× in six months.",
    accent: "#5eead4",
    featured: true,
    order: 3,
    results: [
      { value: "7.7×", label: "organic clicks vs. the previous 6 months", before: "301", after: "2.32K" },
      { value: "23×", label: "more search impressions", before: "5.4K", after: "125K" },
      { value: "2.32K", label: "organic clicks in 6 months" },
      { value: "9.5", label: "average position while impressions grew 23×" },
    ],
    trend: {
      label: "Daily organic clicks · last 6 months",
      points: [2, 4, 3, 6, 5, 8, 7, 10, 9, 12, 8, 14, 11, 16, 13, 15, 18, 12, 17, 20, 14, 19, 16, 21, 15, 18, 22, 17],
    },
    challenge:
      "Stexol sells carbomer, glycerin, SLES and dozens of other ingredients to brands and manufacturers. Buyers search by exact chemical names and grades — often with “price in Pakistan” — but Stexol’s product pages weren’t showing up, so most orders depended on word of mouth.",
    approach: [
      { title: "Product-level keyword mapping", text: "Every ingredient matched to how buyers search: chemical names, grades, uses and price queries.", icon: "search" },
      { title: "Product pages that rank and sell", text: "Rewritten titles, specs, uses and FAQs with Product schema so listings stand out in results.", icon: "file" },
      { title: "Category and formulation guides", text: "Helpful content for shampoo, skincare and soap makers that links into the right products.", icon: "pen" },
      { title: "AI answers for ingredient questions", text: "Ingredient pages written as clear answers (uses, grades, dosage, price) with Product and FAQ schema, so AI search tools can quote Stexol when buyers ask what to use and where to buy it in Pakistan.", icon: "bot" },
      { title: "Technical SEO foundations", text: "Indexing fixes, speed improvements and clean internal linking across the catalogue.", icon: "settings" },
    ],
    outcome: "In six months Stexol went from 301 to 2,320 organic clicks, with 23× more impressions — turning Google into a steady source of B2B enquiries and orders.",
    proofs: [{ file: "WhatsApp Image 2026-11-12 at 11.59.16 AM.jpeg", caption: "Google Search Console — last 6 months (solid) vs. the previous 6 months (dashed)" }],
    seo: {
      metaTitle: "Stexol Chemicals SEO Case Study: 7.7× Organic Clicks in 6 Months",
      metaDescription: "E-commerce SEO case study: how Media Linkers grew Stexol Chemicals’ organic clicks 7.7× and impressions 23× in six months.",
    },
  },
  {
    slug: "online-grocery-store-seo",
    title: "Online grocery store: from zero to 5.5K organic clicks — and daily orders",
    client: "Online grocery store",
    confidential: true,
    industry: "E-commerce · Grocery",
    location: "Pakistan",
    period: "May – Nov 2026",
    duration: "6 months",
    services: ["seo-services", "ecommerce-seo", "technical-seo", "local-seo"],
    excerpt:
      "A new Pakistani grocery store with a fresh domain. Six months of e-commerce SEO brought 5,550 organic clicks, 511K impressions — and orders every day, peaking at 32 in a single day.",
    accent: "#fdba74",
    featured: false,
    order: 4,
    results: [
      { value: "5.55K", label: "organic clicks in 6 months, from zero", before: "0", after: "5.55K" },
      { value: "511K", label: "search impressions", before: "0", after: "511K" },
      { value: "5.3", label: "average position in Google" },
      { value: "32", label: "orders on the best day of the last month" },
    ],
    trend: {
      label: "Daily organic clicks · Google Search Console",
      points: [0, 0, 1, 0, 1, 2, 5, 7, 9, 12, 10, 14, 17, 22, 26, 30, 36, 42, 40, 46, 52, 44, 48, 58, 62, 56, 60, 66, 70, 74],
    },
    challenge:
      "A new online grocery store entering a market dominated by big apps and marketplaces. With a fresh domain and hundreds of products, it needed to be found for everyday grocery searches — and turn that traffic into real orders.",
    approach: [
      { title: "Category and product SEO", text: "Categories and products optimised for the everyday terms shoppers type, brand by brand.", icon: "ecommerce" },
      { title: "Delivery-area targeting", text: "Local signals and landing pages for the areas the store delivers to.", icon: "map-pin" },
      { title: "Rich results for products", text: "Product schema with price and availability so listings stand out in Google.", icon: "star" },
      { title: "A crawlable catalogue", text: "Canonical tags, filters and sitemaps tuned so Google indexes the right pages quickly.", icon: "settings" },
    ],
    outcome: "Organic search now brings a steady flow of shoppers — and with them, orders every day, with 32 orders on the best day of the last month.",
    proofs: [
      { file: "Screenshot 2026-11-12 172034.png", caption: "Google Search Console — May to Nov 2026: 5.55K clicks, 511K impressions, average position 5.3" },
      { file: "Screenshot 2026-11-12 172453.png", caption: "Store dashboard — orders over the last 30 days (peak: 32 orders on 3 Nov)" },
    ],
    seo: {
      metaTitle: "Grocery E-commerce SEO Case Study: 0 to 5.5K Clicks & Daily Orders",
      metaDescription: "How Media Linkers took a new Pakistani online grocery store from zero to 5.55K organic clicks, 511K impressions and daily orders in six months.",
    },
  },
  {
    slug: "tech-ecommerce-store-seo",
    title: "Tech e-commerce store: 16× more organic clicks a day in 3 months",
    client: "Tech & electronics store",
    confidential: true,
    industry: "E-commerce · Electronics",
    location: "Pakistan",
    period: "Aug – Nov 2026",
    duration: "3 months",
    services: ["seo-services", "ecommerce-seo", "on-page-seo", "product-description-writing"],
    excerpt:
      "A Pakistani electronics store stuck at about 20 organic clicks a day. Three months later it gets 330 a day — 7,400 clicks and 899K impressions in total.",
    accent: "#93c5fd",
    featured: false,
    order: 5,
    results: [
      { value: "16×", label: "organic clicks per day (≈20 → 330)", before: "20", after: "330" },
      { value: "7.4K", label: "organic clicks in 3 months" },
      { value: "899K", label: "search impressions" },
      { value: "6.1", label: "average position in Google" },
    ],
    trend: {
      label: "Daily organic clicks · Google Search Console",
      points: [5, 20, 30, 32, 30, 28, 35, 38, 30, 26, 28, 24, 22, 28, 30, 26, 32, 35, 45, 52, 48, 55, 60, 150, 190, 160, 185, 200, 250, 290, 270, 330],
    },
    challenge:
      "The store competes with large marketplaces for high-intent searches like product models, specs and prices. Traffic had been flat at around 20 organic clicks a day, and most product pages never reached page one.",
    approach: [
      { title: "Model-level keyword targeting", text: "Product pages aligned with model names, “price in Pakistan” and spec searches.", icon: "search" },
      { title: "Product and category optimisation", text: "Unique descriptions, spec tables and FAQs instead of copied manufacturer text.", icon: "file" },
      { title: "Product schema", text: "Price, stock and review markup so listings earn rich results.", icon: "star" },
      { title: "Technical clean-up", text: "Duplicate variants consolidated, indexing fixed and pages made faster.", icon: "wrench" },
    ],
    outcome: "Within three months daily organic clicks grew from about 20 to 330 — 7,400 clicks and 899K impressions with an average position of 6.1.",
    proofs: [{ file: "Screenshot 2026-11-12 172156.png", caption: "Google Search Console — Aug to Nov 2026: 7.4K clicks, 899K impressions, average position 6.1" }],
    seo: {
      metaTitle: "Electronics E-commerce SEO Case Study: 16× Daily Organic Clicks",
      metaDescription: "How Media Linkers grew a Pakistani tech store from about 20 to 330 organic clicks a day — 7.4K clicks and 899K impressions in three months.",
    },
  },
];

import { MORE_CASE_STUDIES } from "./case-studies-more";
export const CASE_STUDIES: CaseStudySeed[] = [...CASE_STUDIES_BASE, ...MORE_CASE_STUDIES];
