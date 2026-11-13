"use client";

import { Star } from "lucide-react";
import ModalCrud from "@/components/admin/ModalCrud";
import { StatusBadge } from "@/components/admin/ResourceTable";

export default function TestimonialsPage() {
  return (
    <ModalCrud
      resource="testimonials"
      title="Testimonials"
      singular="testimonial"
      description="Client reviews shown in every Testimonials section across the site."
      defaults={{ name: "", role: "", company: "", location: "", quote: "", rating: "5", avatar: "", order: 0, status: "published" }}
      load={(t) => ({ ...t, rating: String(t.rating || 5) })}
      prepare={(t) => ({ ...t, rating: Number(t.rating) || 5 })}
      filters={[{ key: "status", label: "Statuses", options: [{ value: "published", label: "Published" }, { value: "draft", label: "Hidden" }] }]}
      fields={[
        { name: "name", label: "Client name", type: "text" },
        { name: "company", label: "Company", type: "text" },
        { name: "role", label: "Role / title", type: "text" },
        { name: "location", label: "City", type: "text" },
        { name: "quote", label: "Review", type: "textarea" },
        { name: "rating", label: "Stars", type: "select", options: ["5", "4", "3"].map((v) => ({ value: v, label: `${v} stars` })) },
        { name: "status", label: "Status", type: "select", options: [{ value: "published", label: "Published" }, { value: "draft", label: "Hidden" }] },
        { name: "order", label: "Order", type: "number" },
        { name: "avatar", label: "Photo (optional)", type: "image" },
      ]}
      columns={[
        { key: "name", label: "Client" },
        { key: "quote", label: "Review", render: (t) => <span className="line-clamp-1 max-w-md text-xs text-ink/60">“{t.quote}”</span> },
        { key: "rating", label: "Rating", hideOnMobile: true, render: (t) => <span className="flex text-accent">{Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} className="size-3 fill-current" />)}</span> },
        { key: "status", label: "Status", render: (t) => <StatusBadge status={t.status} /> },
      ]}
    />
  );
}
