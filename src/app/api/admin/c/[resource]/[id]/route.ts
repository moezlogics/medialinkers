import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB, toPlain } from "@/lib/db";
import { RESOURCES } from "@/lib/admin-resources";
import { revalidateSite } from "@/lib/revalidate";
import { errorResponse } from "@/lib/api-error";

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function load(params: Ctx["params"]) {
  const { resource, id } = await params;
  const r = RESOURCES[resource];
  if (!r) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) } as const;
  const g = await requireUser(r.adminOnly ? "admin" : undefined);
  if (g.error) return { error: g.error } as const;
  await connectDB();
  return { r, id, session: g.session } as const;
}

export async function GET(_req: Request, { params }: Ctx) {
  const l = await load(params);
  if ("error" in l) return l.error;
  try {
    const doc = await l.r.model.findById(l.id).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: toPlain(doc) });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  const l = await load(params);
  if ("error" in l) return l.error;
  if (l.r.readOnly) return NextResponse.json({ error: "Read only" }, { status: 405 });
  try {
    const doc = await l.r.model.findById(l.id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    let body = await req.json();
    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;
    delete body.system;
    delete body.__v; // stale version numbers from an older copy would make the save fail
    if (l.r.prepare) body = await l.r.prepare(body, { session: l.session, existing: doc });
    doc.set(body);
    await doc.save();
    revalidateSite();
    const out = doc.toObject();
    delete out.passwordHash;
    return NextResponse.json({ item: toPlain(out) });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const l = await load(params);
  if ("error" in l) return l.error;
  try {
    const doc = await l.r.model.findById(l.id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const blocked = await l.r.canDelete?.(doc, l.session);
    if (blocked) return NextResponse.json({ error: blocked }, { status: 400 });
    await doc.deleteOne();
    revalidateSite();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
