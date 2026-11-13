import type { PageDoc, ServiceDoc, SiteSettings } from "@/lib/types";

export type SectionCtx = {
  settings: SiteSettings;
  services: ServiceDoc[];
  page?: PageDoc;
  path: string;
  headingAs: "h1" | "h2";
  blogPage?: number;
  blogCategory?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionProps<T = Record<string, any>> = { data: T; ctx: SectionCtx };

export type Link = { label?: string; href?: string };
