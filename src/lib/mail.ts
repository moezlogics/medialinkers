import "server-only";
import nodemailer from "nodemailer";
import { connectDB } from "./db";
import { Setting } from "./models";
import { defaultSettings, deepMerge } from "./settings-defaults";
import type { SiteSettings } from "./types";
import { SITE_URL } from "./utils";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** SMTP transport from Settings, or null when email is not configured yet. */
async function mailer() {
  await connectDB();
  const doc = await Setting.findOne({ key: "site" }).lean<{ data: Partial<SiteSettings> }>();
  const s = deepMerge(defaultSettings, doc?.data ?? {});
  const { host, port, secure, user, pass, from, notifyTo } = s.smtp;
  if (!host) return null;
  const transport = nodemailer.createTransport({ host, port: Number(port) || 587, secure: !!secure, auth: user ? { user, pass } : undefined });
  return { transport, from: from || user, notifyTo, settings: s };
}

function table(data: Record<string, unknown>) {
  return Object.entries(data)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#666;text-transform:capitalize">${esc(k)}</td><td style="padding:6px 12px"><b>${esc(String(v))}</b></td></tr>`)
    .join("");
}

/** Emails the team about a new lead. Does nothing when SMTP is not configured in Settings. */
export async function notifyLead(lead: Record<string, unknown>) {
  try {
    const m = await mailer();
    if (!m?.notifyTo) return;
    const rest = Object.fromEntries(Object.entries(lead).filter(([k]) => k !== "ip" && k !== "userAgent"));
    await m.transport.sendMail({
      from: m.from,
      to: m.notifyTo,
      replyTo: typeof lead.email === "string" && lead.email ? lead.email : undefined,
      subject: `New ${lead.type || "contact"} lead — ${lead.name || lead.email || "Website"}`,
      html: `<div style="font-family:Arial,sans-serif"><h2>New lead from ${esc(m.settings.siteName)}</h2><table>${table(rest)}</table></div>`,
    });
  } catch (e) {
    console.error("Lead email failed:", (e as Error).message);
  }
}

/**
 * New audit request: tells the team (with the 24-hour deadline) and sends the visitor a
 * friendly confirmation so they know a real person is on it.
 */
export async function notifyAuditRequest(req: { website: string; domain: string; email: string; name?: string; phone?: string; dueAt: Date; sourcePage?: string }) {
  try {
    const m = await mailer();
    if (!m) return;
    const due = req.dueAt.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" });
    const jobs: Promise<unknown>[] = [];
    if (m.notifyTo) {
      jobs.push(
        m.transport.sendMail({
          from: m.from,
          to: m.notifyTo,
          replyTo: req.email,
          subject: `Audit request — ${req.domain} (due ${due})`,
          html: `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2 style="margin:0 0 8px">New free SEO audit request</h2>
<p style="margin:0 0 12px;color:#444">Please email the audit to the client before <b>${esc(due)}</b> (PKT).</p>
<table>${table({ website: req.website, email: req.email, name: req.name, phone: req.phone, page: req.sourcePage })}</table>
<p><a href="${SITE_URL}/newlogin/audit-requests" style="display:inline-block;background:#0b0b0f;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none">Open audit requests</a></p></div>`,
        }),
      );
    }
    const site = m.settings.siteName || "Media Linkers";
    const contact = m.settings.contact;
    jobs.push(
      m.transport.sendMail({
        from: m.from,
        to: req.email,
        replyTo: m.notifyTo || undefined,
        subject: `We’re auditing ${req.domain} — your report arrives within 24 hours`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0b0b0f;line-height:1.6">
<div style="background:#0b0b0f;color:#fff;border-radius:20px;padding:28px">
<p style="margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.6">${esc(site)}</p>
<h1 style="margin:10px 0 6px;font-size:26px;line-height:1.2">Your free SEO audit is in progress</h1>
<p style="margin:0;opacity:.75">Website: <b>${esc(req.website)}</b></p></div>
<p style="margin:22px 0 8px">Thanks for your request! One of our SEO specialists is now reviewing your website by hand — not with an automated tool.</p>
<p style="margin:0 0 8px">Within <b>24 hours</b> you’ll receive a clear report covering:</p>
<ul style="margin:0 0 16px;padding-left:18px"><li>Technical health, speed and Core Web Vitals</li><li>On-page SEO and content gaps</li><li>Keyword and competitor opportunities</li><li>Backlink profile and local/AI search visibility</li><li>A prioritised action plan</li></ul>
<p style="margin:0 0 16px">Have a question in the meantime? Just reply to this email${contact.whatsapp ? ` or WhatsApp us on ${esc(contact.whatsapp)}` : ""}.</p>
<p style="margin:0;color:#666">— Team ${esc(site)}<br><a href="${SITE_URL}" style="color:#0b0b0f">${esc(SITE_URL.replace(/^https?:\/\//, ""))}</a></p></div>`,
      }),
    );
    await Promise.allSettled(jobs);
  } catch (e) {
    console.error("Audit request email failed:", (e as Error).message);
  }
}
