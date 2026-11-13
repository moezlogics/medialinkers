import { connectDB } from "@/lib/db";
import { Media } from "@/lib/models";
import { mediaBucket } from "@/lib/gridfs";

type Ctx = { params: Promise<{ name: string }> };

/** Serves uploaded files from MongoDB GridFS with long-lived caching. */
export async function GET(_req: Request, { params }: Ctx) {
  const { name } = await params;
  await connectDB();
  const doc = await Media.findOne({ filename: String(name) }).lean<{ fileId: string; mime: string; size: number }>();
  if (!doc) return new Response("Not found", { status: 404 });

  const bucket = await mediaBucket();
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    bucket
      .openDownloadStream(doc.fileId as never)
      .on("data", (c: Buffer) => chunks.push(c))
      .on("error", reject)
      .on("end", () => resolve());
  });
  const body = Buffer.concat(chunks);
  const headers: Record<string, string> = {
    "Content-Type": doc.mime || "application/octet-stream",
    "Content-Length": String(body.length),
    "Cache-Control": "public, max-age=31536000, immutable",
  };
  // SVGs can carry scripts: sandbox them when opened directly
  if (doc.mime === "image/svg+xml") headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  return new Response(new Uint8Array(body), { headers });
}
