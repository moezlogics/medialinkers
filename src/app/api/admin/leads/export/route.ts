import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Lead } from "@/lib/models";

function csvCell(v: unknown) {
  let s = v == null ? "" : String(v);
  // Prevent spreadsheet formula injection
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const g = await requireUser();
  if (g.error) return g.error;
  await connectDB();
  const url = new URL(req.url);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");
  if (type) filter.type = String(type);
  if (status) filter.status = String(status);
  const leads = await Lead.find(filter).sort({ createdAt: -1 }).lean();
  const cols = ["createdAt", "type", "status", "name", "email", "phone", "company", "website", "service", "budget", "message", "notes", "sourcePage"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = [cols.join(","), ...leads.map((l: any) => cols.map((c) => csvCell(c === "createdAt" ? new Date(l[c]).toISOString() : l[c])).join(","))];
  return new Response("﻿" + rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
