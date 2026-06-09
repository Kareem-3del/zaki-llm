import { NextRequest } from "next/server";
import { checkAuth, openaiError, CORS_HEADERS, ZAKI_ALIASES } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// OpenAI-compatible model list. Lets SDKs/clients discover the available "zaki-*" models.
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return openaiError("Incorrect API key provided.", "invalid_request_error", "invalid_api_key", 401);
  }
  const created = Math.floor(Date.now() / 1000);
  const data = ZAKI_ALIASES.map((a) => ({
    id: a.id,
    object: "model",
    created,
    owned_by: "zaki",
    description: a.description,
  }));
  return new Response(JSON.stringify({ object: "list", data }), {
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}
