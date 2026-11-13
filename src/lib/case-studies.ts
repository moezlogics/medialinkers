import type { ProjectDoc, ServiceDoc } from "./types";
import { serviceUrl } from "./utils";

export type ServiceLink = { id: string; title: string; short: string; href: string; mainId: string; mainShort: string };

/** id → link for every main service and sub-service. */
export function serviceLinks(services: ServiceDoc[]) {
  const map = new Map<string, ServiceLink>();
  for (const s of services) {
    const short = s.shortTitle || s.title;
    map.set(s._id, { id: s._id, title: s.title, short, href: serviceUrl(s), mainId: s._id, mainShort: short });
    for (const c of s.children || []) {
      map.set(c._id, { id: c._id, title: c.title, short: c.shortTitle || c.title, href: serviceUrl(c, s), mainId: s._id, mainShort: short });
    }
  }
  return map;
}

/** Services a case study used, in a stable order (main services first). */
export function projectServices(p: ProjectDoc, map: Map<string, ServiceLink>) {
  const linked = (p.serviceRefs || []).map((id) => map.get(String(id))).filter(Boolean) as ServiceLink[];
  return linked.sort((a, b) => Number(b.id === b.mainId) - Number(a.id === a.mainId));
}

/** Short labels for chips: linked services, or the free-text tags. */
export function projectTags(p: ProjectDoc, map: Map<string, ServiceLink>) {
  const linked = projectServices(p, map);
  return linked.length ? linked.map((l) => l.short) : p.services || [];
}

/** Public client name, hiding the brand when the client asked for confidentiality. */
export function clientName(p: ProjectDoc) {
  return p.client || p.title;
}

export const CHART_COLORS = ["#d4ff3a", "#5eead4", "#a5b4fc", "#fdba74", "#93c5fd", "#f9a8d4"];

export function accentFor(p: ProjectDoc, i = 0) {
  return p.accent || CHART_COLORS[i % CHART_COLORS.length];
}
