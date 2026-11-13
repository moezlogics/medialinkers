import { NextResponse } from "next/server";
import { after } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/lib/models";
import { cleanText } from "@/lib/sanitize";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { notifyLead } from "@/lib/mail";

const TYPES = ["contact", "quote", "newsletter"];

export async function POST(req: Request) {
  const ip = await clientIp();
  if (!rateLimit(`lead:${ip}`, 8, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  // Honeypot field: real people never fill it
  if (body.company_website) return NextResponse.json({ ok: true });

  const lead = {
    type: TYPES.includes(body.type) ? body.type : "contact",
    name: cleanText(body.name).slice(0, 120),
    email: cleanText(body.email).toLowerCase().slice(0, 160),
    phone: cleanText(body.phone).slice(0, 40),
    company: cleanText(body.company).slice(0, 120),
    website: cleanText(body.website).slice(0, 300),
    service: cleanText(body.service).slice(0, 120),
    budget: cleanText(body.budget).slice(0, 60),
    message: cleanText(body.message).slice(0, 5000),
    sourcePage: cleanText(body.sourcePage).slice(0, 300),
    ip,
    userAgent: (req.headers.get("user-agent") || "").slice(0, 300),
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  if (lead.type !== "newsletter" && !lead.name) {
    return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  }

  await connectDB();
  if (lead.type === "newsletter") {
    const exists = await Lead.exists({ type: "newsletter", email: lead.email });
    if (exists) return NextResponse.json({ ok: true, message: "You're already subscribed!" });
  }
  await Lead.create(lead);
  after(() => notifyLead(lead));
  return NextResponse.json({ ok: true });
}
