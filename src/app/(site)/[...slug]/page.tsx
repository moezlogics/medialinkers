import type { Metadata } from "next";
import { cache } from "react";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import PageView from "@/components/site/PageView";
import ServiceView from "@/components/site/ServiceView";
import { getPage, getRedirect, getService, getServiceById, getServices, getSettings } from "@/lib/data";
import { isPreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";
import { serviceUrl } from "@/lib/utils";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  // Pages are rendered on first visit and cached (ISR), so the build doesn't depend on the database.
  return [];
}

type Props = { params: Promise<{ slug: string[] }> };

/**
 * One route serves three kinds of URLs:
 *   /about-us                  → CMS page
 *   /seo-services              → main service
 *   /seo-services/local-seo    → sub-service (nested under its main service)
 * Anything else is checked against the redirects table, then 404s.
 */
const resolve = cache(async (path: string, preview: boolean) => {
  const page = await getPage(path, preview);
  if (page) return { kind: "page" as const, page };

  const segments = path.split("/");
  if (segments.length <= 2) {
    const service = await getService(segments[segments.length - 1], preview);
    if (service) {
      const services = await getServices();
      const parent = service.parent ? services.find((p) => p._id === service.parent) || (preview ? await getServiceById(service.parent) : null) : null;
      if (segments.length === 1) {
        if (!service.parent) {
          const children = services.find((p) => p._id === service._id)?.children || [];
          return { kind: "service" as const, service: { ...service, children }, parent: null, services };
        }
        // A sub-service opened at the root is sent to its canonical nested URL
        if (parent) return { kind: "redirect" as const, to: serviceUrl(service, parent), code: 301 };
      } else if (parent && parent.slug === segments[0]) {
        return { kind: "service" as const, service, parent, services };
      }
    }
  }

  const r = await getRedirect(path);
  if (r) return { kind: "redirect" as const, to: r.to, code: r.code };
  return { kind: "none" as const };
});

function toPath(slug: string[]) {
  return slug.map((s) => decodeURIComponent(s)).join("/").toLowerCase();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = toPath(slug);
  const [settings, found] = await Promise.all([getSettings(), resolve(path, await isPreview())]);
  if (found.kind === "page") return buildMetadata(settings, { seo: found.page.seo, title: found.page.title, path: `/${path}` });
  if (found.kind === "service") {
    const { service, parent } = found;
    return buildMetadata(settings, { seo: service.seo, title: service.title, description: service.excerpt, path: serviceUrl(service, parent), image: service.image });
  }
  return { title: "Page not found", robots: { index: false } };
}

export default async function CatchAllPage({ params }: Props) {
  const { slug } = await params;
  const found = await resolve(toPath(slug), await isPreview());

  if (found.kind === "page") return <PageView page={found.page} />;
  if (found.kind === "service") {
    const settings = await getSettings();
    return <ServiceView service={found.service} parent={found.parent} services={found.services} settings={settings} />;
  }
  if (found.kind === "redirect") {
    if (found.code === 302) redirect(found.to);
    permanentRedirect(found.to);
  }
  notFound();
}
