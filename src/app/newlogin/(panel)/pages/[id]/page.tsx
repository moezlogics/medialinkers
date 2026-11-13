import PageEditor from "@/components/admin/editors/PageEditor";
import { loadForEdit } from "@/lib/admin-data";
import { getSettings } from "@/lib/data";
import { Page } from "@/lib/models";
import type { PageDoc } from "@/lib/types";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [page, settings] = await Promise.all([loadForEdit<PageDoc>(Page, id), getSettings()]);
  return <PageEditor key={page?._id || "new"} initial={page} titleTemplate={settings.seo.titleTemplate} />;
}
