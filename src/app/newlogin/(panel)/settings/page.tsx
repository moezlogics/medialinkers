import SettingsForm from "@/components/admin/SettingsForm";
import { requireAdminPage } from "@/lib/admin-data";

export default async function SettingsPage() {
  await requireAdminPage();
  return <SettingsForm mode="settings" />;
}
