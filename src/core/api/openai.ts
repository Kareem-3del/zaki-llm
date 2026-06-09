/**
 * OpenAI-compatibility layer for Zaki.
 *
 * Goal: expose Zaki behind the SAME contract as the OpenAI API (`/v1/chat/completions`,
 * `/v1/models`) so any OpenAI SDK / LangChain / ChatGPT-compatible client can use Zaki by
 * only changing `base_url` (+ api key) — and can later be pointed back at OpenAI with no
 * code changes. Different Zaki behaviours are exposed as different "model" names.
 */
import type { Mode } from "@/src/core/chat/llm";

/** If set, requests must send `Authorization: Bearer <ZAKI_API_KEY>`. Empty = open (local dev). */
export const ZAKI_API_KEY = process.env.ZAKI_API_KEY || "";

export type ZakiAlias = { id: string; mode: Mode; description: string };

/** Model names advertised via /v1/models. Each maps to a Zaki mode (system prompt + model). */
export const ZAKI_ALIASES: ZakiAlias[] = [
  { id: "zaki", mode: "reason", description: "Zaki — Arabic reasoning & decision support (default)" },
  { id: "zaki-reason", mode: "reason", description: "Zaki — step-by-step Arabic analysis" },
  { id: "zaki-rewrite", mode: "rewrite", description: "Zaki — formal Arabic rewriting" },
  { id: "zaki-code", mode: "code", description: "Zaki — code generation & debugging" },
  { id: "zaki-chat", mode: "companion", description: "Zaki — casual Arabic companion" },
];

export function aliasToMode(model: string | undefined | null): Mode {
  const found = ZAKI_ALIASES.find((a) => a.id === model);
  return found ? found.mode : "reason";
}

/** Bearer-token check. Open when no key configured. */
export function checkAuth(req: Request): boolean {
  if (!ZAKI_API_KEY) return true;
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token === ZAKI_API_KEY;
}

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

/** OpenAI-shaped error response. */
export function openaiError(
  message: string,
  type = "invalid_request_error",
  code: string | null = null,
  status = 400,
): Response {
  return new Response(JSON.stringify({ error: { message, type, param: null, code } }), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

/** OpenAI chat message content can be a string or an array of parts (text + image_url). */
export type OAIPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };
export type OAIContent = string | OAIPart[];

/** Extract plain text + base64 images (from data: URLs) out of OpenAI message content. */
export function extractContent(content: OAIContent): { text: string; images: string[] } {
  if (typeof content === "string") return { text: content, images: [] };
  if (!Array.isArray(content)) return { text: "", images: [] };
  let text = "";
  const images: string[] = [];
  for (const part of content) {
    if (part?.type === "text" && typeof part.text === "string") {
      text += (text ? "\n" : "") + part.text;
    } else if (part?.type === "image_url" && part.image_url?.url) {
      const m = /^data:[^;]+;base64,(.+)$/.exec(part.image_url.url);
      if (m) images.push(m[1]); // remote http(s) URLs are intentionally NOT fetched (SSRF safety)
    }
  }
  return { text, images };
}

export function genId(): string {
  return "chatcmpl-" + Math.random().toString(36).slice(2, 14);
}
