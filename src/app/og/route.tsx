import { ImageResponse } from "next/og";

/** Branded social share image: /og?title=Your+Title */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "Media Linkers").slice(0, 100);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0b0b0f", color: "#fff", position: "relative" }}>
        <div style={{ position: "absolute", right: -120, top: -120, width: 520, height: 520, borderRadius: 999, background: "#ff5a1f", opacity: 0.55, filter: "blur(80px)", display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 22, height: 22, borderRadius: 999, border: "5px solid #0b0b0f", marginRight: -4, display: "flex" }} />
            <div style={{ width: 22, height: 22, borderRadius: 999, border: "5px solid #ff5a1f", display: "flex" }} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, display: "flex" }}>
            Media <span style={{ color: "#ff5a1f", marginLeft: 10 }}>Linkers</span>
          </div>
        </div>
        <div style={{ fontSize: title.length > 60 ? 58 : 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000, display: "flex" }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 26, color: "rgba(255,255,255,.65)" }}>
          <span>medialinkers.pk</span>
          <span style={{ background: "#d4ff3a", color: "#0b0b0f", padding: "10px 22px", borderRadius: 999, fontWeight: 700 }}>Digital Marketing Agency · Since 2008</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } },
  );
}
