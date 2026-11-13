import ServiceEditor from "@/components/admin/editors/ServiceEditor";
import { loadForEdit } from "@/lib/admin-data";
import { getSettings } from "@/lib/data";
import { Service } from "@/lib/models";
import type { ServiceDoc } from "@/lib/types";

export default async function EditService({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [service, settings] = await Promise.all([loadForEdit<ServiceDoc>(Service, id), getSettings()]);
  return <ServiceEditor key={service?._id || "new"} initial={service} titleTemplate={settings.seo.titleTemplate} />;
}
