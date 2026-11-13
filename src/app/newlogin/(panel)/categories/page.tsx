"use client";

import ModalCrud from "@/components/admin/ModalCrud";
import { slugify } from "@/lib/utils";

export default function CategoriesPage() {
  return (
    <ModalCrud
      resource="categories"
      title="Categories"
      singular="category"
      description="Blog categories get their own page at /blog/category/name."
      defaults={{ name: "", slug: "", description: "", metaTitle: "", metaDescription: "" }}
      load={(c) => ({ ...c, metaTitle: c.seo?.metaTitle || "", metaDescription: c.seo?.metaDescription || "" })}
      prepare={({ metaTitle, metaDescription, ...c }) => ({ ...c, slug: c.slug || slugify(c.name), seo: { ...(c.seo || {}), metaTitle, metaDescription } })}
      fields={[
        { name: "name", label: "Name", type: "text" },
        { name: "slug", label: "URL slug", type: "text", help: "Leave empty to create it from the name" },
        { name: "description", label: "Description", type: "textarea", help: "Shown on the category page and used as its meta description." },
        { name: "metaTitle", label: "Meta title (optional)", type: "text", full: true },
        { name: "metaDescription", label: "Meta description (optional)", type: "textarea" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "URL", render: (c) => <span className="font-mono text-xs text-ink/60">/blog/category/{c.slug}</span> },
        { key: "description", label: "Description", hideOnMobile: true, render: (c) => <span className="line-clamp-1 text-xs text-ink/60">{c.description}</span> },
      ]}
    />
  );
}
