import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Outfit } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/utils";

// Variable fonts: one file each covers every weight
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const body = Outfit({ variable: "--font-body", subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: s.seo.defaultTitle, template: s.seo.titleTemplate || `%s | ${s.siteName}` },
    description: s.seo.defaultDescription,
    applicationName: s.siteName,
    authors: [{ name: s.siteName, url: SITE_URL }],
    creator: s.siteName,
    publisher: s.siteName,
    formatDetection: { telephone: false, email: false, address: false },
    icons: s.favicon ? { icon: s.favicon, apple: s.favicon } : undefined,
    verification: {
      google: s.seo.googleVerification || undefined,
      other: s.seo.bingVerification ? { "msvalidate.01": s.seo.bingVerification } : undefined,
    },
    alternates: { types: { "application/rss+xml": `${SITE_URL}/feed.xml` } },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b0b0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
