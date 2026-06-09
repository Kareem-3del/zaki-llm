import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, createSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }
  const username = (body.username || "").trim();
  const password = body.password || "";
  if (!username || !password) {
    return NextResponse.json({ error: "أدخل اسم المستخدم وكلمة المرور" }, { status: 400 });
  }

  const ok = await verifyCredentials(username, password);
  if (!ok) {
    return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
  }

  const token = await createSession(username);
  const res = NextResponse.json({ ok: true, user: username });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
