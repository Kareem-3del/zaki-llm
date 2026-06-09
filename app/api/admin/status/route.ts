import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE, AUTH_SECRET } from "@/lib/auth";
import {
  OLLAMA_BASE_URL,
  ZAKI_MODEL,
  ZAKI_CODE_MODEL,
  ZAKI_VISION_MODEL,
  ZAKI_COMPANION_MODEL,
} from "@/lib/llm";
import { ZAKI_API_KEY, ZAKI_ALIASES } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session || session.user !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let installed: string[] = [];
  let ollamaUp = false;
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (res.ok) {
      ollamaUp = true;
      const data = (await res.json()) as { models?: { model?: string; name?: string }[] };
      installed = (data.models || []).map((m) => m.model || m.name || "");
    }
  } catch {
    ollamaUp = false;
  }

  const ready = (name: string) => installed.some((n) => n === name || n.startsWith(name));
  const roles = [
    { role: "تحليل / صياغة", model: ZAKI_MODEL },
    { role: "برمجة", model: ZAKI_CODE_MODEL },
    { role: "رؤية (صور)", model: ZAKI_VISION_MODEL },
    { role: "ودّي", model: ZAKI_COMPANION_MODEL },
  ].map((r) => ({ ...r, ready: ready(r.model) }));

  return NextResponse.json({
    user: session.user,
    ollamaUp,
    ollamaBaseUrl: OLLAMA_BASE_URL,
    roles,
    apiModels: ZAKI_ALIASES.map((a) => a.id),
    apiKeyConfigured: !!ZAKI_API_KEY,
    authSecretIsDefault: AUTH_SECRET === "dev-insecure-secret-change-before-publishing",
  });
}
