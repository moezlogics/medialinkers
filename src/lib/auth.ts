import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "./db";
import { User } from "./models";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./session";

/** Session from the cookie, re-checked against the database (user must still exist and be active). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  await connectDB();
  const user = await User.findById(session.sub).select("name email role active").lean<{ name: string; email: string; role: "admin" | "editor"; active: boolean }>();
  if (!user || !user.active) return null;
  return { sub: session.sub, name: user.name, email: user.email, role: user.role };
}

type Guard = { session: SessionPayload; error?: undefined } | { session?: undefined; error: NextResponse };

/** Use at the top of every admin API route. */
export async function requireUser(role?: "admin"): Promise<Guard> {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (role === "admin" && session.role !== "admin") {
    return { error: NextResponse.json({ error: "Only admins can do this" }, { status: 403 }) };
  }
  return { session };
}
