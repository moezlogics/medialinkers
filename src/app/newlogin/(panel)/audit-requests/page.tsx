import { connectDB } from "@/lib/db";
import { AuditRequest } from "@/lib/models";
import AuditRequestsClient from "./AuditRequestsClient";

export const dynamic = "force-dynamic";

export default async function AuditRequestsPage() {
  await connectDB();
  const now = new Date();
  const open = { status: { $in: ["new", "in_progress"] } };
  const [openCount, overdue, dueSoon, sentWeek, total] = await Promise.all([
    AuditRequest.countDocuments(open),
    AuditRequest.countDocuments({ ...open, dueAt: { $lt: now } }),
    AuditRequest.countDocuments({ ...open, dueAt: { $gte: now, $lt: new Date(now.getTime() + 6 * 3600_000) } }),
    AuditRequest.countDocuments({ sentAt: { $gte: new Date(now.getTime() - 7 * 86400_000) } }),
    AuditRequest.countDocuments(),
  ]);
  return <AuditRequestsClient counts={{ open: openCount, overdue, dueSoon, sentWeek, total }} />;
}
