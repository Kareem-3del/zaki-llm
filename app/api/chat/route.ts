import { NextRequest } from "next/server";
import {
  OLLAMA_BASE_URL,
  ZAKI_MODEL,
  modelForRequest,
  temperatureForMode,
  systemPrompt,
  makeStreamParser,
  type ChatMessage,
  type Mode,
  type Attachment,
} from "@/lib/llm";

// Needs the Node runtime: Edge cannot reach a localhost Ollama server.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  messages: ChatMessage[];
  mode?: Mode;
  attachments?: Attachment[];
};

/** Extract text from a base64-encoded PDF using unpdf (pure-JS, no native deps). */
async function pdfToText(base64: string): Promise<string> {
  try {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
    const pdf = await getDocumentProxy(bytes);
    const { text } = await extractText(pdf, { mergePages: true });
    return (Array.isArray(text) ? text.join("\n") : text || "").trim();
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad request" }), { status: 400 });
  }

  const mode: Mode =
    body.mode === "rewrite"
      ? "rewrite"
      : body.mode === "code"
        ? "code"
        : body.mode === "companion"
          ? "companion"
          : "reason";
  const history = (body.messages || []).filter(
    (m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
  );
  if (!history.length) {
    return new Response(JSON.stringify({ error: "no messages" }), { status: 400 });
  }

  // ── Attachments: PDFs → extracted text appended to the prompt; images → vision input ──
  const attachments = Array.isArray(body.attachments) ? body.attachments : [];
  const imageData = attachments.filter((a) => a.kind === "image").map((a) => a.data);
  const pdfs = attachments.filter((a) => a.kind === "pdf");
  const hasImages = imageData.length > 0;
  const hasAttachments = attachments.length > 0;

  // Work on a copy so we can enrich the LAST user message with file context.
  const enriched: ChatMessage[] = history.map((m) => ({ ...m }));
  const lastUser = [...enriched].reverse().find((m) => m.role === "user");
  if (lastUser) {
    if (pdfs.length) {
      const docs: string[] = [];
      for (const p of pdfs) {
        const text = await pdfToText(p.data);
        docs.push(
          text
            ? `محتوى الملف «${p.name}»:\n${text.slice(0, 12000)}`
            : `(تعذّر استخراج نصٍّ من «${p.name}» — قد يكون مستندًا ممسوحًا ضوئيًا؛ أرفقه كصورة لتحليله بصريًا.)`,
        );
      }
      lastUser.content = `${docs.join("\n\n")}\n\n${lastUser.content || "حلّل المستند المرفق."}`;
    }
    if (hasImages) {
      lastUser.images = imageData;
      if (!lastUser.content.trim()) lastUser.content = "حلّل الصورة المرفقة بدقّة.";
    }
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt(mode, hasAttachments) },
    ...enriched,
  ];

  // Call local Ollama with streaming.
  let upstream: Response;
  try {
    upstream = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelForRequest(mode, hasImages),
        messages,
        stream: true,
        // NOTE: we do NOT pass Ollama's native `think` flag — many Arabic GGUF models
        // (incl. ALLaM-Thinking) reject it. Reasoning is requested via the system prompt
        // as <think>…</think> and split out by the stream parser, which works everywhere.
        options: {
          temperature: temperatureForMode(mode),
          num_ctx: 4096,
        },
      }),
    });
  } catch {
    return new Response(
      JSON.stringify({
        error: "offline",
        detail: `تعذّر الاتصال بنموذج زكي المحلي على ${OLLAMA_BASE_URL}. شغّل Ollama ثم اسحب النموذج.`,
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return new Response(
      JSON.stringify({
        error: "model",
        detail:
          text ||
          `النموذج «${modelForRequest(mode, hasImages)}» غير متاح. اسحبه أولًا: ollama pull ${modelForRequest(mode, hasImages)}`,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  const parser = makeStreamParser();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  // Re-emit a simple NDJSON protocol the client understands: {t} thinking, {a} answer, {done}.
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const d of parser.push(decoder.decode(value, { stream: true }))) {
            if (d.thinking) send({ t: d.thinking });
            if (d.answer) send({ a: d.answer });
          }
        }
        const tail = parser.flush();
        if (tail?.thinking) send({ t: tail.thinking });
        if (tail?.answer) send({ a: tail.answer });
        send({ done: true });
      } catch (e) {
        send({ error: "stream", detail: String(e) });
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

// Lightweight health check the client uses to decide live-vs-demo.
export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!res.ok) return Response.json({ up: false, model: ZAKI_MODEL });
    const data = (await res.json()) as { models?: { name?: string; model?: string }[] };
    const names = (data.models || []).map((m) => m.model || m.name || "");
    const hasModel = names.some((n) => n === ZAKI_MODEL || n.startsWith(ZAKI_MODEL));
    return Response.json({ up: true, model: ZAKI_MODEL, modelReady: hasModel, models: names });
  } catch {
    return Response.json({ up: false, model: ZAKI_MODEL });
  }
}
