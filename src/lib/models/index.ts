/* eslint-disable @typescript-eslint/no-explicit-any */
// Schemas are typed as `any` on purpose: letting TypeScript infer document types from
// these large nested schemas makes type-checking take minutes. Shapes live in src/lib/types.ts.
import mongoose, { Schema, model, models, type Model } from "mongoose";

/* ---------- Shared sub-schemas ---------- */

export const SeoSchema = new Schema<any>(
  {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    focusKeyword: { type: String, default: "" },
    keywords: { type: String, default: "" },
    canonical: { type: String, default: "" },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    noindex: { type: Boolean, default: false },
    nofollow: { type: Boolean, default: false },
    schemaJson: { type: String, default: "" },
  },
  { _id: false },
);

const SectionSchema = new Schema<any>(
  {
    uid: { type: String, required: true },
    type: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    label: { type: String, default: "" },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false, minimize: false },
);

const ItemSchema = new Schema<any>({ title: String, text: String, icon: String }, { _id: false });
const StatSchema = new Schema<any>({ value: String, label: String }, { _id: false });
const FaqSchema = new Schema<any>({ q: String, a: String }, { _id: false });

/* ---------- User ---------- */

const UserSchema = new Schema<any>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "editor"], default: "editor" },
    active: { type: Boolean, default: true },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    failedLogins: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    lastLogin: Date,
  },
  { timestamps: true },
);

/* ---------- Page (section builder) ---------- */

const PageSchema = new Schema<any>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    system: { type: Boolean, default: false },
    status: { type: String, enum: ["published", "draft"], default: "published" },
    schemaType: { type: String, default: "WebPage" },
    showInSitemap: { type: Boolean, default: true },
    sections: { type: [SectionSchema], default: [] },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true, minimize: false },
);

/* ---------- Service ---------- */

const PackageSchema = new Schema<any>(
  {
    name: String,
    perfectFor: String,
    oldPrice: String,
    price: String,
    currency: { type: String, default: "$" },
    period: { type: String, default: "/Month" },
    features: [String],
    goal: String,
    featured: { type: Boolean, default: false },
    ctaLabel: { type: String, default: "Get Started" },
  },
  { _id: false },
);

const ServiceSchema = new Schema<any>(
  {
    title: { type: String, required: true },
    shortTitle: { type: String, default: "" },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Sub-services point to their main service; main services have parent = null
    parent: { type: Schema.Types.ObjectId, ref: "Service", default: null, index: true },
    icon: { type: String, default: "sparkles" },
    image: { type: String, default: "" },
    color: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    heroEyebrow: { type: String, default: "" },
    heroTitle: { type: String, default: "" },
    heroText: { type: String, default: "" },
    ctaLabel: { type: String, default: "Request Free Consultation" },
    whyTitle: { type: String, default: "" },
    content: { type: String, default: "" },
    highlights: [String],
    featuresTitle: { type: String, default: "" },
    features: [ItemSchema],
    process: [ItemSchema],
    statsTitle: { type: String, default: "" },
    stats: [StatSchema],
    ctaTitle: { type: String, default: "" },
    ctaText: { type: String, default: "" },
    packagesTitle: { type: String, default: "" },
    packages: [PackageSchema],
    faqs: [FaqSchema],
    order: { type: Number, default: 0 },
    showInHero: { type: Boolean, default: true },
    status: { type: String, enum: ["published", "draft"], default: "published" },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

/* ---------- Blog ---------- */

const CategorySchema = new Schema<any>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

const PostSchema = new Schema<any>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    coverAlt: { type: String, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    tags: [String],
    author: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, default: "" },
    status: { type: String, enum: ["published", "draft"], default: "draft" },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
    readingTime: { type: Number, default: 1 },
    faqs: [FaqSchema],
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);
PostSchema.index({ status: 1, publishedAt: -1 });

/* ---------- Case studies ---------- */

const ResultSchema = new Schema<any>({ value: String, label: String, before: String, after: String }, { _id: false });
const ProofSchema = new Schema<any>({ image: String, caption: String, width: Number, height: Number }, { _id: false });

const ProjectSchema = new Schema<any>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    client: { type: String, default: "" },
    // Client asked us not to publish their brand: hides the website link and shows a badge
    confidential: { type: Boolean, default: false },
    industry: { type: String, default: "" },
    location: { type: String, default: "" },
    period: { type: String, default: "" },
    duration: { type: String, default: "" },
    // Services this project used: decides which service pages show it
    serviceRefs: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    services: [String],
    website: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    logo: { type: String, default: "" },
    accent: { type: String, default: "" },
    results: [ResultSchema],
    trend: { label: { type: String, default: "" }, points: [Number] },
    challenge: { type: String, default: "" },
    approach: [ItemSchema],
    content: { type: String, default: "" },
    outcome: { type: String, default: "" },
    proofs: [ProofSchema],
    quote: { text: { type: String, default: "" }, name: { type: String, default: "" }, role: { type: String, default: "" } },
    gallery: [String],
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "draft"], default: "published" },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);
ProjectSchema.index({ status: 1, featured: -1, order: 1 });

/* ---------- Testimonials ---------- */

const TestimonialSchema = new Schema<any>(
  {
    name: { type: String, required: true },
    role: { type: String, default: "" },
    company: { type: String, default: "" },
    location: { type: String, default: "" },
    quote: { type: String, required: true },
    rating: { type: Number, default: 5 },
    avatar: { type: String, default: "" },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "draft"], default: "published" },
  },
  { timestamps: true },
);

/* ---------- Leads ---------- */

const LeadSchema = new Schema<any>(
  {
    type: { type: String, enum: ["contact", "quote", "newsletter"], default: "contact" },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    website: { type: String, default: "" },
    service: { type: String, default: "" },
    budget: { type: String, default: "" },
    message: { type: String, default: "" },
    status: { type: String, enum: ["new", "contacted", "qualified", "won", "lost"], default: "new" },
    notes: { type: String, default: "" },
    sourcePage: { type: String, default: "" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true },
);
LeadSchema.index({ createdAt: -1 });

/* ---------- Audit requests (manual SEO audit, delivered by email within 24 hours) ---------- */

const AuditRequestSchema = new Schema<any>(
  {
    website: { type: String, required: true, trim: true },
    domain: { type: String, default: "", index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    status: { type: String, enum: ["new", "in_progress", "sent", "won", "closed"], default: "new", index: true },
    dueAt: { type: Date },
    sentAt: { type: Date },
    reportUrl: { type: String, default: "" },
    assignedTo: { type: String, default: "" },
    notes: { type: String, default: "" },
    sourcePage: { type: String, default: "" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true },
);
AuditRequestSchema.index({ createdAt: -1 });

/* ---------- Media library (files live in GridFS bucket "media") ---------- */

const MediaSchema = new Schema<any>(
  {
    fileId: { type: Schema.Types.ObjectId, required: true },
    filename: { type: String, required: true, unique: true },
    originalName: { type: String, default: "" },
    url: { type: String, required: true },
    mime: { type: String, default: "" },
    size: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    alt: { type: String, default: "" },
    title: { type: String, default: "" },
  },
  { timestamps: true },
);

/* ---------- Redirects ---------- */

const RedirectSchema = new Schema<any>(
  {
    from: { type: String, required: true, unique: true, trim: true },
    to: { type: String, required: true, trim: true },
    code: { type: Number, enum: [301, 302], default: 301 },
    hits: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/* ---------- Settings (single document, key = "site") ---------- */

const SettingSchema = new Schema<any>(
  {
    key: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false },
);

function getModel<T>(name: string, schema: Schema<any>): Model<T> {
  return (models[name] as Model<T>) || (model(name, schema) as unknown as Model<T>);
}

export const User = getModel<any>("User", UserSchema);
export const Page = getModel<any>("Page", PageSchema);
export const Service = getModel<any>("Service", ServiceSchema);
export const Category = getModel<any>("Category", CategorySchema);
export const Post = getModel<any>("Post", PostSchema);
export const Project = getModel<any>("Project", ProjectSchema);
export const Testimonial = getModel<any>("Testimonial", TestimonialSchema);
export const Lead = getModel<any>("Lead", LeadSchema);
export const AuditRequest = getModel<any>("AuditRequest", AuditRequestSchema);
export const Media = getModel<any>("Media", MediaSchema);
export const Redirect = getModel<any>("Redirect", RedirectSchema);
export const Setting = getModel<any>("Setting", SettingSchema);

export { mongoose };
