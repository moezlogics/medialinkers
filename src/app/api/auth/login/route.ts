import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { SESSION_COOKIE, SESSION_DAYS, signSession } from "@/lib/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 10, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");
  if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

  await connectDB();
  const user = await User.findOne({ email }).select("+passwordHash +failedLogins +lockUntil");
  const fail = NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  if (!user || !user.active) return fail;

  if (user.lockUntil && user.lockUntil > new Date()) {
    return NextResponse.json({ error: "Account locked for 15 minutes after too many failed attempts." }, { status: 423 });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    user.failedLogins = (user.failedLogins || 0) + 1;
    if (user.failedLogins >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60_000);
      user.failedLogins = 0;
    }
    await user.save();
    return fail;
  }
  user.failedLogins = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();
  await user.save();

  const token = await signSession({ sub: String(user._id), role: user.role, name: user.name, email: user.email });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return res;
}
