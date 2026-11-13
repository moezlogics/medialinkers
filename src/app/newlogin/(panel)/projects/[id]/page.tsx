import ProjectEditor from "@/components/admin/editors/ProjectEditor";
import { loadForEdit } from "@/lib/admin-data";
import { getSettings } from "@/lib/data";
import { Project } from "@/lib/models";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [project, settings] = await Promise.all([loadForEdit<any>(Project, id), getSettings()]);
  return <ProjectEditor key={project?._id || "new"} initial={project} titleTemplate={settings.seo.titleTemplate} />;
}
