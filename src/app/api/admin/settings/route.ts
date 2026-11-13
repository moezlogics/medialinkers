import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Setting } from "@/lib/models";
import { defaultSettings, deepMerge } from "@/lib/settings-defaults";
import { revalidateSite } from "@/lib/revalidate";
import type { SiteSettings } from "@/lib/types";

const MASK = "••••••••";

export async function GET() {
  const g = await requireUser("admin");
  if (g.error) return g.error;
  await connectDB();
  const doc = await Setting.findOne({ key: "site" }).lean<{ data: Partial<SiteSettings> }>();
  const data = deepMerge(defaultSettings, doc?.data ?? {});
  if (data.smtp.pass) data.smtp.pass = MASK;
  return NextResponse.json({ settings: data });
}

export async function PUT(req: Request) {
  const g = await requireUser("admin");
  if (g.error) return g.error;
  await connectDB();
  const body = (await req.json()) as SiteSettings;
  const current = await Setting.findOne({ key: "site" }).lean<{ data: Partial<SiteSettings> }>();
  // Keep the stored SMTP password when the masked value comes back unchanged
  if (body.smtp?.pass === MASK) body.smtp.pass = current?.data?.smtp?.pass || "";
  const merged = deepMerge(defaultSettings, body);
  await Setting.updateOne({ key: "site" }, { $set: { data: merged } }, { upsert: true });
  revalidateSite();
  if (merged.smtp.pass) merged.smtp.pass = MASK;
  return NextResponse.json({ settings: merged });
}
