# Media Linkers — website + CMS

Next.js 16 · React 19 · Tailwind CSS 4 · MongoDB (Mongoose 9) · TipTap 3 editor · WebGL (no 3D library)

## Run locally

```bash
npm install
npm run seed      # first time only: admin user, settings, services, sub-services, pages, blog, case studies, redirects
npm run dev       # http://localhost:3000
```

Admin panel: **http://localhost:3000/newlogin** — the first admin's email and password are in `.env.local` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). Change the password from *My profile* after the first login.

`npm run seed -- --reset` wipes content (not users or leads) and seeds again.

Existing database from before November 2026? Run `npx tsx scripts/update-2026-11.ts` once: it adds the case studies (with screenshots from `../case studies/`), creates `/case-studies`, adds case studies to the home page and switches every “free audit” link to the new audit request popup. Safe to run more than once; `--refresh` rewrites the case studies from `scripts/case-studies.ts`.

## Environment (`.env.local`)

| Variable | What it is |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string (Atlas or self-hosted) |
| `AUTH_SECRET` | Long random string that signs admin sessions |
| `NEXT_PUBLIC_SITE_URL` | `https://www.medialinkers.pk` in production (used for canonicals, sitemap, schema) |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin account, used by `npm run seed` |

## Deploy (VPS / any Node host)

```bash
npm ci
npm run build
npm run seed      # once, against the production database
npm start         # port 3000 — put Nginx/Caddy with HTTPS in front
```

Uploaded media is stored in MongoDB (GridFS), so the app works on any host, including serverless.

## What the admin can manage

- **Pages** — every page is built from drag-and-drop sections (22 section types), each with its own SEO tab
- **Services & sub-services** — main services (`/seo-services`) and sub-services (`/seo-services/local-seo`) with hero, content, included items, process, results, packages, FAQs and SEO
- **Blog** — rich editor, categories, tags, scheduling, FAQs, cover images, draft preview
- **Case studies** — results, growth chart, before/after numbers, challenge, steps, proof screenshots, client quote, confidential mode, featured on home, linked to services (each service page shows its own case studies)
- **Audit requests** — visitors send their website + email from the popup or audit boxes; the team sees a 24-hour deadline per request, research shortcuts, a ready-made email and “Mark as sent”
- **Testimonials, media library** (auto WebP conversion)
- **Leads** — every contact, quote and newsletter form, with status, notes and CSV export
- **SEO** — health report, global meta defaults, verification codes, robots.txt rules, llms.txt, business schema, redirects
- **Settings** — logo, colours, contact, menu, footer, GA4 / GTM / Meta Pixel, custom code, SMTP alerts (team alert + automatic confirmation email for audit requests), users and roles

## SEO built in

Per-page meta title/description/canonical/robots/Open Graph/Twitter, auto-generated social images (`/og`), JSON-LD (Organization, WebSite, WebPage, BreadcrumbList, Service + Offers, FAQPage, BlogPosting, case study Article, ItemList), XML sitemap with images, robots.txt, RSS (`/feed.xml`), `llms.txt` for AI search, 301 redirects from the old WordPress URLs, ISR caching with instant updates when content is saved, security headers, and `noindex` on the admin panel.

## Notes

- Content edits show on the live site immediately (the cache is cleared on save). Scheduled posts appear within an hour of their publish time.
- Schema changes to `src/lib/models` need a dev-server restart (models are cached between hot reloads).

## Speed notes

- No animation library on the public site: animations are CSS (including scroll-driven ones), icons are rendered on the server, and the mega menu is only added once it is opened.
- The 3D shapes (`src/components/three`) are one small shader. Nothing loads until a section is near the screen; it pauses off screen, renders a still frame for reduced-motion / data-saver users and lowers resolution on slow devices. Shapes match the section (SEO, social, web, contact, audit…) — see `layouts.ts`.
- Admin-only styles are in `src/app/newlogin/admin.css`, so visitors never download them.
