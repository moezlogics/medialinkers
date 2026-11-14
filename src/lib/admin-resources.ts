import "server-only";
import bcrypt from "bcryptjs";
import type { Model } from "mongoose";
import { AuditRequest, Category, Lead, Page, Post, Project, Redirect, Service, Testimonial, User } from "./models";
import { cleanHtml } from "./sanitize";
import { SECTION_MAP, type Field } from "./sections";
import { readingTime, slugify } from "./utils";
import type { SessionPayload } from "./session";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Resource = {
  model: Model<any>;
  search: string[];
  listFields?: string;
  sort?: Record<string, 1 | -1>;
  adminOnly?: boolean;
  readOnly?: boolean;
  filters?: string[];
  populate?: [string, string][];
  prepare?: (body: any, ctx: { session: SessionPayload; existing?: any }) => Promise<any> | any;
  canDelete?: (doc: any, session: SessionPayload) => string | null | Promise<string | null>;
};

function cleanSeo(seo: any) {
  if (!seo || typeof seo !== "object") return seo;
  const out = { ...seo };
  if (out.schemaJson) {
    try {
      JSON.parse(out.schemaJson);
    } catch {
      throw new Error("Custom schema (JSON-LD) is not valid JSON");
    }
  }
  return out;
}

function cleanFields(data: any, fields: Field[]) {
  if (!data) return data;
  for (const f of fields) {
    if (f.type === "richtext" && typeof data[f.name] === "string") data[f.name] = cleanHtml(data[f.name]);
    if (f.type === "list" && Array.isArray(data[f.name]) && f.fields) data[f.name] = data[f.name].map((it: any) => cleanFields(it, f.fields!));
  }
  return data;
}

function ensureSlug(body: any, from: string) {
  if (body.slug !== undefined || body[from] !== undefined) {
    body.slug = slugify(body.slug || body[from] || "");
    if (!body.slug) throw new Error("Slug is required");
  }
}

export const RESOURCES: Record<string, Resource> = {
  pages: {
    model: Page,
    search: ["title", "slug"],
    listFields: "title slug status system updatedAt seo.metaTitle seo.metaDescription",
    sort: { system: -1, title: 1 },
    filters: ["status"],
    prepare: (b) => {
      if (b.slug !== undefined) {
        b.slug = b.slug === "home" ? "home" : b.slug.split("/").map(slugify).filter(Boolean).join("/");
        if (!b.slug) throw new Error("Slug is required");
      }
      if (Array.isArray(b.sections)) {
        b.sections = b.sections.map((s: any) => ({ ...s, data: cleanFields({ ...(s.data || {}) }, SECTION_MAP[s.type]?.fields || []) }));
      }
      if (b.seo) b.seo = cleanSeo(b.seo);
      return b;
    },
    canDelete: (d) => (d.system ? "System pages cannot be deleted (you can unpublish them)" : null),
  },
  services: {
    model: Service,
    search: ["title", "slug"],
    listFields: "title shortTitle slug icon status order parent updatedAt excerpt seo.metaDescription",
    sort: { order: 1, createdAt: 1 },
    filters: ["status"],
    prepare: async (b, { existing }) => {
      ensureSlug(b, "title");
      if (typeof b.content === "string") b.content = cleanHtml(b.content);
      if (b.seo) b.seo = cleanSeo(b.seo);
      delete b.children;
      if (b.parent !== undefined) {
        // Sub-services go one level deep: the parent must be a main service
        if (!b.parent) b.parent = null;
        else {
          if (existing && String(existing._id) === String(b.parent)) throw new Error("A service cannot be its own parent");
          const parent = await Service.findById(String(b.parent)).select("parent").lean<{ parent?: unknown }>();
          if (!parent) throw new Error("The selected main service does not exist");
          if (parent.parent) throw new Error("Choose a main service as the parent (sub-services cannot have their own sub-services)");
          if (existing && (await Service.exists({ parent: existing._id }))) {
            throw new Error("This service has sub-services of its own, so it cannot become a sub-service");
          }
        }
      }
      return b;
    },
    canDelete: async (d) => ((await Service.exists({ parent: d._id })) ? "This service still has sub-services. Move or delete them first." : null),
  },
  posts: {
    model: Post,
    search: ["title", "slug", "tags"],
    listFields: "title slug status featured publishedAt category coverImage updatedAt seo.metaDescription",
    sort: { publishedAt: -1 },
    filters: ["status", "category"],
    populate: [["category", "name slug"]],
    prepare: (b, { session, existing }) => {
      ensureSlug(b, "title");
      if (typeof b.content === "string") {
        b.content = cleanHtml(b.content);
        b.readingTime = readingTime(b.content);
      }
      if (b.category === "") b.category = null;
      if (Array.isArray(b.tags)) b.tags = b.tags.map((t: string) => String(t).trim()).filter(Boolean);
      if (!existing && !b.author) b.author = session.sub;
      if (b.seo) b.seo = cleanSeo(b.seo);
      return b;
    },
  },
  categories: {
    model: Category,
    search: ["name", "slug"],
    sort: { name: 1 },
    prepare: (b) => {
      ensureSlug(b, "name");
      return b;
    },
  },
  projects: {
    model: Project,
    search: ["title", "client", "slug", "industry"],
    listFields: "title slug client industry status featured confidential results order updatedAt",
    sort: { featured: -1, order: 1, createdAt: -1 },
    filters: ["status"],
    prepare: (b) => {
      ensureSlug(b, "title");
      if (typeof b.content === "string") b.content = cleanHtml(b.content);
      if (b.seo) b.seo = cleanSeo(b.seo);
      if (Array.isArray(b.serviceRefs)) b.serviceRefs = b.serviceRefs.map(String).filter((id: string) => /^[a-f0-9]{24}$/.test(id));
      if (b.confidential) b.website = "";
      if (b.accent && !/^#[0-9a-f]{3,8}$/i.test(b.accent)) throw new Error("Chart colour must be a hex value like #d4ff3a");
      if (b.trend?.points) b.trend.points = b.trend.points.map(Number).filter((n: number) => Number.isFinite(n)).slice(0, 120);
      if (Array.isArray(b.proofs)) b.proofs = b.proofs.filter((x: any) => x?.image);
      if (Array.isArray(b.screens)) b.screens = b.screens.filter((x: any) => x?.image).map((x: any) => ({ ...x, device: x.device === "mobile" ? "mobile" : "desktop" }));
      return b;
    },
  },
  testimonials: {
    model: Testimonial,
    search: ["name", "company", "quote"],
    sort: { order: 1, createdAt: -1 },
    filters: ["status"],
  },
  leads: {
    model: Lead,
    search: ["name", "email", "phone", "website", "message", "company"],
    sort: { createdAt: -1 },
    filters: ["status", "type"],
    prepare: (b) => {
      // Only status and notes are editable from the panel
      const out: any = {};
      if (b.status !== undefined) out.status = b.status;
      if (b.notes !== undefined) out.notes = String(b.notes);
      return out;
    },
  },
  redirects: {
    model: Redirect,
    search: ["from", "to"],
    sort: { createdAt: -1 },
    prepare: (b) => {
      if (b.from !== undefined) {
        let from = String(b.from).trim();
        try {
          if (/^https?:\/\//.test(from)) from = new URL(from).pathname;
        } catch {}
        from = "/" + from.replace(/^\/+/, "").replace(/\/+$/, "");
        if (from === "/") throw new Error("You cannot redirect the home page");
        b.from = from;
      }
      if (b.to !== undefined && !String(b.to).trim()) throw new Error("Target URL is required");
      return b;
    },
  },
  users: {
    model: User,
    search: ["name", "email"],
    sort: { createdAt: 1 },
    adminOnly: true,
    prepare: async (b, { existing }) => {
      const out: any = { ...b };
      delete out.passwordHash;
      delete out.failedLogins;
      delete out.lockUntil;
      if (b.password) {
        if (String(b.password).length < 8) throw new Error("Password must be at least 8 characters");
        out.passwordHash = await bcrypt.hash(String(b.password), 12);
      } else if (!existing) {
        throw new Error("Password is required for new users");
      }
      delete out.password;
      if (out.email) out.email = String(out.email).toLowerCase().trim();
      return out;
    },
    canDelete: (d, s) => (String(d._id) === s.sub ? "You cannot delete your own account" : null),
  },
  "audit-requests": {
    model: AuditRequest,
    search: ["website", "domain", "email", "name", "phone"],
    listFields: "website domain email name phone status dueAt sentAt reportUrl assignedTo createdAt",
    sort: { createdAt: -1 },
    filters: ["status"],
    prepare: (b, { existing }) => {
      // The team only updates progress, never the visitor's own details
      const out: any = {};
      for (const k of ["status", "notes", "reportUrl", "assignedTo"]) if (b[k] !== undefined) out[k] = String(b[k]).slice(0, 5000);
      if (out.status && !["new", "in_progress", "sent", "won", "closed"].includes(out.status)) throw new Error("Unknown status");
      if (out.reportUrl && !/^https?:\/\//.test(out.reportUrl)) throw new Error("Report link must start with https://");
      if (out.status === "sent" && existing?.status !== "sent") out.sentAt = new Date();
      if (out.status && ["new", "in_progress"].includes(out.status)) out.sentAt = null;
      return out;
    },
  },
};
