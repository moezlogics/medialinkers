import PostEditor from "@/components/admin/editors/PostEditor";
import { loadForEdit } from "@/lib/admin-data";
import { getSettings } from "@/lib/data";
import { Post } from "@/lib/models";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [post, settings] = await Promise.all([loadForEdit<any>(Post, id), getSettings()]);
  return <PostEditor key={post?._id || "new"} initial={post} titleTemplate={settings.seo.titleTemplate} />;
}
