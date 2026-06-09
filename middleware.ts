import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

/**
 * Auth gate for the human-facing app.
 *  - /playground, /admin   → require a valid session cookie (redirect to /login)
 *  - /api/chat             → require a valid session (401 JSON)
 * The public /v1 API is guarded separately by its Bearer API key (lib/openai.ts).
 */
const PROTECTED_PAGES = [/^\/playground(\/|$)/, /^\/admin(\/|$)/];
const PROTECTED_API = [/^\/api\/chat(\/|$)/];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (PROTECTED_API.some((re) => re.test(pathname))) {
    if (!session) {
      return new NextResponse(JSON.stringify({ error: "unauthorized", detail: "تسجيل الدخول مطلوب." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return NextResponse.next();
  }

  if (PROTECTED_PAGES.some((re) => re.test(pathname))) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    // gate /admin to the admin user only
    if (/^\/admin(\/|$)/.test(pathname) && session.user !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/playground";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/playground/:path*", "/admin/:path*", "/api/chat/:path*"],
};
