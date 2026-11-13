import { NextResponse } from "next/server";
import sharp from "sharp";
import { Readable } from "node:stream";
import { requireUser } from "@/lib/auth";
import { connectDB, toPlain } from "@/lib/db";
import { Media } from "@/lib/models";
import { mediaBucket } from "@/lib/gridfs";
import { slugify } from "@/lib/utils";

const MAX_BYTES = 15 * 1024 * 1024;
const RASTER = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff"];
const PASSTHROUGH = ["image/gif", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon", "application/pdf", "video/mp4", "video/webm"];

export async function GET(req: Request) {
  const g = await requireUser();
  if (g.error) return g.error;
  await connectDB();
  const url = new URL(req.url);
  const q = String(url.searchParams.get("q") || "").trim();
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = 60;
  const filter = q ? { $or: [{ originalName: { $regex: q.replace(/[^\w\s-]/g, ""), $options: "i" } }, { alt: { $regex: q.replace(/[^\w\s-]/g, ""), $options: "i" } }] } : {};
  const [items, total] = await Promise.all([
    Media.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Media.countDocuments(filter),
  ]);
  return NextResponse.json({ items: toPlain(items), total, pages: Math.max(1, Math.ceil(total / limit)) });
}

export async function POST(req: Request) {
  const g = await requireUser();
  if (g.error) return g.error;
  const form = await req.formData();
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const bucket = await mediaBucket();
  const saved = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) return NextResponse.json({ error: `${file.name} is larger than 15 MB` }, { status: 400 });
    const type = file.type || "application/octet-stream";
    if (!RASTER.includes(type) && !PASSTHROUGH.includes(type)) {
      return NextResponse.json({ error: `${file.name}: file type ${type} is not allowed` }, { status: 400 });
    }
    let buf: Buffer = Buffer.from(await file.arrayBuffer());
    let mime = type;
    let ext = (file.name.split(".").pop() || "bin").toLowerCase();
    let width = 0;
    let height = 0;

    if (RASTER.includes(type)) {
      // Resize very large images and convert to WebP for fast pages
      const img = sharp(buf, { failOn: "none" }).rotate().resize({ width: 2400, withoutEnlargement: true });
      const out = await img.webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
      buf = out.data;
      width = out.info.width;
      height = out.info.height;
      mime = "image/webp";
      ext = "webp";
    } else if (type === "image/gif") {
      const meta = await sharp(buf, { animated: true }).metadata().catch(() => null);
      width = meta?.width || 0;
      height = meta?.pageHeight || meta?.height || 0;
    }

    const base = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 60) || "file";
    const filename = `${Date.now().toString(36)}-${base}.${ext}`;
    const fileId = await new Promise<string>((resolve, reject) => {
      const up = bucket.openUploadStream(filename, { metadata: { mime } });
      Readable.from(buf).pipe(up).on("error", reject).on("finish", () => resolve(String(up.id)));
    });
    const doc = await Media.create({
      fileId,
      filename,
      originalName: file.name,
      url: `/media/${filename}`,
      mime,
      size: buf.length,
      width,
      height,
      alt: base.replace(/-/g, " "),
    });
    saved.push(toPlain(doc.toObject()));
  }
  return NextResponse.json({ items: saved }, { status: 201 });
}
