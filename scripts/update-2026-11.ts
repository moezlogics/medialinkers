/**
 * November 2026 content update for an existing database (safe to run more than once):
 *  - imports the case studies (with their proof screenshots)
 *  - replaces the instant audit tool with the manual audit request flow everywhere
 *  - turns /our-work into /case-studies and adds case studies to the home page
 *
 * Run: npx tsx scripts/update-2026-11.ts            (keeps existing case studies)
 *      npx tsx scripts/update-2026-11.ts --refresh  (re-writes case studies from scripts/case-studies.ts)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";
import { Lead, Page, Redirect, Setting } from "../src/lib/models";
import { sectionDefaults } from "../src/lib/sections";
import { importCaseStudies } from "./import-case-studies";

let n = 0;
const uid = () => `u${Date.now().toString(36)}${(n++).toString(36)}`;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sec = (type: string, data: Record<string, any> = {}) => ({ uid: uid(), type, enabled: true, label: "", data: { ...sectionDefaults(type), ...data } });

const LINKS: [RegExp, string][] = [
  [/^\/free-seo-audit\/?(\?.*)?$/, "#free-audit"],
  [/^\/seo-audit\/?$/, "#free-audit"],
  [/^\/our-work(\/.*)?$/, "/case-studies$1"],
  [/^\/work\/?$/, "/case-studies"],
];

/** Rewrites old links anywhere inside a JSON-like value. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fixLinks(v: any): any {
  if (typeof v === "string") {
    for (const [re, to] of LINKS) if (re.test(v)) return v.replace(re, to);
    return v.replace(/href="\/free-seo-audit"/g, 'href="#free-audit"').replace(/href="\/our-work/g, 'href="/case-studies');
  }
  if (Array.isArray(v)) return v.map(fixLinks);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === "label" && x === "Our Work" ? "Case Studies" : fixLinks(x)]));
  return v;
}

const AUDIT_FAQ = "Yes. Send us your website and email and a senior SEO specialist reviews it by hand, then emails you a clear, prioritised audit within 24 hours — free and with no obligation.";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing in .env.local");
  await mongoose.connect(uri);
  console.log("Connected");

  console.log("Case studies:");
  await importCaseStudies({ overwrite: process.argv.includes("--refresh") });

  /* ---------- Pages ---------- */
  const auditDefaults = sectionDefaults("auditCta");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pages = await Page.find().lean<any[]>();
  const ourWork = pages.find((p) => p.slug === "our-work");
  const logos = ourWork?.sections?.find((s: { type: string }) => s.type === "logos");

  for (const page of pages) {
    if (page.slug === "free-seo-audit" || page.slug === "our-work") continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sections = fixLinks(page.sections || []).filter((s: any) => s.type !== "auditTool");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sections = sections.map((s: any) => {
      if (s.type === "auditCta" && (!s.data?.points?.length || s.data.points.some((p: string) => /instant|40\+|signup/i.test(p)))) {
        return { ...s, data: { ...s.data, eyebrow: auditDefaults.eyebrow, text: auditDefaults.text, buttonLabel: auditDefaults.buttonLabel, points: auditDefaults.points } };
      }
      if (s.type === "faq" && Array.isArray(s.data?.items)) {
        return { ...s, data: { ...s.data, items: s.data.items.map((f: { q: string; a: string }) => (/audit really free/i.test(f.q) ? { ...f, a: AUDIT_FAQ } : f)) } };
      }
      if (s.type === "richText" && typeof s.data?.content === "string") {
        const content = s.data.content
          .replace("<li>Website URLs you enter in our free SEO audit tool.</li>", "<li>The website address and email you send us when you request a free SEO audit.</li>")
          .replace(/<h2>Free tools<\/h2><p>Our free SEO audit tool provides automated results[^<]*<\/p>/, "<h2>Free SEO audits</h2><p>Free audits are prepared by our team as guidance and do not guarantee rankings.</p>");
        return { ...s, data: { ...s.data, content } };
      }
      if (s.type === "work") return { ...s, data: { ...sectionDefaults("work"), ...s.data, layout: s.data?.layout || "showcase", cta: { label: "All case studies", href: "/case-studies" } } };
      return s;
    });
    if (page.slug === "home" && !sections.some((s: { type: string }) => s.type === "work")) {
      const at = sections.findIndex((s: { type: string }) => s.type === "stats");
      sections.splice(at >= 0 ? at + 1 : 3, 0, sec("work", { eyebrow: "Case studies", title: "Real results for *real businesses*", text: "Numbers from our clients’ own Google Search Console and store dashboards — not projections.", layout: "showcase", limit: 3, featuredOnly: true }));
      console.log("  + home: case studies section");
    }
    await Page.updateOne({ _id: page._id }, { $set: { sections } });
  }

  if (await Page.exists({ slug: "free-seo-audit" })) {
    await Page.deleteOne({ slug: "free-seo-audit" });
    console.log("  - removed page /free-seo-audit (now redirects to the audit popup)");
  }

  if (!(await Page.exists({ slug: "case-studies" }))) {
    const doc = {
      title: "Case Studies",
      slug: "case-studies",
      system: true,
      status: "published",
      schemaType: "CollectionPage",
      showInSitemap: true,
      seo: {
        metaTitle: "Case Studies — Real SEO & Digital Marketing Results | Media Linkers",
        metaDescription: "Real results from Media Linkers clients: 84K+ organic clicks and 8.5M+ Google impressions across real estate, B2B, chemicals and e-commerce. See the data.",
      },
      sections: [
        sec("pageHero", {
          eyebrow: "Case studies",
          title: "Results you can *verify*",
          text: "Real numbers from our clients’ own Google Search Console and store dashboards. No mock-ups, no projections — just the growth we delivered.",
          primaryCta: { label: "Get results like these", href: "/contact-us" },
          secondaryCta: { label: "Free SEO audit", href: "#free-audit" },
        }),
        sec("stats", {
          eyebrow: "At a glance",
          title: "What these clients *gained*",
          variant: "dark",
          items: [
            { value: "84K+", label: "Organic clicks delivered" },
            { value: "8.5M+", label: "Google search impressions" },
            { value: "23×", label: "Biggest impressions jump" },
            { value: "5", label: "Industries" },
          ],
        }),
        sec("work", { eyebrow: "", title: "", text: "", layout: "grid", limit: 0, featuredOnly: false, cta: { label: "", href: "" } }),
        ...(logos ? [{ ...logos, uid: uid() }] : []),
        sec("testimonials"),
        sec("auditCta"),
        sec("cta", { eyebrow: "Your turn", title: "Want to be our next *case study*?", secondaryCta: { label: "Free SEO audit", href: "#free-audit" } }),
      ],
    };
    await Page.create(doc);
    console.log("  + page /case-studies");
  }
  if (ourWork) {
    await Page.deleteOne({ _id: ourWork._id });
    console.log("  - removed page /our-work (redirects to /case-studies)");
  }

  /* ---------- Settings ---------- */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const st = await Setting.findOne({ key: "site" }).lean<{ data: any }>();
  if (st) {
    const data = fixLinks(st.data || {});
    if (data.headerCta) data.headerCta.href = "#free-audit";
    if (data.announcement && /30 seconds|score/i.test(data.announcement.text || "")) {
      data.announcement = { ...data.announcement, text: "Free manual SEO audit — an expert report in your inbox within 24 hours", link: "#free-audit" };
    }
    if (Array.isArray(data.nav) && !data.nav.some((l: { href: string }) => l.href === "/case-studies")) {
      const at = data.nav.findIndex((l: { href: string }) => l.href === "/services");
      data.nav.splice(at >= 0 ? at + 1 : 2, 0, { label: "Case Studies", href: "/case-studies", children: [] });
      console.log("  + menu: Case Studies");
    }
    if (data.integrations) delete data.integrations;
    await Setting.updateOne({ key: "site" }, { $set: { data } });
    console.log("  ↻ settings links updated");
  }

  /* ---------- Redirects & leads ---------- */
  await Redirect.updateMany({ to: "/our-work" }, { $set: { to: "/case-studies" } });
  await Redirect.updateMany({ to: "/free-seo-audit" }, { $set: { to: "/#free-audit" } });
  const leads = await Lead.updateMany({ type: "audit" }, { $set: { type: "contact" } });
  if (leads.modifiedCount) console.log(`  ↻ ${leads.modifiedCount} old audit leads moved to contact`);

  await mongoose.disconnect();
  console.log("Update complete ✔");
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
