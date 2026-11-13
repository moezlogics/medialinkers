import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { cleanText } from "@/lib/sanitize";

export async function GET() {
  const g = await requireUser();
  if (g.error) return g.error;
  await connectDB();
  const u = await User.findById(g.session.sub).select("bio avatar").lean<{ bio?: string; avatar?: string }>();
  return NextResponse.json({ user: { ...g.session, bio: u?.bio || "", avatar: u?.avatar || "" } });
}

/** Update own name / avatar / password. Changing password needs the current one. */
export async function PUT(req: Request) {
  const g = await requireUser();
  if (g.error) return g.error;
  await connectDB();
  const body = await req.json();
  const user = await User.findById(g.session.sub).select("+passwordHash");
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (body.name) user.name = cleanText(body.name);
  if (body.avatar !== undefined) user.avatar = String(body.avatar);
  if (body.bio !== undefined) user.bio = cleanText(body.bio);
  if (body.newPassword) {
    const ok = await bcrypt.compare(String(body.currentPassword || ""), user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Current password is wrong" }, { status: 400 });
    if (String(body.newPassword).length < 8) return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    user.passwordHash = await bcrypt.hash(String(body.newPassword), 12);
  }
  await user.save();
  return NextResponse.json({ ok: true });
}
