/**
 * Section registry. Every page is built from these blocks.
 * The admin form is generated from `fields`, and the public site renders each `type` with a component.
 */

export type FieldType =
  | "text" | "textarea" | "richtext" | "image" | "url" | "number" | "toggle" | "select" | "icon" | "list" | "link" | "tags";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  fields?: Field[];
  itemLabel?: string;
  full?: boolean;
};

export type SectionDef = {
  type: string;
  label: string;
  description: string;
  group: "Hero" | "Content" | "Social proof" | "Conversion" | "Dynamic" | "Advanced";
  fields: Field[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaults: Record<string, any>;
};

const eyebrow: Field = { name: "eyebrow", label: "Small label (eyebrow)", type: "text" };
const title: Field = { name: "title", label: "Heading", type: "text", help: "Wrap a word in *stars* to highlight it, e.g. Grow your *brand*", full: true };
const text: Field = { name: "text", label: "Intro text", type: "textarea", full: true };
const variant = (opts: string[]): Field => ({
  name: "variant",
  label: "Color style",
  type: "select",
  options: opts.map((o) => ({ value: o, label: o[0].toUpperCase() + o.slice(1) })),
});

export const SECTION_DEFS: SectionDef[] = [
  {
    type: "hero",
    label: "Home hero",
    description: "Big first section with round service icons, headline and buttons.",
    group: "Hero",
    fields: [
      { name: "showServiceIcons", label: "Show round service icons on top", type: "toggle" },
      eyebrow,
      title,
      { name: "rotatingWords", label: "Rotating words", type: "tags", help: "Words that rotate inside the subtitle" },
      { name: "subtitle", label: "Subtitle", type: "text", help: "Use {word} where the rotating word should appear", full: true },
      text,
      { name: "primaryCta", label: "Main button", type: "link" },
      { name: "secondaryCta", label: "Second button", type: "link" },
      { name: "badgeText", label: "Spinning badge text", type: "text" },
      { name: "trustText", label: "Trust line", type: "text" },
      { name: "stats", label: "Mini stats", type: "list", itemLabel: "Stat", fields: [{ name: "value", label: "Value", type: "text" }, { name: "label", label: "Label", type: "text" }] },
    ],
    defaults: {
      showServiceIcons: true,
      eyebrow: "Since 2008 · 17+ years of growth",
      title: "Pakistan's No. 1 Digital Marketing *Agency*",
      rotatingWords: ["marketers", "designers", "advertisers", "writers"],
      subtitle: "We're not just {word} — we're your growth partners.",
      text: "",
      primaryCta: { label: "Claim My Free Audit", href: "#free-audit" },
      secondaryCta: { label: "Explore Services", href: "/services" },
      badgeText: "Free audit • 17+ years • Since 2008 • ",
      trustText: "Trusted by 500+ brands",
      stats: [],
    },
  },
  {
    type: "pageHero",
    label: "Page hero",
    description: "Heading block for inner pages with breadcrumb.",
    group: "Hero",
    fields: [
      eyebrow, title, text,
      { name: "primaryCta", label: "Main button", type: "link" },
      { name: "secondaryCta", label: "Second button", type: "link" },
      { name: "image", label: "Side image (optional)", type: "image" },
      variant(["light", "dark", "accent"]),
      {
        name: "shapes",
        label: "3D shapes",
        type: "select",
        help: "Silver shapes behind the heading (hidden when a side image is set). Auto picks shapes that match the page.",
        options: [
          { value: "auto", label: "Auto (match the page)" },
          { value: "default", label: "Soft shapes" },
          { value: "seo", label: "SEO — lens, growth arrow, chart" },
          { value: "social", label: "Social — heart, chat, play" },
          { value: "content", label: "Content — chat, sparkle, check" },
          { value: "web", label: "Web — code, window, plus" },
          { value: "ads", label: "Ads — target, plus, growth" },
          { value: "analytics", label: "Analytics — bars, ring, arrow" },
          { value: "work", label: "Results — arrow, star, check" },
          { value: "contact", label: "Contact — chat, pin, heart" },
          { value: "none", label: "No shapes" },
        ],
      },
      { name: "showBreadcrumb", label: "Show breadcrumb", type: "toggle" },
    ],
    defaults: { eyebrow: "", title: "Page *title*", text: "", primaryCta: { label: "", href: "" }, secondaryCta: { label: "", href: "" }, image: "", variant: "light", shapes: "auto", showBreadcrumb: true },
  },
  {
    type: "logos",
    label: "Client logos",
    description: "Scrolling strip of client logos or names.",
    group: "Social proof",
    fields: [
      title,
      { name: "items", label: "Clients", type: "list", itemLabel: "Client", fields: [
        { name: "name", label: "Name", type: "text" },
        { name: "logo", label: "Logo (optional)", type: "image" },
        { name: "url", label: "Website", type: "url" },
      ] },
    ],
    defaults: { title: "Trusted by our clients", items: [] },
  },
  {
    type: "marquee",
    label: "Marquee band",
    description: "Bold moving text strip, can be tilted.",
    group: "Content",
    fields: [
      { name: "items", label: "Words", type: "tags" },
      variant(["accent", "dark", "lime"]),
      { name: "tilted", label: "Tilted double band", type: "toggle" },
    ],
    defaults: { items: ["SEO", "Social Media", "Content Writing", "Web Development", "PPC Advertising", "Analytics"], variant: "accent", tilted: true },
  },
  {
    type: "statement",
    label: "Mission statement",
    description: "Large statement that lights up word by word while scrolling.",
    group: "Content",
    fields: [
      eyebrow,
      { name: "text", label: "Statement", type: "textarea", full: true },
      { name: "stats", label: "Stats", type: "list", itemLabel: "Stat", fields: [{ name: "value", label: "Value", type: "text" }, { name: "label", label: "Label", type: "text" }] },
      { name: "cta", label: "Button", type: "link" },
    ],
    defaults: { eyebrow: "Who we are", text: "", stats: [], cta: { label: "More about us", href: "/about-us" } },
  },
  {
    type: "services",
    label: "Services",
    description: "Shows services from the Services list automatically.",
    group: "Dynamic",
    fields: [
      eyebrow, title, text,
      { name: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Cards grid" }, { value: "list", label: "Interactive list" }] },
      { name: "limit", label: "How many (0 = all)", type: "number" },
      { name: "cta", label: "Button", type: "link" },
    ],
    defaults: { eyebrow: "What we do", title: "Our core *services*", text: "", layout: "grid", limit: 0, cta: { label: "", href: "" } },
  },
  {
    type: "stats",
    label: "Stats / results",
    description: "Animated numbers in a bento grid.",
    group: "Social proof",
    fields: [
      eyebrow, title, text,
      { name: "items", label: "Stats", type: "list", itemLabel: "Stat", fields: [
        { name: "value", label: "Value (e.g. +400%)", type: "text" },
        { name: "label", label: "Label", type: "text" },
      ] },
      variant(["dark", "light"]),
    ],
    defaults: { eyebrow: "Results", title: "Results we *deliver*", text: "", items: [], variant: "dark" },
  },
  {
    type: "process",
    label: "Process steps",
    description: "How you work, step by step.",
    group: "Content",
    fields: [
      eyebrow, title, text,
      { name: "steps", label: "Steps", type: "list", itemLabel: "Step", fields: [
        { name: "title", label: "Title", type: "text" },
        { name: "text", label: "Text", type: "textarea" },
        { name: "icon", label: "Icon", type: "icon" },
      ] },
    ],
    defaults: { eyebrow: "Our process", title: "From vision to *results*", text: "", steps: [] },
  },
  {
    type: "features",
    label: "Feature cards",
    description: "Cards with icon, title and text.",
    group: "Content",
    fields: [
      eyebrow, title, text,
      { name: "columns", label: "Columns", type: "select", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
      { name: "items", label: "Cards", type: "list", itemLabel: "Card", fields: [
        { name: "icon", label: "Icon", type: "icon" },
        { name: "title", label: "Title", type: "text" },
        { name: "text", label: "Text", type: "textarea" },
      ] },
      variant(["light", "dark"]),
    ],
    defaults: { eyebrow: "", title: "Why *choose* us", text: "", columns: "3", items: [], variant: "light" },
  },
  {
    type: "imageText",
    label: "Image + text",
    description: "Rich text next to an image, with bullets and a button.",
    group: "Content",
    fields: [
      eyebrow, title,
      { name: "content", label: "Content", type: "richtext", full: true },
      { name: "bullets", label: "Bullet points", type: "tags" },
      { name: "image", label: "Image", type: "image" },
      { name: "imagePosition", label: "Image side", type: "select", options: [{ value: "right", label: "Right" }, { value: "left", label: "Left" }] },
      { name: "cta", label: "Button", type: "link" },
    ],
    defaults: { eyebrow: "", title: "", content: "", bullets: [], image: "", imagePosition: "right", cta: { label: "", href: "" } },
  },
  {
    type: "richText",
    label: "Rich text",
    description: "Free content block using the full editor.",
    group: "Content",
    fields: [
      eyebrow, title,
      { name: "content", label: "Content", type: "richtext", full: true },
      { name: "width", label: "Width", type: "select", options: [{ value: "narrow", label: "Narrow (reading)" }, { value: "wide", label: "Wide" }] },
    ],
    defaults: { eyebrow: "", title: "", content: "", width: "narrow" },
  },
  {
    type: "auditCta",
    label: "Free audit request",
    description: "Website + email form. Your team emails the audit within 24 hours (see Audit requests).",
    group: "Conversion",
    fields: [
      eyebrow, title, text,
      { name: "placeholder", label: "Input placeholder", type: "text" },
      { name: "buttonLabel", label: "Button label", type: "text" },
      { name: "points", label: "Small points", type: "tags" },
    ],
    defaults: {
      eyebrow: "Free SEO audit", title: "Get your free *SEO audit* today", text: "Share your website and email. A senior SEO specialist reviews it by hand and sends you a clear, prioritised report within 24 hours.",
      placeholder: "yourwebsite.com", buttonLabel: "Get my free audit", points: ["Manual expert review", "Delivered within 24 hours", "100% free, no obligation"],
    },
  },
  {
    type: "industries",
    label: "Industries",
    description: "Industries you serve.",
    group: "Content",
    fields: [
      eyebrow, title, text,
      { name: "items", label: "Industries", type: "list", itemLabel: "Industry", fields: [
        { name: "title", label: "Name", type: "text" },
        { name: "icon", label: "Icon", type: "icon" },
      ] },
    ],
    defaults: { eyebrow: "Industries", title: "Industries we *serve*", text: "", items: [] },
  },
  {
    type: "testimonials",
    label: "Testimonials",
    description: "Client reviews from the Testimonials list.",
    group: "Social proof",
    fields: [eyebrow, title, text],
    defaults: { eyebrow: "Reviews", title: "What clients *say*", text: "" },
  },
  {
    type: "work",
    label: "Case studies",
    description: "Results from the Case studies list. Showcase for home/service pages, or a filterable grid for the case studies page.",
    group: "Dynamic",
    fields: [
      eyebrow, title, text,
      { name: "layout", label: "Layout", type: "select", options: [{ value: "showcase", label: "Showcase (featured first)" }, { value: "grid", label: "Grid with service filter" }] },
      { name: "limit", label: "How many (0 = all)", type: "number" },
      { name: "featuredOnly", label: "Only case studies marked “featured”", type: "toggle" },
      { name: "cta", label: "Button", type: "link" },
    ],
    defaults: { eyebrow: "Case studies", title: "Real results for *real businesses*", text: "", layout: "showcase", limit: 3, featuredOnly: true, cta: { label: "All case studies", href: "/case-studies" } },
  },
  {
    type: "pricing",
    label: "Pricing packages",
    description: "Packages from services. Leave service empty to show tabs for all.",
    group: "Conversion",
    fields: [eyebrow, title, text, { name: "service", label: "Service slug (optional)", type: "text", help: "e.g. seo-services. Empty = tabs for every service" }],
    defaults: { eyebrow: "Pricing", title: "Simple, transparent *packages*", text: "", service: "" },
  },
  {
    type: "faq",
    label: "FAQs",
    description: "Accordion questions. Adds FAQ rich results schema automatically.",
    group: "Conversion",
    fields: [
      eyebrow, title, text,
      { name: "items", label: "Questions", type: "list", itemLabel: "Question", fields: [
        { name: "q", label: "Question", type: "text" },
        { name: "a", label: "Answer", type: "textarea" },
      ] },
    ],
    defaults: { eyebrow: "FAQs", title: "Frequently asked *questions*", text: "", items: [] },
  },
  {
    type: "blog",
    label: "Latest posts",
    description: "Latest blog posts.",
    group: "Dynamic",
    fields: [eyebrow, title, text, { name: "count", label: "How many", type: "number" }, { name: "cta", label: "Button", type: "link" }],
    defaults: { eyebrow: "Insights", title: "Latest from the *blog*", text: "", count: 3, cta: { label: "Read the blog", href: "/blog" } },
  },
  {
    type: "blogList",
    label: "Blog list (full)",
    description: "Paginated list of all posts with category filter.",
    group: "Dynamic",
    fields: [{ name: "perPage", label: "Posts per page", type: "number" }, { name: "showCategories", label: "Show category filter", type: "toggle" }],
    defaults: { perPage: 9, showCategories: true },
  },
  {
    type: "contact",
    label: "Contact form",
    description: "Contact details and lead form.",
    group: "Conversion",
    fields: [eyebrow, title, text, { name: "formTitle", label: "Form heading", type: "text" }, { name: "showMap", label: "Show map (set embed in Settings)", type: "toggle" }],
    defaults: { eyebrow: "Contact", title: "Have a project in *mind*?", text: "Fill out the form and our team will get back to you shortly.", formTitle: "Tell us about your project", showMap: false },
  },
  {
    type: "team",
    label: "Team",
    description: "Team members.",
    group: "Social proof",
    fields: [
      eyebrow, title, text,
      { name: "items", label: "Members", type: "list", itemLabel: "Member", fields: [
        { name: "name", label: "Name", type: "text" },
        { name: "role", label: "Role", type: "text" },
        { name: "photo", label: "Photo", type: "image" },
        { name: "linkedin", label: "LinkedIn URL", type: "url" },
      ] },
    ],
    defaults: { eyebrow: "Team", title: "The people behind the *growth*", text: "", items: [] },
  },
  {
    type: "cta",
    label: "Call to action",
    description: "Big closing banner with buttons.",
    group: "Conversion",
    fields: [eyebrow, title, text, { name: "primaryCta", label: "Main button", type: "link" }, { name: "secondaryCta", label: "Second button", type: "link" }, variant(["accent", "dark", "lime"])],
    defaults: {
      eyebrow: "Let's talk", title: "Ready to *grow* your business?", text: "Book a free 30-minute strategy call. No pressure, just a clear plan.",
      primaryCta: { label: "Start a project", href: "/contact-us" }, secondaryCta: { label: "Free SEO audit", href: "#free-audit" }, variant: "dark",
    },
  },
  {
    type: "embed",
    label: "Custom HTML / embed",
    description: "Paste trusted HTML (maps, forms, widgets).",
    group: "Advanced",
    fields: [title, { name: "code", label: "HTML code", type: "textarea", full: true }],
    defaults: { title: "", code: "" },
  },
];

export const SECTION_MAP = Object.fromEntries(SECTION_DEFS.map((d) => [d.type, d]));

export function sectionDefaults(type: string) {
  return structuredClone(SECTION_MAP[type]?.defaults ?? {});
}
