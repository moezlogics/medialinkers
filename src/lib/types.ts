export type Seo = {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
  schemaJson?: string;
};

export type Section = {
  uid: string;
  type: string;
  enabled: boolean;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
};

export type PageDoc = {
  _id: string;
  title: string;
  slug: string;
  system?: boolean;
  status: "published" | "draft";
  schemaType?: string;
  showInSitemap?: boolean;
  sections: Section[];
  seo: Seo;
  updatedAt?: string;
  createdAt?: string;
};

export type Item = { title: string; text?: string; icon?: string };
export type Stat = { value: string; label: string };
export type Faq = { q: string; a: string };

export type ServicePackage = {
  name: string;
  perfectFor?: string;
  oldPrice?: string;
  price: string;
  currency?: string;
  period?: string;
  features: string[];
  goal?: string;
  featured?: boolean;
  ctaLabel?: string;
};

export type ServiceChild = { _id: string; title: string; shortTitle?: string; slug: string; icon: string; excerpt?: string };

export type ServiceDoc = {
  _id: string;
  title: string;
  shortTitle?: string;
  slug: string;
  /** Id of the main service when this is a sub-service */
  parent?: string | null;
  /** Published sub-services (filled by the data layer for main services) */
  children?: ServiceChild[];
  icon: string;
  image?: string;
  color?: string;
  excerpt?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroText?: string;
  ctaLabel?: string;
  whyTitle?: string;
  content?: string;
  highlights?: string[];
  featuresTitle?: string;
  features: Item[];
  process: Item[];
  statsTitle?: string;
  stats: Stat[];
  ctaTitle?: string;
  ctaText?: string;
  packagesTitle?: string;
  packages: ServicePackage[];
  faqs: Faq[];
  order: number;
  showInHero?: boolean;
  status: "published" | "draft";
  seo: Seo;
  updatedAt?: string;
};

export type CategoryDoc = { _id: string; name: string; slug: string; description?: string; seo?: Seo; updatedAt?: string };

export type PostDoc = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  coverAlt?: string;
  category?: CategoryDoc | null;
  tags?: string[];
  author?: { _id: string; name: string; avatar?: string; bio?: string } | null;
  authorName?: string;
  status: "published" | "draft";
  featured?: boolean;
  publishedAt: string;
  readingTime?: number;
  faqs?: Faq[];
  seo: Seo;
  updatedAt?: string;
  createdAt?: string;
};

export type ProjectResult = { value: string; label: string; before?: string; after?: string };
export type ProjectProof = { image: string; caption?: string; width?: number; height?: number };

export type ProjectDoc = {
  _id: string;
  title: string;
  slug: string;
  client?: string;
  confidential?: boolean;
  industry?: string;
  location?: string;
  period?: string;
  duration?: string;
  serviceRefs?: string[];
  /** Free-text service tags (used when no service is linked) */
  services?: string[];
  website?: string;
  excerpt?: string;
  coverImage?: string;
  logo?: string;
  accent?: string;
  results?: ProjectResult[];
  trend?: { label?: string; points?: number[] };
  challenge?: string;
  approach?: Item[];
  content?: string;
  outcome?: string;
  proofs?: ProjectProof[];
  quote?: { text?: string; name?: string; role?: string };
  gallery?: string[];
  featured?: boolean;
  order?: number;
  status: "published" | "draft";
  seo: Seo;
  updatedAt?: string;
  createdAt?: string;
};

export type TestimonialDoc = {
  _id: string;
  name: string;
  role?: string;
  company?: string;
  location?: string;
  quote: string;
  rating?: number;
  avatar?: string;
};

export type NavItem = { label: string; href: string; children?: NavItem[] };

export type SiteSettings = {
  siteName: string;
  tagline: string;
  logo: string;
  logoDark: string;
  favicon: string;
  accentColor: string;
  accent2Color: string;
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
    city: string;
    country: string;
    hours: string;
    mapEmbed: string;
  };
  social: { facebook: string; instagram: string; linkedin: string; x: string; youtube: string; tiktok: string };
  announcement: { enabled: boolean; text: string; link: string };
  headerCta: { label: string; href: string };
  nav: NavItem[];
  footer: {
    about: string;
    columns: { title: string; links: NavItem[] }[];
    copyright: string;
    newsletterTitle: string;
    newsletterText: string;
  };
  seo: {
    titleTemplate: string;
    defaultTitle: string;
    defaultDescription: string;
    keywords: string;
    ogImage: string;
    twitterHandle: string;
    allowIndexing: boolean;
    robotsExtra: string;
    googleVerification: string;
    bingVerification: string;
    llmsTxt: string;
  };
  organization: {
    legalName: string;
    foundingYear: string;
    priceRange: string;
    latitude: string;
    longitude: string;
    areaServed: string;
  };
  scripts: { ga4Id: string; gtmId: string; metaPixelId: string; headCode: string; bodyCode: string };
  smtp: { host: string; port: number; secure: boolean; user: string; pass: string; from: string; notifyTo: string };
  floating: { whatsapp: boolean; backToTop: boolean };
};
