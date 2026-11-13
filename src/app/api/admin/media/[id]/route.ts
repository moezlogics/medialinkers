import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB, toPlain } from "@/lib/db";
import { Media } from "@/lib/models";
import { mediaBucket } from "@/lib/gridfs";
import { cleanText } from "@/lib/sanitize";
import { errorResponse } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const g = await requireUser();
  if (g.error) return g.error;
  const { id } = await params;
  await connectDB();
  try {
    const body = await req.json();
    const doc = await Media.findByIdAndUpdate(id, { alt: cleanText(body.alt), title: cleanText(body.title) }, { new: true }).lean();
    return NextResponse.json({ item: toPlain(doc) });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await requireUser();
  if (g.error) return g.error;
  const { id } = await params;
  await connectDB();
  try {
    const doc = await Media.findById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const bucket = await mediaBucket();
    await bucket.delete(doc.fileId).catch(() => {});
    await doc.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
