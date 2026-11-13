import { getPosts, getServices, getSettings } from "@/lib/data";
import { absUrl } from "@/lib/utils";

export const revalidate = 3600;

/** llms.txt — a plain summary of the site for AI search engines (AEO). Editable in Admin > SEO. */
export async function GET() {
  const [s, services, { posts }] = await Promise.all([getSettings(), getServices(), getPosts({ limit: 20 })]);
  const body =
    s.seo.llmsTxt?.trim() ||
    [
      `# ${s.siteName}`,
      "",
      `> ${s.seo.defaultDescription}`,
      "",
      `${s.siteName} is a digital marketing agency in ${s.contact.city || "Pakistan"}, founded in ${s.organization.foundingYear}. Contact: ${s.contact.email} · ${s.contact.phone}`,
      "",
      "## Services",
      ...services.flatMap((x) => [
        `- [${x.title}](${absUrl(`/${x.slug}`)}): ${x.excerpt}`,
        ...(x.children || []).map((c) => `  - [${c.title}](${absUrl(`/${x.slug}/${c.slug}`)}): ${c.excerpt}`),
      ]),
      "",
      "## Key pages",
      `- [About](${absUrl("/about-us")})`,
      `- [Pricing](${absUrl("/pricing")})`,
      `- [Case Studies](${absUrl("/case-studies")})`,
      `- [Contact](${absUrl("/contact-us")})`,
      "",
      "## Blog",
      ...posts.map((p) => `- [${p.title}](${absUrl(`/blog/${p.slug}`)}): ${p.excerpt}`),
    ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
