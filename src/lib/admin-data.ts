import "server-only";
import { notFound, redirect } from "next/navigation";
import type { Model } from "mongoose";
import { connectDB, toPlain } from "./db";
import { getSession } from "./auth";

/** Loads a document for an admin editor page. `id === "new"` returns null (create mode). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadForEdit<T>(model: Model<any>, id: string): Promise<T | null> {
  const session = await getSession();
  if (!session) redirect("/newlogin");
  if (id === "new") return null;
  if (!/^[a-f0-9]{24}$/.test(id)) notFound();
  await connectDB();
  const doc = await model.findById(id).lean();
  if (!doc) notFound();
  return toPlain<T>(doc);
}

export async function requireAdminPage() {
  const session = await getSession();
  if (!session) redirect("/newlogin");
  if (session.role !== "admin") redirect("/newlogin?denied=1");
  return session;
}
