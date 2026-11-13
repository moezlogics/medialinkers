import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getSession } from "@/lib/auth";
import { AuditRequest, Lead } from "@/lib/models";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/newlogin");
  const [newLeads, openAudits] = await Promise.all([Lead.countDocuments({ status: "new" }), AuditRequest.countDocuments({ status: { $in: ["new", "in_progress"] } })]);
  return (
    <AdminShell user={{ name: session.name, email: session.email, role: session.role }} newLeads={newLeads} openAudits={openAudits}>
      {children}
    </AdminShell>
  );
}
