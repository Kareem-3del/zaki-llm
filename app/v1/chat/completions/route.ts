import { NextRequest } from "next/server";
import {
  OLLAMA_BASE_URL,
  modelForRequest,
  temperatureForMode,
  systemPrompt,
  makeContentSplitter,
  type ChatMessage,
} from "@/lib/llm";
import {
  checkAuth,
  aliasToMode,
  extractContent,
  openaiError,
  genId,
  CORS_HEADERS,
  type OAIContent,
} from "@/lib/openai";

// Node runtime: needs to reach the localhost Ollama server.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OAIMessage = { role: string; content: OAIContent };
type Usage = { prompt_tokens: number; completion_tokens: number; total_tokens: number };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return openaiError("Incorrect API key provided.", "invalid_request_error", "invalid_api_key", 401);
  }

  let body: {
    model?: string;
    messages?: OAIMessage[];
    stream?: boolean;
    temperature?: number;
    max_tokens?: number;
    stream_options?: { include_usage?: boolean };
  };
  try {
    body = await req.json();
  } catch {
    return openaiError("We could not parse the JSON body of your request.");
  }

  const reqModel = typeof body.model === "string" ? body.model : "zaki";
  const mode = aliasToMode(reqModel);
  const stream = body.stream === true;
  const oaiMessages = Array.isArray(body.messages) ? body.messages : [];
  if (!oaiMessages.length) {
    return openaiError("'messages' is a required property.", "invalid_request_error", null, 400);
  }

  // Map OpenAI messages → Ollama messages, collecting any inline images.
  let hasImages = false;
  const mapped: ChatMessage[] = oaiMessages.map((m) => {
    const { text, images } = extractContent(m.content);
    if (images.length) hasImages = true;
    const role: ChatMessage["role"] =
      m.role === "assistant" ? "assistant" : m.role === "system" ? "system" : "user";
    return { role, content: text, ...(images.length ? { images } : {}) };
  });

  // Prepend Zaki's persona/system prompt; client-supplied system messages are kept after it.
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt(mode, hasImages) },
    ...mapped,
  ];

  const ollamaModel = modelForRequest(mode, hasImages);
  const temperature = typeof body.temperature === "number" ? body.temperature : temperatureForMode(mode);
  const options: Record<string, unknown> = { temperature, num_ctx: 4096 };
  if (typeof body.max_tokens === "number") options.num_predict = body.max_tokens;

  let upstream: Response;
  try {
    upstream = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: ollamaModel, messages, stream: true, options }),
    });
  } catch {
    return openaiError(
      `Cannot reach the local model runtime at ${OLLAMA_BASE_URL}.`,
      "api_error",
      "backend_unavailable",
      503,
    );
  }
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return openaiError(
      detail || `The model '${ollamaModel}' is not available. Pull it with: ollama pull ${ollamaModel}`,
      "api_error",
      "model_not_found",
      502,
    );
  }

  const created = Math.floor(Date.now() / 1000);
  const id = genId();

  // Parse Ollama's NDJSON; split <think> reasoning from the answer; capture token usage.
  type OllamaLine = {
    message?: { content?: string; thinking?: string };
    done?: boolean;
    prompt_eval_count?: number;
    eval_count?: number;
  };

  if (stream) {
    const splitter = makeContentSplitter();
    const enc = new TextEncoder();
    const dec = new TextDecoder();
    const reader = upstream.body.getReader();
    let buf = "";
    let roleSent = false;
    let usage: Usage | null = null;

    const rs = new ReadableStream({
      async start(controller) {
        const send = (obj: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
        const chunk = (delta: Record<string, unknown>, finish: string | null = null) => ({
          id,
          object: "chat.completion.chunk",
          created,
          model: reqModel,
          choices: [{ index: 0, delta, finish_reason: finish }],
        });
        const ensureRole = () => {
          if (!roleSent) {
            send(chunk({ role: "assistant", content: "" }));
            roleSent = true;
          }
        };
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            let nl: number;
            while ((nl = buf.indexOf("\n")) !== -1) {
              const line = buf.slice(0, nl).trim();
              buf = buf.slice(nl + 1);
              if (!line) continue;
              let o: OllamaLine;
              try {
                o = JSON.parse(line);
              } catch {
                continue;
              }
              if (o.message?.thinking) {
                ensureRole();
                send(chunk({ reasoning_content: o.message.thinking }));
              }
              if (o.message?.content) {
                const d = splitter.push(o.message.content);
                ensureRole();
                if (d.thinking) send(chunk({ reasoning_content: d.thinking }));
                if (d.answer) send(chunk({ content: d.answer }));
              }
              if (o.done && typeof o.prompt_eval_count === "number") {
                usage = {
                  prompt_tokens: o.prompt_eval_count,
                  completion_tokens: o.eval_count || 0,
                  total_tokens: o.prompt_eval_count + (o.eval_count || 0),
                };
              }
            }
          }
          const tail = splitter.flush();
          if (tail?.thinking) send(chunk({ reasoning_content: tail.thinking }));
          if (tail?.answer) send(chunk({ content: tail.answer }));

          const final: Record<string, unknown> = chunk({}, "stop");
          if (usage && body.stream_options?.include_usage) final.usage = usage;
          send(final);
          controller.enqueue(enc.encode("data: [DONE]\n\n"));
        } catch {
          send(chunk({}, "stop"));
          controller.enqueue(enc.encode("data: [DONE]\n\n"));
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(rs, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        ...CORS_HEADERS,
      },
    });
  }

  // Non-streaming: accumulate the whole completion.
  const splitter = makeContentSplitter();
  const dec = new TextDecoder();
  const reader = upstream.body.getReader();
  let buf = "";
  let answer = "";
  let thinking = "";
  let usage: Usage | null = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line) continue;
      let o: OllamaLine;
      try {
        o = JSON.parse(line);
      } catch {
        continue;
      }
      if (o.message?.thinking) thinking += o.message.thinking;
      if (o.message?.content) {
        const d = splitter.push(o.message.content);
        if (d.thinking) thinking += d.thinking;
        if (d.answer) answer += d.answer;
      }
      if (o.done && typeof o.prompt_eval_count === "number") {
        usage = {
          prompt_tokens: o.prompt_eval_count,
          completion_tokens: o.eval_count || 0,
          total_tokens: o.prompt_eval_count + (o.eval_count || 0),
        };
      }
    }
  }
  const tail = splitter.flush();
  if (tail?.thinking) thinking += tail.thinking;
  if (tail?.answer) answer += tail.answer;

  const message: Record<string, unknown> = { role: "assistant", content: answer.trim() };
  if (thinking.trim()) message.reasoning_content = thinking.trim();

  const resp = {
    id,
    object: "chat.completion",
    created,
    model: reqModel,
    choices: [{ index: 0, message, finish_reason: "stop" }],
    usage: usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  };
  return new Response(JSON.stringify(resp), {
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}
