import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/data";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  return {
    name: s.siteName,
    short_name: s.siteName,
    description: s.seo.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f2ec",
    theme_color: "#0b0b0f",
    icons: [{ src: s.favicon || "/icon.svg", sizes: "any", type: s.favicon ? undefined : "image/svg+xml" }],
  };
}
