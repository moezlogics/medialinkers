"use client";

import MediaLibrary from "@/components/admin/MediaLibrary";
import { PageHeader } from "@/components/admin/ui";

export default function MediaPage() {
  return (
    <div>
      <PageHeader title="Media library" description="Upload images, PDFs and videos. Images are resized and converted to WebP automatically for fast pages. Always add alt text for SEO." />
      <div className="rounded-2xl border border-line bg-white p-4">
        <MediaLibrary />
      </div>
    </div>
  );
}
