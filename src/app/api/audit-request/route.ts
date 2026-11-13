import { NextResponse, after } from "next/server";
import { connectDB } from "@/lib/db";
import { AuditRequest } from "@/lib/models";
import { cleanText } from "@/lib/sanitize";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { notifyAuditRequest } from "@/lib/mail";

const DAY = 24 * 60 * 60 * 1000;

/** "Example.com/page" → { url: "https://example.com/page", domain: "example.com" } */
function parseWebsite(raw: string) {
  const v = raw.trim().replace(/\s+/g, "");
  if (!v || v.length > 300) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    // A real public domain: has a dot, letters in the TLD, no IP addresses
    if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(host)) return null;
    return { url: `${u.protocol}//${u.hostname.toLowerCase()}${u.pathname === "/" ? "" : u.pathname}`, domain: host };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const ip = await clientIp();
  if (!rateLimit(`audit-req:${ip}`, 5, 60 * 60_000)) {
    return NextResponse.json({ error: "You’ve sent a few requests already. Please try again in an hour, or message us on WhatsApp." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  // Honeypot field: real people never fill it
  if (body.company_website) return NextResponse.json({ ok: true });

  const site = parseWebsite(cleanText(body.website));
  if (!site) return NextResponse.json({ error: "Please enter a valid website, e.g. yourbusiness.com", field: "website" }, { status: 400 });
  const email = cleanText(body.email).toLowerCase().slice(0, 160);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address", field: "email" }, { status: 400 });
  }

  await connectDB();
  // Same site + email within a day: don't create a duplicate, just reassure
  const recent = await AuditRequest.exists({ domain: site.domain, email, createdAt: { $gte: new Date(Date.now() - DAY) } });
  if (recent) return NextResponse.json({ ok: true, duplicate: true, domain: site.domain });

  const doc = {
    website: site.url,
    domain: site.domain,
    email,
    name: cleanText(body.name).slice(0, 120),
    phone: cleanText(body.phone).slice(0, 40),
    sourcePage: cleanText(body.sourcePage).slice(0, 300),
    dueAt: new Date(Date.now() + DAY),
    ip,
    userAgent: (req.headers.get("user-agent") || "").slice(0, 300),
  };
  await AuditRequest.create(doc);
  after(() => notifyAuditRequest(doc));
  return NextResponse.json({ ok: true, domain: site.domain });
}
