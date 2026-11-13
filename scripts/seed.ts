/**
 * Seeds the database with Media Linkers content from the current website.
 * Run: npm run seed            (only fills empty collections, safe to re-run)
 *      npm run seed -- --reset (wipes content collections first; users and leads are kept)
 */
import { config } from "dotenv";
// Reads .env.local first, then .env (whichever the server uses)
config({ path: [".env.local", ".env"], quiet: true });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { Readable } from "node:stream";
import { Category, Media, Page, Post, Project, Redirect, Service, Setting, Testimonial, User } from "../src/lib/models";
import { sectionDefaults } from "../src/lib/sections";
import { defaultSettings } from "../src/lib/settings-defaults";
import { SUB_SERVICES } from "./sub-services";
import { importCaseStudies } from "./import-case-studies";

const RESET = process.argv.includes("--reset");
let n = 0;
const uid = () => `s${Date.now().toString(36)}${(n++).toString(36)}`;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sec = (type: string, data: Record<string, any> = {}) => ({ uid: uid(), type, enabled: true, data: { ...sectionDefaults(type), ...data } });

const PROCESS = [
  { title: "Industry & Competitor Analysis", text: "We study your market, audience and the competitors you need to beat.", icon: "search" },
  { title: "Website Audit", text: "A deep technical, content and UX audit to find quick wins and blockers.", icon: "gauge" },
  { title: "Build Strategy", text: "A clear, prioritised roadmap tied to traffic, leads and revenue goals.", icon: "target" },
  { title: "Implement Strategy", text: "Our specialists execute — content, campaigns, fixes and creatives.", icon: "rocket" },
  { title: "Results & Reporting", text: "Transparent monthly reports and calls. We double down on what works.", icon: "line-chart" },
];

const INDUSTRIES = [
  ["E-commerce", "ecommerce"], ["Healthcare", "healthcare"], ["Travel", "travel"], ["Automotive", "automotive"], ["Legal", "legal"],
  ["Financial", "financial"], ["Beauty", "beauty"], ["Entertainment", "entertainment"], ["Education", "education"], ["Construction", "construction"],
].map(([title, icon]) => ({ title, icon }));

const CLIENTS = [
  ["Pakistan Models", "https://www.medialinkers.pk/wp-content/uploads/2025/10/pakistan-models-300x84.png"],
  ["Pakistan Rent a Car", "https://www.medialinkers.pk/wp-content/uploads/2025/10/pakistan-rent-a-car.png"],
  ["Pakistan Credit Cards", "https://www.medialinkers.pk/wp-content/uploads/2025/10/paksitan-credit-cards.jpg"],
  ["Islamabad.net", "https://www.medialinkers.pk/wp-content/uploads/2025/10/islamabad-net-300x61.png"],
  ["Pak Meeting", "https://www.medialinkers.pk/wp-content/uploads/2025/10/pak-meeting.png"],
  ["Pakistan Fashion Designer", "https://www.medialinkers.pk/wp-content/uploads/2025/10/pakistan-fashion-designer-300x44.jpg"],
  ["Pakistan Fashion", "https://www.medialinkers.pk/wp-content/uploads/2025/10/pakistan-fashion-300x56.gif"],
  ["Pakistan Furniture", "https://www.medialinkers.pk/wp-content/uploads/2025/10/pakistan-furniture-300x98.jpg"],
];

const SEO_FAQS = [
  { q: "What makes your SEO services different?", a: "We focus on complete website SEO, combining technical optimization, content strategy, and local + international SEO for sustainable growth." },
  { q: "How long does SEO take to show results?", a: "SEO typically shows improvements within 3–6 months, depending on competition and website condition." },
  { q: "Do you offer local SEO services?", a: "Yes, we provide local SEO services to help businesses rank in Google Maps and local search results." },
  { q: "Are your services suitable for international businesses?", a: "Yes. Our international SEO services help businesses target global markets effectively." },
];

const GENERAL_FAQS = [
  { q: "Which services does Media Linkers offer?", a: "SEO, content writing, social media marketing, PPC advertising (Google & Meta), website design & development, and analytics & reporting." },
  { q: "How long have you been in business?", a: "Media Linkers has been helping businesses grow online since 2008 — more than 17 years of digital marketing experience." },
  { q: "Do you work with businesses outside Pakistan?", a: "Yes. We work with clients in Pakistan, the UAE, the UK, the US and beyond, and run local as well as international campaigns." },
  { q: "Is the SEO audit really free?", a: "Yes. Send us your website and email and a senior SEO specialist reviews it by hand, then emails you a clear, prioritised audit within 24 hours — free and with no obligation." },
  { q: "How do you report results?", a: "You get a clear monthly report covering traffic, rankings, leads, ad spend and next steps, plus a strategy call." },
  ...SEO_FAQS.slice(1, 2),
];

async function uploadRemote(name: string, url: string) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return "";
    let buf: Buffer = Buffer.from(await res.arrayBuffer());
    let mime = res.headers.get("content-type") || "image/png";
    let ext = "png";
    let width = 0, height = 0;
    if (mime.includes("gif")) {
      ext = "gif";
    } else {
      const out = await sharp(buf).webp({ quality: 88 }).toBuffer({ resolveWithObject: true });
      buf = out.data; width = out.info.width; height = out.info.height; mime = "image/webp"; ext = "webp";
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filename = `${Date.now().toString(36)}-${slug}.${ext}`;
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db!, { bucketName: "media" });
    const fileId = await new Promise<unknown>((resolve, reject) => {
      const up = bucket.openUploadStream(filename, { metadata: { mime } });
      Readable.from(buf).pipe(up).on("error", reject).on("finish", () => resolve(up.id));
    });
    await Media.create({ fileId, filename, originalName: url.split("/").pop(), url: `/media/${filename}`, mime, size: buf.length, width, height, alt: `${name} logo` });
    return `/media/${filename}`;
  } catch {
    return "";
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing — add it to .env or .env.local");
  await mongoose.connect(uri);
  console.log("Connected to", uri.replace(/\/\/[^@]*@/, "//***@"));

  if (RESET) {
    for (const M of [Page, Service, Post, Category, Testimonial, Redirect, Setting, Project]) await M.deleteMany({});
    console.log("Content collections cleared");
  }

  /* ---------- Admin user ---------- */
  if (!(await User.exists({}))) {
    const email = process.env.ADMIN_EMAIL || "admin@medialinkers.pk";
    const password = process.env.ADMIN_PASSWORD;
    if (!password) throw new Error("Set ADMIN_PASSWORD in .env or .env.local");
    await User.create({ name: process.env.ADMIN_NAME || "Admin", email, passwordHash: await bcrypt.hash(password, 12), role: "admin" });
    console.log(`Admin user created: ${email} (password from .env.local)`);
  }

  /* ---------- Settings ---------- */
  if (!(await Setting.exists({ key: "site" }))) {
    await Setting.create({ key: "site", data: defaultSettings });
    console.log("Settings created");
  }

  /* ---------- Services (content from the current medialinkers.pk) ---------- */
  if (!(await Service.exists({}))) {
    await Service.insertMany([
      {
        order: 1, slug: "seo-services", icon: "google-analytics", color: "#ff5a1f",
        title: "Search Engine Optimization (SEO)", shortTitle: "SEO",
        excerpt: "Improve rankings of relevant keywords to increase visibility and drive qualified organic traffic.",
        heroEyebrow: "SEO Services in Pakistan",
        heroTitle: "Leading SEO services in *Pakistan*",
        heroText: "Media Linkers provides professional SEO services in Pakistan for businesses looking to rank higher on Google, appear in AI-powered search results, and attract high-quality customers. We deliver complete website SEO, combining technical optimization, content strategy, local SEO, and international SEO to help brands grow sustainably in competitive markets.",
        ctaLabel: "Request SEO Consultation",
        whyTitle: "Why your business needs SEO services in Pakistan",
        content: "<p><strong>If you are ignoring SEO then your business is losing 40–60% of revenue.</strong></p><ul><li>Over 50% of website traffic comes from organic search</li><li>SEO generates a 14.6% conversion rate, higher than outbound marketing</li><li>Google and AI search engines prioritize optimized, authoritative websites</li><li>Local SEO helps businesses appear in Google Maps and “near me” searches</li></ul><p>You deserve online visibility, high-quality customers, and sustainable business growth. We help your brand gain authority and reputation across Google and AI search engines.</p>",
        featuresTitle: "Our SEO marketing services in Pakistan",
        features: [
          { title: "Keyword Research", text: "Identify relevant keywords people search for to find your business.", icon: "search" },
          { title: "On-Page SEO", text: "Optimize page content and HTML to improve rankings.", icon: "file" },
          { title: "Off-Page SEO", text: "Build backlinks and authority to increase search visibility.", icon: "link" },
          { title: "Technical SEO", text: "Optimize your website backend for better crawling and indexing.", icon: "settings" },
          { title: "Local SEO", text: "Rank for local searches and appear in Google Maps results.", icon: "map-pin" },
          { title: "AEO", text: "Optimize for AI engines like ChatGPT and Perplexity with direct answers.", icon: "bot" },
          { title: "Shopify SEO", text: "Improve Shopify store visibility and sales through SEO.", icon: "shopify" },
          { title: "Voice Search SEO", text: "Optimize for users searching via voice commands.", icon: "mic" },
          { title: "E-commerce SEO", text: "Boost product visibility and conversions for your online store.", icon: "ecommerce" },
        ],
        process: PROCESS,
        statsTitle: "Results that *matter*",
        stats: [
          { value: "50%+", label: "of total website traffic comes from organic search" },
          { value: "14.6%", label: "conversion rate from SEO (vs 1.7% outbound)" },
          { value: "24/7", label: "SEO works around the clock — no ad budget needed" },
          { value: "2.8x", label: "higher growth in traffic & leads with SEO" },
        ],
        ctaTitle: "Get your free *SEO audit* today",
        ctaText: "Find out how our SEO services in Pakistan can help your business grow organic traffic, leads, and revenue.",
        packagesTitle: "SEO *packages*",
        packages: [
          { name: "Basic", perfectFor: "Small businesses or startups getting started with SEO.", oldPrice: "500", price: "400", currency: "$", period: "/Month", goal: "Build a strong SEO foundation and local visibility.", features: ["Keyword research (up to 10 target keywords)", "On-page optimization (titles, meta, headings, URLs)", "Basic technical SEO audit & fixes", "Google My Business setup/optimization", "Monthly performance report", "1 blog post (500 words)"] },
          { name: "Standard", featured: true, perfectFor: "Growing businesses ready to scale organic traffic.", oldPrice: "1000", price: "850", currency: "$", period: "/Month", goal: "Boost rankings and expand reach beyond local search.", features: ["Keyword research (up to 25 target keywords)", "Full on-page optimization & internal linking", "Technical SEO audit with fixes & speed optimization", "3 optimized blog posts (800 words each)", "5 quality backlinks per month", "Local SEO optimization (Google Maps, citations)", "Monthly analytics & strategy review"] },
          { name: "Premium", perfectFor: "Established businesses seeking aggressive growth.", oldPrice: "1500", price: "1300", currency: "$", period: "/Month", goal: "Dominate search results and drive consistent qualified traffic.", features: ["Advanced keyword strategy (50+ target keywords)", "Complete on-page & technical SEO overhaul", "Content strategy + 5 optimized blog posts (1,000+ words each)", "10 high-authority backlinks per month", "Competitor analysis & ongoing content optimization", "Conversion tracking setup & monthly strategy calls", "Dedicated SEO account manager"] },
        ],
        faqs: SEO_FAQS,
        seo: {
          metaTitle: "SEO Services in Pakistan To Get Rank Higher on Search Engines",
          metaDescription: "Professional SEO services in Pakistan by Media Linkers. Technical, local, e-commerce and AI search (AEO) optimization to rank higher on Google and grow leads.",
          focusKeyword: "seo services in pakistan",
        },
      },
      {
        order: 2, slug: "social-media-marketing", icon: "facebook", color: "#1877f2",
        title: "Social Media Marketing", shortTitle: "Social Media Marketing",
        excerpt: "Grow brand awareness and online presence to support sales and community.",
        heroEyebrow: "Social Media Marketing Pakistan",
        heroTitle: "Leading social media marketing in *Pakistan*",
        heroText: "From strategy and content creation to Meta ads and reporting, we build social media presences that connect, build trust, and drive business growth.",
        ctaLabel: "Get a Free Strategy Call",
        whyTitle: "Why your business needs social media marketing",
        content: "<p>If you want branding and more sales, your appearance on social media is necessary — it helps you connect, build trust, and drive business growth.</p><p>Social media marketing builds brand awareness and credibility, drives targeted traffic, boosts sales and leads, and improves customer relationships. <strong>Ignoring it means losing up to 40% of a social audience</strong> that could increase your sales and leads.</p>",
        featuresTitle: "Our social media marketing *services*",
        features: [
          { title: "Social Media Strategy Development", text: "From audience research to content planning, we set the roadmap for growth.", icon: "target" },
          { title: "Account Setup & Optimization", text: "We create and optimize social profiles for maximum visibility that look professional.", icon: "settings" },
          { title: "Content Creation & Management", text: "Our team manages your content calendar to keep posting consistent and growing.", icon: "camera" },
          { title: "Meta Ads", text: "Targeted ad campaigns, optimized for clicks, conversions, and ROI.", icon: "meta" },
          { title: "Analytics & Reporting", text: "Track your performance. We turn data into decisions that help your business grow.", icon: "pie-chart" },
          { title: "Branding & Rebranding", text: "A cohesive visual identity so your brand stands out with consistent, modern design.", icon: "palette" },
        ],
        process: PROCESS.filter((p) => p.title !== "Website Audit"),
        statsTitle: "Results that *matter*",
        stats: [
          { value: "3.2x", label: "higher engagement rate on posts" },
          { value: "70%+", label: "of consumers buy from brands they follow" },
          { value: "4.5x", label: "increase in website traffic" },
          { value: "2×", label: "lower customer acquisition cost" },
          { value: "70%", label: "client retention" },
        ],
        ctaTitle: "Free 30-minute *strategy* consultation",
        ctaText: "Discover how Media Linkers can grow your social media profiles, leads, and sales.",
        packagesTitle: "Social media marketing *packages*",
        packages: [
          { name: "Starter", perfectFor: "Small businesses building their online presence.", oldPrice: "40000", price: "35000", currency: "Rs.", period: "/Month", features: ["2 platforms (Facebook and Instagram)", "8 monthly posts & story designs", "Basic ads setup and audience targeting", "Monthly performance report"] },
          { name: "Growth", featured: true, perfectFor: "Growing brands looking to boost engagement and reach.", oldPrice: "68000", price: "60000", currency: "Rs.", period: "/Month", features: ["4 platforms (Facebook, Instagram, LinkedIn, TikTok)", "15 monthly posts, reels, and story sets", "Ad campaign management + A/B testing", "Monthly analytics & strategy review"] },
          { name: "Pro", perfectFor: "Established businesses aiming for high-impact social presence.", oldPrice: "125000", price: "110000", currency: "Rs.", period: "/Month", features: ["Up to 5 platforms (Facebook, Instagram, LinkedIn, TikTok, X)", "25+ posts, videos, reels, story sets", "Advanced ad funnel management", "Influencer outreach + bi-weekly detailed reports"] },
        ],
        faqs: [
          { q: "Which social media platforms do you manage?", a: "Facebook, Instagram, LinkedIn, TikTok, X and YouTube — we recommend platforms based on where your audience is." },
          { q: "Do you create the content too?", a: "Yes. Our team handles post designs, reels, stories, captions and the full content calendar." },
          { q: "Is ad spend included in the packages?", a: "No. Package prices cover management and content; ad budget is paid directly to the platform." },
        ],
        seo: {
          metaTitle: "Best Social Media Management Agency in Pakistan",
          metaDescription: "Media Linkers is a leading social media marketing agency in Pakistan specializing in content creation, Meta ads, account management and reporting.",
          focusKeyword: "social media marketing agency in pakistan",
        },
      },
      {
        order: 3, slug: "seo-content-writing-service-pakistan", icon: "writedotas", color: "#111111",
        title: "SEO Content Writing", shortTitle: "Content Writing",
        excerpt: "Create and distribute valuable content to attract your audience, build authority, and earn trust.",
        heroEyebrow: "SEO Content Writing Services",
        heroTitle: "Best SEO content writing in *Pakistan*",
        heroText: "We research your audience, understand their needs, and write content that answers their questions clearly — so your website ranks higher and keeps visitors on the page longer.",
        ctaLabel: "Get Free Content Audit",
        whyTitle: "Why our SEO content writing works",
        content: "<p>We don’t just add keywords and hope for the best. We research your audience, understand their needs, and write content that answers their questions clearly.</p><p>This helps your website rank higher and keeps visitors on your page longer — <strong>turning traffic into real business growth.</strong></p>",
        featuresTitle: "Our SEO content writing *services*",
        features: [
          { title: "SEO-friendly website content", text: "Clean, engaging website content fully optimized for search engines.", icon: "file" },
          { title: "Blog Writing & Content Planning", text: "From topic research to final drafts, strategic blogs that boost organic traffic.", icon: "pen" },
          { title: "Product & Service Page Copy", text: "Persuasive, SEO-optimized copy that explains your offer and drives conversions.", icon: "ecommerce" },
          { title: "Long-Form Authority Articles", text: "Detailed, research-backed articles that position your brand as an expert.", icon: "newspaper" },
          { title: "Brand-Focused Content", text: "Clear, helpful content that speaks directly to your audience’s needs.", icon: "megaphone" },
          { title: "Complete Content Solutions", text: "From keyword research to final optimization, we handle the entire process.", icon: "layers" },
        ],
        process: [PROCESS[0], PROCESS[1], { title: "Build a Content Strategy", text: "Topics, clusters and a calendar mapped to search intent.", icon: "target" }, { title: "Write & Optimize Content", text: "Expert writers, on-page SEO and internal linking.", icon: "pen" }, PROCESS[4]],
        statsTitle: "Results that *matter*",
        stats: [
          { value: "+120%", label: "increase in organic traffic" },
          { value: "3.4x", label: "improved customer engagement" },
          { value: "+89%", label: "increase in keyword rankings" },
          { value: "2.7×", label: "growth in qualified leads" },
          { value: "+65%", label: "faster indexing & content visibility" },
        ],
        ctaTitle: "Get your free *content audit* today",
        ctaText: "Discover how Media Linkers can grow your website traffic, leads, and sales with content.",
        packages: [],
        faqs: [
          { q: "Do you write in English and Urdu?", a: "Yes, we write SEO content in English and can provide Urdu content for local audiences." },
          { q: "Is the content original?", a: "Every piece is written from scratch by our writers, checked for plagiarism and optimized for your target keywords." },
          { q: "Can you write for my industry?", a: "Yes. We research each topic deeply and have written for e-commerce, healthcare, travel, finance, education and more." },
        ],
        seo: {
          metaTitle: "SEO Content Writing Services | Best Agency in Pakistan",
          metaDescription: "Media Linkers is a leading SEO content writing agency in Pakistan — blogs, website copy and articles that boost rankings, fast indexing and leads.",
          focusKeyword: "seo content writing services",
        },
      },
      {
        order: 4, slug: "web-design-and-development-services-pakistan", icon: "javascript", color: "#f7df1e",
        title: "Website Design & Development", shortTitle: "Web Design / Development",
        excerpt: "Credible, fast, responsive websites that showcase products, services, and capture leads.",
        heroEyebrow: "Web Design & Development",
        heroTitle: "Best web design & development in *Pakistan*",
        heroText: "As a trusted web design company and web development agency, we create custom websites that are visually appealing, mobile-friendly, and optimized for high performance.",
        ctaLabel: "Get Free Web Design Audit",
        whyTitle: "Why you need professional web design and development",
        content: "<p>Your website is the first impression your customers see — so it must be <strong>fast, modern, and easy to use</strong>.</p><p>Our web design and development services help you build a powerful online presence that attracts visitors and turns them into real customers.</p>",
        featuresTitle: "What we *offer*",
        features: [
          { title: "Custom Web Design", text: "Beautiful, responsive designs tailored to your brand and audience.", icon: "palette" },
          { title: "Website Redesign", text: "Modernize outdated websites with fresh layouts and improved user experience.", icon: "repeat" },
          { title: "Full Web Development", text: "Secure, high-performance development with clean code and strong functionality.", icon: "code" },
          { title: "E-commerce Development", text: "Scalable online stores with smooth checkout experiences and powerful features.", icon: "ecommerce" },
          { title: "Landing Page Design", text: "High-converting landing pages built to increase leads and sales.", icon: "layout" },
          { title: "Ongoing Website Support", text: "We maintain, update, and improve your website for long-term success.", icon: "wrench" },
        ],
        process: [PROCESS[0], PROCESS[1], { title: "Build a Web Strategy", text: "Sitemap, wireframes and conversion goals.", icon: "layout" }, { title: "Design & Develop", text: "Pixel-perfect design, fast code, SEO built in.", icon: "code" }, PROCESS[4]],
        statsTitle: "Why businesses *trust* our web agency",
        stats: [
          { value: "+140%", label: "increase in website conversions" },
          { value: "3.4x", label: "boost in customer engagement" },
          { value: "+98%", label: "growth in page speed and performance" },
          { value: "2.6×", label: "growth in qualified leads" },
          { value: "+75%", label: "improved search visibility" },
        ],
        ctaTitle: "Get your free *web design audit* today",
        ctaText: "Discover how a faster, modern website can grow your traffic, leads, and sales.",
        packages: [],
        faqs: [
          { q: "How long does it take to build a website?", a: "Most business websites take 2–5 weeks; e-commerce and custom platforms take longer depending on features." },
          { q: "Will my website be mobile friendly and SEO ready?", a: "Yes. Every site we build is responsive, fast and built with technical SEO best practices from day one." },
          { q: "Do you offer website maintenance?", a: "Yes, we offer ongoing support plans for updates, security, backups and improvements." },
        ],
        seo: {
          metaTitle: "Best Web Design and Development Services Agency Pakistan",
          metaDescription: "Professional web design and development services in Pakistan by Media Linkers — modern, fast, mobile-friendly and SEO-ready websites that convert.",
          focusKeyword: "web design and development services pakistan",
        },
      },
      {
        order: 5, slug: "ppc-advertising-services-pakistan", icon: "google-ads", color: "#fbbc04",
        title: "PPC Advertising", shortTitle: "PPC Advertising",
        excerpt: "Paid search and social campaigns that drive fast traffic, leads, and sales.",
        heroEyebrow: "PPC Advertising Services",
        heroTitle: "PPC advertising that delivers *fast*, measurable results",
        heroText: "Our PPC advertising services put your business in front of the right audience at the right time. Google PPC, Facebook PPC, or complete paid ad management — data-driven strategies designed to convert.",
        ctaLabel: "Get Free Ad Campaign Audit",
        whyTitle: "PPC advertising services that deliver",
        content: "<p>As a trusted PPC advertising agency, we create and manage high-performing ad campaigns that <strong>maximize your ROI</strong>.</p><p>Whether you need Google PPC advertising, Facebook PPC advertising, or complete paid ad management, our team builds data-driven strategies designed to convert.</p>",
        featuresTitle: "What we *offer*",
        features: [
          { title: "Google PPC Advertising", text: "Search, display, and shopping campaigns that drive high-intent traffic.", icon: "google-ads" },
          { title: "Facebook PPC Advertising", text: "Highly targeted social ads that boost engagement, conversions, and awareness.", icon: "meta" },
          { title: "PPC Advertising Management", text: "From keyword research to ongoing optimization, managed end-to-end for ROI.", icon: "settings" },
          { title: "Landing Page Optimization", text: "Better landing pages to increase conversions and lower cost-per-click.", icon: "layout" },
          { title: "Retargeting & Remarketing", text: "Bring visitors back and turn them into paying customers.", icon: "repeat" },
          { title: "Monthly Reporting & Insights", text: "Clear reports showing results, spending, and growth opportunities.", icon: "bar-chart" },
        ],
        process: [PROCESS[0], { title: "PPC Account & Campaign Audit", text: "Find wasted spend and missed opportunities.", icon: "gauge" }, { title: "Build a PPC Strategy", text: "Keywords, audiences, budgets and bidding.", icon: "target" }, { title: "Create & Launch Campaigns", text: "Ads, creatives and tracking set up properly.", icon: "rocket" }, { title: "Ongoing Optimization & Report", text: "Weekly tuning and monthly reports.", icon: "line-chart" }],
        statsTitle: "Why businesses *trust* our PPC agency",
        stats: [
          { value: "+220%", label: "increase in high-intent conversions" },
          { value: "3.8×", label: "higher return on ad spend (ROAS)" },
          { value: "+160%", label: "growth in qualified traffic" },
          { value: "2.4×", label: "more sales-ready leads generated" },
          { value: "+95%", label: "improved ad visibility & click-through rates" },
        ],
        ctaTitle: "Get your free *ad campaign audit* today",
        ctaText: "Discover how Media Linkers can lower your cost per lead and scale your sales.",
        packages: [],
        faqs: [
          { q: "What is the minimum ad budget?", a: "It depends on your industry and goals. We help you start with a budget that can produce measurable results, then scale what works." },
          { q: "Which ad platforms do you manage?", a: "Google Ads (Search, Display, Shopping, YouTube), Meta (Facebook & Instagram), TikTok and LinkedIn ads." },
          { q: "How quickly will I see results?", a: "PPC can generate traffic and leads within days of launch; performance improves over the first weeks as we optimize." },
        ],
        seo: {
          metaTitle: "Best PPC Advertising Services Agency Pakistan",
          metaDescription: "Expert PPC advertising services in Pakistan for instant traffic and leads. Google Ads, Facebook ads and complete paid ad management by Media Linkers.",
          focusKeyword: "ppc advertising services pakistan",
        },
      },
      {
        order: 6, slug: "analytics-reporting", icon: "bar-chart", color: "#7c3aed", showInHero: false,
        title: "Analytics & Reporting", shortTitle: "Analytics",
        excerpt: "Turn data into insight for better decisions and improved performance.",
        heroEyebrow: "Analytics & Reporting",
        heroTitle: "Turn your data into *decisions*",
        heroText: "We set up GA4, Google Tag Manager, Search Console and conversion tracking properly, then turn the numbers into clear reports and actions.",
        ctaLabel: "Get a Free Tracking Audit",
        whyTitle: "Why analytics matters",
        content: "<p>You can’t grow what you don’t measure. Most websites track the wrong things — or nothing at all.</p><ul><li>Know exactly which channels bring leads and sales</li><li>Stop wasting budget on campaigns that don’t convert</li><li>Make decisions from real data, not guesses</li></ul>",
        featuresTitle: "What we *offer*",
        features: [
          { title: "GA4 Setup & Migration", text: "Clean Google Analytics 4 setup with the events that matter.", icon: "google-analytics" },
          { title: "Conversion Tracking", text: "Forms, calls, WhatsApp clicks and purchases tracked accurately.", icon: "target" },
          { title: "Tag Manager", text: "Organised GTM containers for every pixel and tag.", icon: "settings" },
          { title: "Search Console", text: "Indexing, coverage and keyword performance monitoring.", icon: "search-console" },
          { title: "Dashboards", text: "Live Looker Studio dashboards you can understand at a glance.", icon: "pie-chart" },
          { title: "Monthly Insights", text: "What happened, why, and what we do next.", icon: "lightbulb" },
        ],
        process: PROCESS,
        statsTitle: "What good data *unlocks*",
        stats: [{ value: "100%", label: "of key conversions tracked" }, { value: "1", label: "dashboard for every channel" }, { value: "24/7", label: "real-time visibility" }],
        ctaTitle: "Get a free *tracking audit*",
        ctaText: "Find out what your analytics is missing — and what it’s costing you.",
        packages: [],
        faqs: [{ q: "Do you work with GA4?", a: "Yes. We set up, migrate and audit Google Analytics 4 along with Tag Manager and Search Console." }],
        seo: {
          metaTitle: "Analytics & Reporting Services in Pakistan",
          metaDescription: "GA4, Google Tag Manager, conversion tracking and clear monthly reporting. Media Linkers turns your marketing data into better decisions.",
          focusKeyword: "analytics and reporting services",
        },
      },
    ]);
    console.log("Services created");
  }


  /* ---------- Sub-services (added by slug, so re-running only fills in missing ones) ---------- */
  {
    let added = 0;
    for (const [i, sub] of SUB_SERVICES.entries()) {
      if (await Service.exists({ slug: sub.slug })) continue;
      const parent = await Service.findOne({ slug: sub.parent, parent: null });
      if (!parent) continue;
      const [intro, points] = sub.why;
      await Service.create({
        parent: parent._id,
        order: i + 1,
        slug: sub.slug,
        title: sub.title,
        shortTitle: sub.shortTitle,
        icon: sub.icon,
        excerpt: sub.excerpt,
        heroEyebrow: sub.heroEyebrow,
        heroTitle: sub.heroTitle,
        heroText: sub.heroText,
        ctaLabel: sub.ctaLabel,
        whyTitle: sub.whyTitle,
        content: `<p>${intro}</p><ul>${points.map((pt) => `<li>${pt}</li>`).join("")}</ul>`,
        featuresTitle: sub.featuresTitle,
        features: sub.features.map(([icon, title, text]) => ({ icon, title, text })),
        faqs: sub.faqs.map(([q, a]) => ({ q, a })),
        showInHero: false,
        status: "published",
        seo: { metaTitle: sub.seo[0], metaDescription: sub.seo[1], focusKeyword: sub.seo[2] },
      });
      added++;
    }
    if (added) console.log(`Sub-services created: ${added}`);
  }

  /* ---------- Testimonials (from current site) ---------- */
  if (!(await Testimonial.exists({}))) {
    await Testimonial.insertMany([
      { order: 1, name: "Ayesha Khan", location: "Lahore", quote: "The team is very professional and friendly. They helped us improve our website and social media a lot. Really happy with the results." },
      { order: 2, name: "Bilal Ahmed", location: "Islamabad", quote: "They know what they’re doing. Our business started getting more online orders after their SEO and ads work. Very satisfied with their service." },
      { order: 3, name: "Saud", location: "Multan", quote: "They always guide us properly and reply quickly. Our page is growing and getting more reach now. Will keep working with them." },
    ]);
    console.log("Testimonials created");
  }

  /* ---------- Blog ---------- */
  if (!(await Category.exists({}))) {
    await Category.insertMany([
      { name: "SEO", slug: "seo", description: "Search engine optimization guides, updates and tips." },
      { name: "Social Media", slug: "social-media", description: "Social media marketing strategies that grow brands." },
      { name: "PPC", slug: "ppc", description: "Google Ads and Meta Ads insights." },
      { name: "Web Design", slug: "web-design", description: "Website design, speed and conversion tips." },
    ]);
    console.log("Categories created");
  }
  if (!(await Post.exists({}))) {
    const cat = async (slug: string) => (await Category.findOne({ slug }))?._id;
    const admin = await User.findOne({ role: "admin" });
    await Post.insertMany([
      {
        title: "How Long Does SEO Take to Show Results in Pakistan?",
        slug: "how-long-does-seo-take",
        excerpt: "SEO is a long game — but not an endless one. Here is a realistic timeline for rankings, traffic and leads, and what speeds it up.",
        category: await cat("seo"), tags: ["SEO", "Google", "Strategy"], author: admin?._id, status: "published", featured: true,
        publishedAt: new Date(Date.now() - 6 * 86400000), readingTime: 4,
        content: "<p>It is the first question every business owner asks us: <strong>how long until SEO works?</strong> The honest answer is that most websites see meaningful improvements in <strong>3 to 6 months</strong>. Here is what happens during that time.</p><h2>Month 1: Audit and foundations</h2><p>We fix technical problems first — crawl errors, slow pages, missing meta tags, broken links and indexing issues. These fixes alone can lift rankings for pages that were already close to page one.</p><h2>Months 2–3: Content and on-page work</h2><p>We optimize existing pages for the keywords your customers actually search, and publish new content that answers their questions. Google needs time to crawl, test and trust these changes.</p><h2>Months 4–6: Authority and growth</h2><p>Quality backlinks, local citations and consistent content build authority. This is usually when traffic and leads start to climb steadily.</p><h2>What makes SEO faster?</h2><ul><li>A fast, mobile-friendly website</li><li>Targeting low-competition, high-intent keywords first</li><li>Local SEO for “near me” searches</li><li>Publishing helpful content consistently</li></ul><blockquote><p>Want to know where your website stands today? Run our free SEO audit — it takes 30 seconds.</p></blockquote>",
        seo: { metaDescription: "A realistic SEO timeline for Pakistani businesses: what happens in months 1–6, when to expect rankings and leads, and how to speed it up.", focusKeyword: "how long does seo take" },
      },
      {
        title: "7 Social Media Marketing Mistakes That Kill Engagement",
        slug: "social-media-marketing-mistakes",
        excerpt: "Posting more is not the answer. These seven common mistakes quietly hurt your reach — and they are easy to fix.",
        category: await cat("social-media"), tags: ["Social Media", "Instagram", "Facebook"], author: admin?._id, status: "published",
        publishedAt: new Date(Date.now() - 12 * 86400000), readingTime: 4,
        content: "<p>Many brands post every day and still see engagement drop. Usually the problem is not effort — it is one of these mistakes.</p><h2>1. No clear audience</h2><p>Content made for everyone connects with no one. Define who you are talking to before you design a single post.</p><h2>2. Selling in every post</h2><p>Mix educational, entertaining and behind-the-scenes content with your offers.</p><h2>3. Ignoring Reels and short video</h2><p>Short video gets the most reach on Instagram, Facebook and TikTok right now.</p><h2>4. Inconsistent posting</h2><p>A simple content calendar beats bursts of activity followed by silence.</p><h2>5. Not replying to comments and DMs</h2><p>Fast replies build trust and signal the algorithm that people care about your content.</p><h2>6. Boosting posts instead of running real ads</h2><p>Proper Meta Ads campaigns with targeting and testing outperform the “Boost” button.</p><h2>7. Not measuring results</h2><p>Track reach, saves, clicks and leads monthly — then do more of what works.</p>",
        seo: { metaDescription: "Avoid these 7 social media marketing mistakes that kill engagement and reach on Instagram, Facebook and TikTok — with simple fixes.", focusKeyword: "social media marketing mistakes" },
      },
      {
        title: "Why Your Website Speed Is Costing You Customers",
        slug: "website-speed-costing-customers",
        excerpt: "Every extra second of load time loses visitors. Learn what Core Web Vitals are and the quickest ways to speed up your site.",
        category: await cat("web-design"), tags: ["Web Design", "Core Web Vitals", "Performance"], author: admin?._id, status: "published",
        publishedAt: new Date(Date.now() - 20 * 86400000), readingTime: 3,
        content: "<p>Most visitors leave a page that takes more than three seconds to load — especially on mobile data. Speed is also a Google ranking factor through <strong>Core Web Vitals</strong>.</p><h2>The three numbers that matter</h2><ul><li><strong>LCP</strong> (Largest Contentful Paint): how fast the main content appears. Aim for under 2.5s.</li><li><strong>INP</strong> (Interaction to Next Paint): how quickly the page responds to taps and clicks.</li><li><strong>CLS</strong> (Cumulative Layout Shift): how much the layout jumps while loading.</li></ul><h2>Quick wins</h2><ol><li>Compress and resize images (use WebP/AVIF)</li><li>Use good hosting and caching</li><li>Remove unused plugins and scripts</li><li>Lazy-load images below the fold</li></ol><p>Our free audit tool checks your server speed and runs a Google PageSpeed test for you.</p>",
        seo: { metaDescription: "Slow websites lose customers and rankings. Understand Core Web Vitals (LCP, INP, CLS) and the quickest fixes to speed up your website.", focusKeyword: "website speed" },
      },
    ]);
    console.log("Blog posts created");
  }

  /* ---------- Pages ---------- */
  if (!(await Page.exists({}))) {
    console.log("Importing client logos from medialinkers.pk …");
    const logos = [];
    for (const [name, url] of CLIENTS) logos.push({ name, logo: await uploadRemote(name, url), url: "" });

    const ctaDefault = sec("cta");
    const pages = [
      {
        title: "Home", slug: "home", system: true, schemaType: "WebPage",
        seo: { metaTitle: "Best Digital Marketing Agency Pakistan For Business Growth", metaDescription: "Media Linkers is Pakistan's Number 1 digital marketing agency specializing in SEO, content marketing, social media, PPC, web design services and more.", focusKeyword: "digital marketing agency pakistan" },
        sections: [
          sec("hero", {
            text: "Media Linkers has 17+ years of experience in SEO, Content Marketing, Social Media Marketing, PPC Advertising, Website Design & Development, and Analytics & Reporting. Since 2008, we’ve helped businesses grow sales, generate leads, build brand awareness, and connect with their target audience.",
            stats: [{ value: "17+", label: "Years" }, { value: "500+", label: "Projects" }, { value: "90%", label: "Retention" }],
          }),
          sec("logos", { items: logos }),
          sec("services", { title: "Our core *services*", text: "Everything you need to get found, get chosen and grow — under one roof." }),
          sec("marquee"),
          sec("statement", {
            text: "We’re a team of experts using the latest technologies and proven online channels to deliver trusted, cost-effective digital marketing that grows sales, generates leads and builds brands people remember.",
            stats: [{ value: "2008", label: "Founded" }, { value: "17+", label: "Years of experience" }, { value: "6", label: "Core services" }],
          }),
          sec("stats", { items: [
            { value: "+400%", label: "Website traffic in 3 months" },
            { value: "5×", label: "ROI on social ads" },
            { value: "150%", label: "More engagement" },
            { value: "2×", label: "Increase in leads" },
            { value: "90%", label: "Client retention" },
          ] }),
          sec("work", { text: "Numbers from our clients’ own Google Search Console and store dashboards — not projections." }),
          sec("process", { steps: PROCESS }),
          sec("auditCta"),
          sec("testimonials"),
          sec("industries", { items: INDUSTRIES }),
          sec("faq", { items: GENERAL_FAQS }),
          sec("blog"),
          ctaDefault,
        ],
      },
      {
        title: "About Us", slug: "about-us", system: true, schemaType: "AboutPage",
        seo: { metaTitle: "About Media Linkers — Digital Marketing Agency Since 2008", metaDescription: "Meet Media Linkers: a Pakistani digital marketing agency helping businesses grow with SEO, content, social media, PPC and web development since 2008." },
        sections: [
          sec("pageHero", { eyebrow: "About us", title: "Not just marketers — your *growth partners*", text: "Since 2008, Media Linkers has helped businesses grow sales, generate leads, build brand awareness, and connect with their audience.", primaryCta: { label: "Work with us", href: "/contact-us" } }),
          sec("statement", { eyebrow: "Our mission", text: "Our mission is simple: make digital marketing honest, measurable and profitable for every business we work with — from local startups to international brands.", stats: [{ value: "2008", label: "Founded" }, { value: "17+", label: "Years" }, { value: "90%", label: "Client retention" }], cta: { label: "", href: "" } }),
          sec("features", { eyebrow: "Why Media Linkers", title: "What makes us *different*", items: [
            { icon: "award", title: "17+ years of experience", text: "We’ve grown with the internet in Pakistan since 2008 and know what works." },
            { icon: "line-chart", title: "Results first", text: "Every strategy is tied to traffic, leads and revenue — not vanity metrics." },
            { icon: "eye", title: "Full transparency", text: "Clear monthly reports, honest advice and no long lock-in contracts." },
            { icon: "users", title: "One expert team", text: "SEO, content, social, ads and web under one roof, working together." },
            { icon: "zap", title: "Latest technology", text: "AI search optimization, modern web stacks and smart automation." },
            { icon: "handshake", title: "Cost-effective", text: "Packages for startups to enterprises, with pricing in PKR and USD." },
          ] }),
          sec("stats", { variant: "light", items: [{ value: "+400%", label: "Website traffic in 3 months" }, { value: "5×", label: "ROI on social ads" }, { value: "2×", label: "Increase in leads" }, { value: "90%", label: "Client retention" }] }),
          sec("process", { steps: PROCESS }),
          sec("logos", { items: logos }),
          sec("testimonials"),
          sec("cta"),
        ],
      },
      {
        title: "Services", slug: "services", system: true, schemaType: "CollectionPage",
        seo: { metaTitle: "Digital Marketing Services in Pakistan | Media Linkers", metaDescription: "SEO, social media marketing, content writing, PPC advertising, web design & development and analytics services by Media Linkers, Pakistan." },
        sections: [
          sec("pageHero", { eyebrow: "Services", title: "Digital marketing services that *grow* revenue", text: "Pick one service or combine them into a complete growth plan. Every service is built around measurable results.", primaryCta: { label: "Get a free proposal", href: "/contact-us" }, secondaryCta: { label: "See pricing", href: "/pricing" } }),
          sec("services", { eyebrow: "", title: "", layout: "list" }),
          sec("process", { steps: PROCESS }),
          sec("industries", { items: INDUSTRIES }),
          sec("auditCta"),
          sec("faq", { items: GENERAL_FAQS }),
        ],
      },
      {
        title: "Contact Us", slug: "contact-us", system: true, schemaType: "ContactPage",
        seo: { metaTitle: "Contact Media Linkers — Get a Free Proposal", metaDescription: "Have a project in mind? Contact Media Linkers for SEO, social media, PPC and web design. Get a free consultation and proposal." },
        sections: [sec("contact"), sec("faq", { items: GENERAL_FAQS.slice(0, 4) })],
      },
      {
        title: "Pricing", slug: "pricing", system: true, schemaType: "WebPage",
        seo: { metaTitle: "Digital Marketing Packages & Pricing | Media Linkers", metaDescription: "Transparent SEO and social media marketing packages in Pakistan. Compare plans and pick the one that fits your goals." },
        sections: [
          sec("pageHero", { eyebrow: "Pricing", title: "Simple, transparent *packages*", text: "Monthly plans with no hidden fees. Need something custom? We’ll build a plan around your goals." }),
          sec("pricing", { eyebrow: "", title: "", text: "" }),
          sec("faq", { items: GENERAL_FAQS }),
          sec("cta"),
        ],
      },
      {
        title: "SEO Packages", slug: "seo-packages", system: false, schemaType: "WebPage",
        seo: { metaTitle: "SEO Packages in Pakistan | Affordable Monthly SEO Plans", metaDescription: "Affordable monthly SEO packages in Pakistan: Basic, Standard and Premium plans with keyword research, on-page, technical SEO, content and backlinks." },
        sections: [
          sec("pageHero", { eyebrow: "SEO packages", title: "SEO packages that *pay* for themselves", text: "Pick a plan that matches your stage of growth.", primaryCta: { label: "Free SEO audit", href: "#free-audit" } }),
          sec("pricing", { eyebrow: "", title: "", service: "seo-services" }),
          sec("faq", { items: SEO_FAQS }),
          sec("cta"),
        ],
      },
      {
        title: "Social Media Packages", slug: "smm-packages", system: false, schemaType: "WebPage",
        seo: { metaTitle: "Social Media Marketing Packages in Pakistan", metaDescription: "Social media marketing packages in Pakistan — Starter, Growth and Pro plans for Facebook, Instagram, LinkedIn, TikTok and X." },
        sections: [
          sec("pageHero", { eyebrow: "SMM packages", title: "Social media *packages*", text: "Content, ads and growth — managed for you." }),
          sec("pricing", { eyebrow: "", title: "", service: "social-media-marketing" }),
          sec("cta"),
        ],
      },
      {
        title: "Blog", slug: "blog", system: true, schemaType: "CollectionPage",
        seo: { metaTitle: "SEO & Digital Marketing Latest Trends, News, Insights and Tips", metaDescription: "Digital marketing insights from Media Linkers: SEO guides, social media tips, PPC strategies and web design advice for growing businesses." },
        sections: [sec("pageHero", { eyebrow: "Blog", title: "Insights that help you *grow*", text: "SEO, social media, ads and web — practical tips from our team." }), sec("blogList"), sec("auditCta")],
      },
      {
        title: "Case Studies", slug: "case-studies", system: true, schemaType: "CollectionPage",
        seo: { metaTitle: "Case Studies — Real SEO & Digital Marketing Results | Media Linkers", metaDescription: "Real results from Media Linkers clients: 84K+ organic clicks and 8.5M+ Google impressions across real estate, B2B, chemicals and e-commerce. See the data." },
        sections: [
          sec("pageHero", { eyebrow: "Case studies", title: "Results you can *verify*", text: "Real numbers from our clients’ own Google Search Console and store dashboards. No mock-ups, no projections — just the growth we delivered.", primaryCta: { label: "Get results like these", href: "/contact-us" }, secondaryCta: { label: "Free SEO audit", href: "#free-audit" } }),
          sec("stats", { eyebrow: "At a glance", title: "What these clients *gained*", items: [{ value: "84K+", label: "Organic clicks delivered" }, { value: "8.5M+", label: "Google search impressions" }, { value: "23×", label: "Biggest impressions jump" }, { value: "5", label: "Industries" }] }),
          sec("work", { eyebrow: "", title: "", text: "", layout: "grid", limit: 0, featuredOnly: false, cta: { label: "", href: "" } }),
          sec("logos", { items: logos }),
          sec("testimonials"),
          sec("auditCta"),
          sec("cta", { eyebrow: "Your turn", title: "Want to be our next *case study*?" }),
        ],
      },
      {
        title: "FAQs", slug: "faqs", system: false, schemaType: "FAQPage",
        seo: { metaTitle: "Frequently Asked Questions | Media Linkers", metaDescription: "Answers to common questions about Media Linkers’ SEO, social media, PPC and web design services, pricing and results." },
        sections: [sec("pageHero", { eyebrow: "FAQs", title: "Questions? We’ve got *answers*" }), sec("faq", { eyebrow: "", title: "General", items: GENERAL_FAQS }), sec("faq", { eyebrow: "", title: "SEO", items: SEO_FAQS }), sec("cta")],
      },
      {
        title: "Privacy Policy", slug: "privacy-policy", system: false, schemaType: "WebPage",
        seo: { metaDescription: "How Media Linkers collects, uses and protects your personal information." },
        sections: [
          sec("pageHero", { title: "Privacy *Policy*", eyebrow: "Legal" }),
          sec("richText", { content: "<p><em>Last updated: November 2026</em></p><p>Media Linkers (“we”, “us”) respects your privacy. This policy explains what information we collect through medialinkers.pk and how we use it.</p><h2>Information we collect</h2><ul><li>Details you submit in our forms, such as your name, email, phone number, website and message.</li><li>The website address and email you send us when you request a free SEO audit.</li><li>Basic analytics data such as pages visited, device and approximate location, collected through cookies if analytics is enabled.</li></ul><h2>How we use it</h2><ul><li>To reply to your enquiry and provide our services.</li><li>To send newsletters you subscribed to (you can unsubscribe at any time).</li><li>To improve our website and services.</li></ul><h2>Sharing</h2><p>We do not sell your personal information. We only share it with service providers that help us run our business (for example hosting and email), under confidentiality obligations.</p><h2>Your rights</h2><p>You can ask us to access, correct or delete your personal data by contacting us.</p><h2>Contact</h2><p>Questions about this policy? Email us at info@medialinkers.pk.</p>" }),
        ],
      },
      {
        title: "Terms & Conditions", slug: "terms-conditions", system: false, schemaType: "WebPage",
        seo: { metaDescription: "Terms and conditions for using the Media Linkers website and services." },
        sections: [
          sec("pageHero", { title: "Terms & *Conditions*", eyebrow: "Legal" }),
          sec("richText", { content: "<p><em>Last updated: November 2026</em></p><p>By using medialinkers.pk you agree to these terms.</p><h2>Use of the website</h2><p>The content on this website is for general information. You may not copy or reuse it without permission.</p><h2>Free SEO audits</h2><p>Free audits are prepared by our team as guidance and do not guarantee rankings.</p><h2>Services</h2><p>Paid services are governed by the proposal or agreement signed with each client, including scope, pricing and payment terms.</p><h2>Liability</h2><p>We are not liable for any indirect loss arising from the use of this website.</p><h2>Contact</h2><p>For any questions, contact info@medialinkers.pk.</p>" }),
        ],
      },
    ];
    await Page.insertMany(pages);
    console.log("Pages created");
  }

  /* ---------- Redirects from old WordPress URLs ---------- */
  if (!(await Redirect.exists({}))) {
    await Redirect.insertMany([
      { from: "/news", to: "/blog" },
      { from: "/hello-world", to: "/blog" },
      { from: "/best-digital-maketing-agency-pakistan", to: "/" },
      { from: "/contact", to: "/contact-us" },
      { from: "/about", to: "/about-us" },
    ]);
    console.log("Redirects created");
  }

  /* ---------- Case studies (with proof screenshots from ../case studies) ---------- */
  console.log("Case studies:");
  await importCaseStudies();

  await mongoose.disconnect();
  console.log("Seed complete ✔");
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
