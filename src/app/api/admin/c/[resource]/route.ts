import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB, toPlain } from "@/lib/db";
import { RESOURCES } from "@/lib/admin-resources";
import { revalidateSite } from "@/lib/revalidate";
import { errorResponse } from "@/lib/api-error";

type Ctx = { params: Promise<{ resource: string }> };

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request, { params }: Ctx) {
  const { resource } = await params;
  const r = RESOURCES[resource];
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const g = await requireUser(r.adminOnly ? "admin" : undefined);
  if (g.error) return g.error;

  await connectDB();
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(500, Math.max(1, Number(url.searchParams.get("limit")) || 50));
  const q = String(url.searchParams.get("q") || "").trim();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (q) filter.$or = r.search.map((f) => ({ [f]: { $regex: escapeRegex(q), $options: "i" } }));
  const parent = url.searchParams.get("parent");
  if (resource === "services" && parent === "none") filter.parent = null;
  else if (resource === "services" && parent && /^[a-f0-9]{24}$/.test(parent)) filter.parent = parent;
  for (const f of r.filters || []) {
    const v = url.searchParams.get(f);
    if (v) filter[f] = String(v);
  }

  let query = r.model.find(filter).sort(r.sort || { createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  if (r.listFields && url.searchParams.get("full") !== "1") query = query.select(r.listFields);
  for (const [path, select] of r.populate || []) query = query.populate(path, select);

  const [items, total] = await Promise.all([query.lean(), r.model.countDocuments(filter)]);
  return NextResponse.json({ items: toPlain(items), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}

export async function POST(req: Request, { params }: Ctx) {
  const { resource } = await params;
  const r = RESOURCES[resource];
  if (!r || r.readOnly) return NextResponse.json({ error: "Not allowed" }, { status: 404 });
  const g = await requireUser(r.adminOnly ? "admin" : undefined);
  if (g.error) return g.error;

  await connectDB();
  try {
    let body = await req.json();
    delete body._id;
    if (r.prepare) body = await r.prepare(body, { session: g.session });
    const doc = await r.model.create(body);
    revalidateSite();
    return NextResponse.json({ item: toPlain(doc.toObject()) }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
