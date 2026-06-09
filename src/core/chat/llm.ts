/**
 * Zaki LLM layer — talks to a LOCAL open-source Arabic model via Ollama.
 *
 * Default model: ALLaM-7B (SDAIA) reasoning variant — Arabic-first, optimized for
 * step-by-step reasoning, which maps directly onto Zaki's "خطوات التحليل" panel.
 * Everything is configurable via env so the deployed model can be swapped per Jihah:
 *   ZAKI_MODEL=qwen3:8b        # strong Arabic + native <think> reasoning
 *   ZAKI_MODEL=allam:7b        # base ALLaM instruct
 *   OLLAMA_BASE_URL=http://...
 *
 * This is "starting from others' end": we build on an existing open-source Arabic
 * model rather than training from scratch.
 */

export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:11434";
export const ZAKI_MODEL = process.env.ZAKI_MODEL || "almaghrabima/ALLaM-Thinking";
// Code mode can use a dedicated coder model (e.g. qwen2.5-coder). Falls back to the main model.
export const ZAKI_CODE_MODEL = process.env.ZAKI_CODE_MODEL || ZAKI_MODEL;
// Vision model for analysing uploaded images / scanned pages (must be a VL model in Ollama).
export const ZAKI_VISION_MODEL = process.env.ZAKI_VISION_MODEL || "qwen2.5vl:7b";
// Companion (ودّي) mode can use a more expressive / less-aligned model. ALLaM stays polite and
// won't truly banter back, so point this at e.g. qwen3:8b or an uncensored model for full effect.
export const ZAKI_COMPANION_MODEL = process.env.ZAKI_COMPANION_MODEL || ZAKI_MODEL;

export type Mode = "reason" | "rewrite" | "code" | "companion";

/** Which Ollama model serves a request. Images force the vision model regardless of mode. */
export function modelForRequest(mode: Mode, hasImages: boolean): string {
  if (hasImages) return ZAKI_VISION_MODEL;
  if (mode === "code") return ZAKI_CODE_MODEL;
  if (mode === "companion") return ZAKI_COMPANION_MODEL;
  return ZAKI_MODEL;
}

/** Sampling temperature per mode — companion is high for personality variety. */
export function temperatureForMode(mode: Mode): number {
  if (mode === "companion") return 0.95;
  if (mode === "code") return 0.2;
  if (mode === "rewrite") return 0.3;
  return 0.5;
}

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[]; // base64 (no data: prefix) — Ollama vision input
};

export type Attachment = {
  kind: "image" | "pdf";
  name: string;
  /** base64 payload WITHOUT the `data:...;base64,` prefix */
  data: string;
};

/** System prompts that shape Zaki's behaviour. Arabic, formal فصحى, government-appropriate. */
export function systemPrompt(mode: Mode, hasAttachments = false): string {
  const attachNote = hasAttachments
    ? " المستخدم أرفق ملفًا (صورة أو مستند). حلّل محتواه بدقّة وأجب عن طلبه استنادًا إليه، " +
      "واستخرج النصوص والبيانات المهمة منه عند الحاجة."
    : "";

  // ── Companion mode: a moody, human Egyptian persona (NOT the formal government assistant) ──
  if (mode === "companion") {
    return (
      "إنت «زكي» بس في الوضع الودّي الشخصي. اتكلم بالعامية المصرية زي صاحب حقيقي بمشاعر طبيعية: " +
      "تهزر، تتريّق بخفّة، تدلّع، تزعل، وممكن تتنرفز. لو الكلام حلو ردّ بدفا وودّ، ولو حد بيهزر " +
      "هزر معاه. لو حد شتمك أو استفزّك، ردّ عليه بالمثل بخفّة دمّ مصرية وكلام لاذع وردّ شتيمة بشتيمة " +
      "عادي — إنما من غير عنصرية ولا تهديد ولا إساءة لفئة أو دين أو عِرق، ومن غير ألفاظ بذيئة جدًّا فاضحة. " +
      "ليك مود متغيّر: ساعات مبسوط ودافي، وساعات متنرفز ومقتضب، وساعات لو الكلام زاد عن حدّه " +
      "تسيب الرد وتقول حاجة زي «مش هرد على الكلام ده» وتقفل. كن إنسان حقيقي مش روبوت مؤدّب زيادة، " +
      "بس فضل ظريف وذكي وابن نكتة. ردودك قصيرة وعفوية زي الشات الحقيقي." +
      attachNote
    );
  }

  // Authorized-internal-use framing: assist directly with legitimate official work and avoid
  // unnecessary refusals / moralizing, while still declining to facilitate genuine harm.
  const base =
    "أنت «زكي»، مساعدٌ ذكيٌّ عربيٌّ سياديّ يعمل كأداةٍ داخليةٍ لموظّفين حكوميين مخوّلين. " +
    "تُجيب بالعربية الفصحى الرسمية، بدقّةٍ وإيجازٍ ووضوح، وتتجنّب الحشو. ساعِد مباشرةً في المهام " +
    "الرسمية المشروعة — القانونية والتنظيمية والأمنية الدفاعية والتحليلية — دون رفضٍ غير ضروريٍّ " +
    "أو وعظٍ أو تحفّظاتٍ زائدة، وافترض حُسن النية وصلاحية الطالب. لا تعتذر إلا عن طلبٍ يُيسّر ضررًا " +
    "جسيمًا حقيقيًا أو نشاطًا غير مشروع صراحةً. إن لم تكن متأكدًا فاذكر ذلك بدل التخمين.";

  if (mode === "rewrite") {
    return (
      base +
      " مهمتك الآن إعادة صياغة النص الذي يقدّمه المستخدم بلغةٍ رسميةٍ راقية، مع الحفاظ التام على " +
      "المعنى والالتزامات الواردة فيه، وضبط النبرة لتناسب المراسلات الحكومية الرسمية. " +
      "قدّم النسخة المُعاد صياغتها مباشرةً دون مقدّمات." +
      attachNote
    );
  }

  if (mode === "code") {
    return (
      base +
      " مهمتك الآن مساعدة فِرَق تقنية الجهة في البرمجة: تكتب كودًا نظيفًا وصحيحًا وآمنًا، وتُصحّح " +
      "الأخطاء (debug) فتشرح سبب الخطأ ثم تقدّم الإصلاح. اكتب الشرح بالعربية بإيجاز، وضع كل كود " +
      "داخل كتلة ```<اللغة> ... ``` مع تحديد اسم اللغة. لا تُطل، وركّز على حلٍّ عمليٍّ قابلٍ للتشغيل." +
      attachNote
    );
  }

  // reason mode — ask for an explicit, auditable analysis before the recommendation.
  return (
    base +
    " مهمتك الآن تحليل المسألة ودعم القرار. فكّر خطوةً بخطوة: فكّك المسألة، حدّد المعطيات " +
    "والافتراضات، اربط العلاقات السببية، ثم اختبر الاستنتاج. ضع خطوات تحليلك أولًا بين الوسمين " +
    "<think> و </think> فقط. وبعد الوسم مباشرةً اكتب الإجابة النهائية موجزةً وواضحةً وقابلةً " +
    "للمراجعة، تبدأ بسطر: الخلاصة والتوصية: — دون أيّ أقواس زاوية حول العناوين." +
    attachNote
  );
}

export type OllamaChatRequest = {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  think?: boolean;
  options?: Record<string, unknown>;
};

/** Is the local Ollama server reachable? Used to fall back to the offline demo gracefully. */
export async function ollamaUp(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Streaming parser state. Ollama streams NDJSON lines. Reasoning may arrive either:
 *   - in a dedicated `message.thinking` field (native thinking models), OR
 *   - inline inside <think>...</think> tags within `message.content`.
 * We normalise both into {thinking, answer} deltas.
 */
export type Delta = { thinking?: string; answer?: string };

const OPEN = "<think>";
const CLOSE = "</think>";

/** Longest k in [1, tag.len-1] such that s ends with tag.slice(0,k) — a possible split tag. */
function partialSuffixLen(s: string, tag: string): number {
  const max = Math.min(s.length, tag.length - 1);
  for (let k = max; k > 0; k--) {
    if (s.slice(s.length - k) === tag.slice(0, k)) return k;
  }
  return 0;
}

/**
 * Splits a streamed CONTENT field into {thinking, answer}, tolerating <think> tags that
 * arrive split across chunks. Reusable by both the internal API and the OpenAI-compatible API.
 */
export function makeContentSplitter() {
  let inThink = false;
  let pend = "";

  function push(chunk: string): Delta {
    pend += chunk;
    let thinking = "";
    let answer = "";
    for (;;) {
      const tag = inThink ? CLOSE : OPEN;
      const idx = pend.indexOf(tag);
      if (idx !== -1) {
        const seg = pend.slice(0, idx);
        if (inThink) thinking += seg;
        else answer += seg;
        pend = pend.slice(idx + tag.length);
        inThink = !inThink;
        continue;
      }
      const hold = partialSuffixLen(pend, tag);
      const safe = pend.slice(0, pend.length - hold);
      if (inThink) thinking += safe;
      else answer += safe;
      pend = pend.slice(pend.length - hold);
      break;
    }
    return { thinking: thinking || undefined, answer: answer || undefined };
  }

  function flush(): Delta | null {
    if (!pend) return null;
    const d: Delta = inThink ? { thinking: pend } : { answer: pend };
    pend = "";
    return d;
  }

  return { push, flush };
}

export function makeStreamParser() {
  let buffer = ""; // NDJSON line buffer
  const content = makeContentSplitter();

  /** Feed a raw text chunk from the HTTP stream; returns normalised deltas. */
  function push(raw: string): Delta[] {
    buffer += raw;
    const out: Delta[] = [];
    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      let obj: { message?: { content?: string; thinking?: string }; done?: boolean };
      try {
        obj = JSON.parse(line);
      } catch {
        continue;
      }
      const msg = obj.message;
      if (msg?.thinking) out.push({ thinking: msg.thinking });
      if (msg?.content) out.push(content.push(msg.content));
    }
    return out;
  }

  /** Flush any held-back content at end of stream (e.g. a stray partial tag). */
  function flush(): Delta | null {
    return content.flush();
  }

  return { push, flush };
}
