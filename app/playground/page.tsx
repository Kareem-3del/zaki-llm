"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  PenLine,
  Code2,
  ChevronDown,
  Sparkles,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Cpu,
  WifiOff,
  Paperclip,
  FileText,
  X,
  Smile,
  LogOut,
  UserRound,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { ReasoningMark } from "@/components/Logo";

type Mode = "reason" | "rewrite" | "code" | "companion";

const MODE_ICON: Record<Mode, React.ComponentType<{ size?: number; className?: string }>> = {
  reason: Brain,
  rewrite: PenLine,
  code: Code2,
  companion: Smile,
};

type Attach = {
  kind: "image" | "pdf";
  name: string;
  data: string; // base64, no data: prefix — sent to the API
  previewUrl?: string; // object URL for image thumbnails (display only)
};

type Msg = {
  id: number;
  role: "user" | "zaki";
  mode: Mode;
  text: string;
  thinking: string;
  thinkingDone: boolean;
  answering: boolean;
  demo?: boolean; // produced by offline fallback, not the real model
  attachments?: { kind: "image" | "pdf"; name: string; previewUrl?: string }[];
};

const EXAMPLES: { mode: Mode; q: string }[] = [
  { mode: "reason", q: "حلّل أثر رفع رسوم خدمة معيّنة على المواطنين" },
  { mode: "reason", q: "ما المخاطر القانونية المحتملة في هذا العقد؟" },
  { mode: "rewrite", q: "صُغ خطابًا رسميًا للردّ على تظلّم مواطن" },
  { mode: "code", q: "اكتب دالة Python تتحقّق من صحة رقم هوية وطنية" },
  { mode: "companion", q: "عامل إيه يا زكي؟" },
  { mode: "companion", q: "إنت بتفهم في إيه أصلاً؟" },
];

/* ── Offline demo fallback (used only when the local model is unreachable) ── */
function mockThinking(mode: Mode, q: string): string {
  if (mode === "companion") return ""; // companion mode has no reasoning trace
  if (mode === "rewrite") {
    return [
      "أقرأ النص الأصلي وأحدّد المعنى والالتزامات التي يجب الحفاظ عليها بالكامل.",
      "أحدّد النبرة الرسمية المطلوبة والجهة المخاطَبة.",
      "أعيد بناء الجُمل: أرفع مستوى اللغة، وأضبط الإيقاع، وأزيل الحشو.",
    ].join("\n");
  }
  if (mode === "code") {
    return [
      "أحدّد المطلوب من الدالة ومدخلاتها ومخرجاتها.",
      "أختار بنية بسيطة وآمنة وأراعي الحالات الحدّية.",
      "أكتب الكود ثم أتأكّد من صحته منطقيًا.",
    ].join("\n");
  }
  return [
    `أُفكّك المسألة إلى عناصرها: «${q.length > 48 ? q.slice(0, 48) + "…" : q}».`,
    "أحدّد المعطيات المتوفّرة فعلًا والمطلوب الوصول إليه.",
    "أربط العلاقات السببية بين العناصر ثم أختبر الاستنتاج.",
  ].join("\n");
}
function mockAnswer(mode: Mode): string {
  if (mode === "companion") {
    return "أهلين! أنا تمام الحمد لله، إنت عامل إيه؟\n\n(دلوقتي شغّال في الوضع التجريبي — شغّل النموذج المحلي وأنا أكلّمك على راحتي.)";
  }
  if (mode === "rewrite") {
    return "النسخة بعد الصياغة الرسمية:\n\n«تحيّةً طيبةً وبعد، نُفيدكم بأنه قد تمّت دراسة طلبكم، وسيتمّ إخطاركم بالقرار وفق الإجراءات المتّبعة. وتفضّلوا بقبول فائق الاحترام.»";
  }
  if (mode === "code") {
    return [
      "دالة بسيطة للتحقّق من رقم مكوّن من 10 أرقام:",
      "",
      "```python",
      "def is_valid_id(national_id: str) -> bool:",
      '    """تتحقق من أن الرقم يتكوّن من 10 أرقام."""',
      "    return national_id.isdigit() and len(national_id) == 10",
      "```",
      "",
      "(هذه إجابة من الوضع التجريبي — شغّل النموذج المحلي للحصول على كودٍ حقيقي.)",
    ].join("\n");
  }
  return "الخلاصة والتوصية:\n\nبعد تفكيك المسألة وربط معطياتها، يتّضح أن الأثر يعتمد على العلاقة السببية بين العوامل لا على تزامنها. يُوصى بمراجعة الافتراضات أعلاه قبل الاعتماد.\n\n(هذه إجابة من الوضع التجريبي — شغّل النموذج المحلي للحصول على تحليلٍ حقيقي.)";
}

let _id = 1;

function PlaygroundInner() {
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>("reason");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"checking" | "live" | "offline">("checking");
  const [attachments, setAttachments] = useState<Attach[]>([]);
  const [me, setMe] = useState<{ user: string; isAdmin: boolean } | null>(null);
  const messagesRef = useRef<Msg[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.authenticated && setMe({ user: d.user, isAdmin: !!d.isAdmin }))
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  messagesRef.current = messages;

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const next: Attach[] = [];
    for (const file of Array.from(files).slice(0, 4)) {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isImage = file.type.startsWith("image/");
      if (!isPdf && !isImage) continue;
      if (file.size > 12 * 1024 * 1024) continue; // 12MB cap
      const buf = await file.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const data = btoa(binary);
      next.push({
        kind: isPdf ? "pdf" : "image",
        name: file.name,
        data,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      });
    }
    setAttachments((prev) => [...prev, ...next].slice(0, 4));
    if (fileRef.current) fileRef.current.value = "";
  }

  const updateMsg = (id: number, fn: (m: Msg) => Msg) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));

  // Health check: is the local model live?
  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => setStatus(d.up && d.modelReady ? "live" : "offline"))
      .catch(() => setStatus("offline"));
  }, []);

  // Seed from a query string handed over by the homepage AskCard.
  useEffect(() => {
    const q = params.get("q");
    const m = params.get("mode");
    if (m === "rewrite" || m === "reason") setMode(m);
    if (q) {
      const id = requestAnimationFrame(() => send(q, (m as Mode) || "reason"));
      return () => cancelAnimationFrame(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function streamReal(
    zakiId: number,
    apiMessages: { role: string; content: string }[],
    m: Mode,
    atts: Attach[],
  ) {
    const ac = new AbortController();
    abortRef.current = ac;
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: apiMessages,
        mode: m,
        attachments: atts.map((a) => ({ kind: a.kind, name: a.name, data: a.data })),
      }),
      signal: ac.signal,
    });
    if (!res.ok || !res.body) throw new Error("offline");

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let answerStarted = false;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        let ev: { t?: string; a?: string; done?: boolean; error?: string };
        try {
          ev = JSON.parse(line);
        } catch {
          continue;
        }
        if (ev.error) throw new Error(ev.error);
        if (ev.t) updateMsg(zakiId, (msg) => ({ ...msg, thinking: msg.thinking + ev.t }));
        if (ev.a) {
          if (!answerStarted) {
            answerStarted = true;
            updateMsg(zakiId, (msg) => ({ ...msg, thinkingDone: true }));
          }
          updateMsg(zakiId, (msg) => ({ ...msg, text: msg.text + ev.a }));
        }
      }
    }
    updateMsg(zakiId, (msg) => ({ ...msg, thinkingDone: true, answering: false }));
    setStatus("live");
  }

  async function runDemo(zakiId: number, m: Mode, q: string) {
    const thinking = mockThinking(m, q);
    // reveal thinking progressively
    for (let i = 1; i <= thinking.length; i += Math.max(2, Math.round(thinking.length / 40))) {
      updateMsg(zakiId, (msg) => ({ ...msg, thinking: thinking.slice(0, i) }));
      await sleep(24);
    }
    updateMsg(zakiId, (msg) => ({ ...msg, thinking, thinkingDone: true }));
    await sleep(200);
    updateMsg(zakiId, (msg) => ({ ...msg, text: mockAnswer(m), answering: false, demo: true }));
  }

  async function send(text: string, forceMode?: Mode, atts: Attach[] = []) {
    const q = text.trim();
    const hasAtt = atts.length > 0;
    if ((!q && !hasAtt) || busy) return;
    const m = forceMode ?? mode;
    const content = q || "حلّل الملف المرفق.";
    setBusy(true);
    setInput("");
    if (hasAtt) setAttachments([]);

    const userMsg: Msg = {
      id: _id++,
      role: "user",
      mode: m,
      text: content,
      thinking: "",
      thinkingDone: true,
      answering: false,
      attachments: hasAtt
        ? atts.map((a) => ({ kind: a.kind, name: a.name, previewUrl: a.previewUrl }))
        : undefined,
    };
    const zakiId = _id++;
    const zakiMsg: Msg = { id: zakiId, role: "zaki", mode: m, text: "", thinking: "", thinkingDone: false, answering: true };

    // Build conversation history for the API from prior turns + this user message.
    const apiMessages = [
      ...messagesRef.current.map((msg) => ({ role: msg.role === "zaki" ? "assistant" : "user", content: msg.text })),
      { role: "user", content },
    ].filter((m2) => m2.content);

    setMessages((prev) => [...prev, userMsg, zakiMsg]);

    try {
      await streamReal(zakiId, apiMessages, m, atts);
    } catch {
      // local model unreachable → graceful offline demo
      setStatus("offline");
      // reset the assistant bubble in case partial content arrived
      updateMsg(zakiId, (msg) => ({ ...msg, text: "", thinking: "", thinkingDone: false, answering: true }));
      if (hasAtt) {
        updateMsg(zakiId, (msg) => ({
          ...msg,
          thinking: "",
          thinkingDone: true,
          answering: false,
          demo: true,
          text: "تحليل الملفات يحتاج النموذج المحلي متّصلًا. شغّل Ollama واسحب نموذج الرؤية ثم أعِد المحاولة.",
        }));
      } else {
        await runDemo(zakiId, m, q);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />

      <div className="container-zaki grid flex-1 gap-2xl py-2xl lg:grid-cols-[280px_1fr]">
        {/* ── Sidebar ── */}
        <aside className="hidden flex-col gap-lg lg:flex">
          <StatusPill status={status} />

          <div className="rounded-xl border border-canvas-soft p-lg">
            <p className="text-body-sm-strong text-body">الوضع</p>
            <div className="mt-md grid grid-cols-2 gap-xxs rounded-xl bg-canvas-soft p-xxs">
              <ModeBtn active={mode === "reason"} onClick={() => setMode("reason")} icon={Brain} label="تحليل" />
              <ModeBtn active={mode === "rewrite"} onClick={() => setMode("rewrite")} icon={PenLine} label="صياغة" />
              <ModeBtn active={mode === "code"} onClick={() => setMode("code")} icon={Code2} label="برمجة" />
              <ModeBtn active={mode === "companion"} onClick={() => setMode("companion")} icon={Smile} label="ودّي" />
            </div>
          </div>

          <div className="rounded-xl border border-canvas-soft p-lg">
            <p className="text-body-sm-strong text-body">جرّب مثال</p>
            <ul className="mt-md flex flex-col gap-xxs">
              {EXAMPLES.map((ex) => (
                <li key={ex.q}>
                  <button
                    onClick={() => send(ex.q, ex.mode)}
                    disabled={busy}
                    className="flex w-full items-start gap-sm rounded-md px-md py-md text-right text-body-sm text-ink transition-colors hover:bg-canvas-soft disabled:opacity-50"
                  >
                    {(() => {
                      const Icon = MODE_ICON[ex.mode];
                      return <Icon size={16} className="mt-[2px] shrink-0 text-body" />;
                    })()}
                    <span>{ex.q}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-primary p-lg text-on-dark">
            <p className="text-body-md-strong">النشر داخل بنيتكم؟</p>
            <p className="mt-xs text-body-sm text-mute">يُنشَر زكي بالكامل داخل بنية جهتكم — بياناتكم لا تغادر حدودكم.</p>
            <Link href="/models#contact" className="mt-md inline-flex pill-on-dark text-body-sm-strong">
              اطلب عرضًا توضيحيًا <ArrowLeft size={16} />
            </Link>
          </div>

          {me && (
            <div className="mt-auto flex items-center justify-between gap-md rounded-xl border border-canvas-soft p-md">
              <span className="inline-flex items-center gap-sm text-body-sm text-body">
                <UserRound size={15} /> {me.user}
              </span>
              <span className="flex items-center gap-md">
                {me.isAdmin && (
                  <Link href="/admin" className="text-body-sm-strong text-ink transition-opacity hover:opacity-60">
                    لوحة التحكّم
                  </Link>
                )}
                <button onClick={logout} className="inline-flex items-center gap-xs text-body-sm text-body transition-colors hover:text-ink">
                  <LogOut size={14} /> خروج
                </button>
              </span>
            </div>
          )}
        </aside>

        {/* ── Chat surface ── */}
        <section className="flex min-h-[70vh] flex-col rounded-xl border border-canvas-soft">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-lg md:p-2xl">
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="mx-auto flex max-w-[760px] flex-col gap-2xl">
                {messages.map((m) => (
                  <Bubble key={m.id} msg={m} onRetry={() => send(m.text, m.mode)} />
                ))}
              </div>
            )}
          </div>

          {/* composer */}
          <div className="border-t border-canvas-soft p-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input, undefined, attachments);
              }}
              className="mx-auto max-w-[760px]"
            >
              {/* attachment chips */}
              {attachments.length > 0 && (
                <div className="mb-md flex flex-wrap gap-sm">
                  {attachments.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-sm rounded-md border border-surface-pressed bg-canvas-soft py-xs pe-xs ps-md"
                    >
                      {a.kind === "image" && a.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.previewUrl} alt={a.name} className="h-7 w-7 rounded object-cover" />
                      ) : (
                        <FileText size={16} className="text-body" />
                      )}
                      <span className="max-w-[160px] truncate text-body-sm text-ink">{a.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-body hover:bg-surface-pressed"
                        aria-label="إزالة المرفق"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-md">
                <div className="flex flex-1 items-end gap-sm rounded-md bg-canvas-soft p-md">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="mb-[4px] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-body transition-colors hover:bg-surface-pressed"
                    aria-label="إرفاق صورة أو PDF"
                    title="إرفاق صورة أو PDF"
                  >
                    <Paperclip size={18} />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    hidden
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(input, undefined, attachments);
                      }
                    }}
                    rows={1}
                    placeholder={
                      attachments.length
                        ? "اكتب طلبك حول الملف المرفق… (اختياري)"
                        : mode === "reason"
                          ? "اطرح المسألة على زكي…"
                          : mode === "rewrite"
                            ? "ألصِق النص المراد صياغته رسميًا…"
                            : mode === "code"
                              ? "صِف المطلوب أو ألصِق الكود لتصحيحه…"
                              : "كلّمني عادي… أنا زكي"
                    }
                    className="max-h-32 w-full resize-none bg-transparent py-[6px] text-body-md text-ink outline-none placeholder:text-mute"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy || (!input.trim() && attachments.length === 0)}
                  className="pill-primary h-[52px] w-[52px] shrink-0 !px-0 disabled:opacity-40"
                >
                  {busy ? <Loader2 size={20} className="animate-spin" /> : <ArrowLeft size={20} />}
                </button>
              </div>
            </form>
            <p className="mx-auto mt-sm max-w-[760px] text-center text-caption text-mute">
              يعرض زكي خطوات تحليله لمراجعتها قبل الاعتماد. ادعم الصور وملفات PDF عبر زرّ الإرفاق.{" "}
              {status === "offline" && "النموذج المحلي غير متّصل — تعمل الآن نسخة توضيحية."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function StatusPill({ status }: { status: "checking" | "live" | "offline" }) {
  if (status === "live") {
    return (
      <div className="flex items-center gap-sm rounded-xl bg-canvas-soft px-lg py-md text-body-sm-strong text-ink">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-50" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ink" />
        </span>
        <Cpu size={15} /> نموذج عربي محلي · حيّ
      </div>
    );
  }
  if (status === "offline") {
    return (
      <div className="flex items-center gap-sm rounded-xl bg-canvas-soft px-lg py-md text-body-sm-strong text-body">
        <WifiOff size={15} /> وضع تجريبي · النموذج غير متّصل
      </div>
    );
  }
  return (
    <div className="flex items-center gap-sm rounded-xl bg-canvas-soft px-lg py-md text-body-sm-strong text-body">
      <Loader2 size={15} className="animate-spin" /> جارٍ فحص النموذج…
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-sm rounded-lg py-sm text-body-sm-strong transition-colors ${
        active ? "bg-canvas text-ink shadow-level-3" : "text-body"
      }`}
    >
      <Icon size={15} /> {label}
    </button>
  );
}

function Bubble({ msg, onRetry }: { msg: Msg; onRetry: () => void }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-start">
        <div className="flex max-w-[85%] flex-col items-stretch gap-sm">
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="flex flex-wrap justify-end gap-sm">
              {msg.attachments.map((a, i) =>
                a.kind === "image" && a.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={a.previewUrl}
                    alt={a.name}
                    className="h-24 w-24 rounded-lg border border-surface-pressed object-cover"
                  />
                ) : (
                  <div
                    key={i}
                    className="flex items-center gap-sm rounded-lg border border-surface-pressed bg-canvas-soft px-md py-sm text-body-sm text-ink"
                  >
                    <FileText size={16} className="text-body" />
                    <span className="max-w-[180px] truncate">{a.name}</span>
                  </div>
                ),
              )}
            </div>
          )}
          <div className="rounded-xl rounded-tr-md bg-primary px-lg py-md text-body-md text-on-primary">
            {msg.text}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-md">
      <div className="mt-xxs shrink-0 text-ink">
        <ReasoningMark className="h-8 w-8" />
      </div>
      <div className="flex-1">
        {msg.thinking.length > 0 && <ThinkingPanel text={msg.thinking} done={msg.thinkingDone} />}
        {msg.text ? (
          <div className="mt-md">
            <AnswerBody text={msg.text} />
          </div>
        ) : msg.thinking.length === 0 ? (
          <div className="mt-xs inline-flex items-center gap-sm text-body-sm text-body">
            <Loader2 size={15} className="animate-spin" /> زكي يحلّل…
          </div>
        ) : null}

        {!msg.answering && msg.text && (
          <div className="mt-md flex items-center gap-md">
            <button
              onClick={() => navigator.clipboard?.writeText(msg.text)}
              className="inline-flex items-center gap-xs text-body-sm text-body transition-colors hover:text-ink"
            >
              <Copy size={14} /> نسخ
            </button>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-xs text-body-sm text-body transition-colors hover:text-ink"
            >
              <RotateCcw size={14} /> حلّل من جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ThinkingPanel({ text, done }: { text: string; done: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl bg-canvas-soft">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-md px-lg py-md text-body-sm-strong text-ink"
      >
        <span className="inline-flex items-center gap-sm">
          {done ? <Brain size={16} /> : <Loader2 size={16} className="animate-spin" />}
          {done ? "خطوات تحليل زكي" : "زكي يفكّر…"}
        </span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-surface-pressed px-lg py-md">
          <p className="whitespace-pre-line text-body-sm leading-6 text-body">{text}</p>
        </div>
      )}
    </div>
  );
}

type Seg = { type: "text" | "code"; lang?: string; content: string };

/** Split an answer into text + fenced ```code``` segments (tolerant of a still-streaming block). */
function parseSegments(text: string): Seg[] {
  const parts = text.split("```");
  const segs: Seg[] = [];
  parts.forEach((p, k) => {
    if (k % 2 === 0) {
      if (p) segs.push({ type: "text", content: p });
      return;
    }
    // odd part = inside a code fence; first line may be the language tag
    const nl = p.indexOf("\n");
    let lang = "";
    let code = p;
    const firstLine = (nl === -1 ? p : p.slice(0, nl)).trim();
    if (/^[a-zA-Z0-9+#.\-]{1,20}$/.test(firstLine) && /^[a-zA-Z]/.test(firstLine)) {
      lang = firstLine;
      code = nl === -1 ? "" : p.slice(nl + 1);
    }
    segs.push({ type: "code", lang, content: code });
  });
  return segs;
}

function AnswerBody({ text }: { text: string }) {
  const segs = parseSegments(text);
  return (
    <div className="text-body-md leading-7 text-ink">
      {segs.map((s, i) =>
        s.type === "code" ? (
          <CodeBlock key={i} lang={s.lang} code={s.content.replace(/\n$/, "")} />
        ) : (
          <p key={i} className="whitespace-pre-line">
            {s.content}
          </p>
        ),
      )}
    </div>
  );
}

function CodeBlock({ lang, code }: { lang?: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-md overflow-hidden rounded-md border border-surface-pressed">
      <div className="flex items-center justify-between bg-canvas-soft px-md py-xs">
        <span className="font-mono text-caption text-body">{lang || "code"}</span>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          className="inline-flex items-center gap-xs text-caption text-body transition-colors hover:text-ink"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "تم النسخ" : "نسخ"}
        </button>
      </div>
      <pre dir="ltr" className="overflow-x-auto bg-ink px-md py-md text-left">
        <code className="whitespace-pre font-mono text-body-sm leading-6 text-on-dark">{code}</code>
      </pre>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-xl bg-canvas-soft px-lg py-3xl text-center">
      <ReasoningMark className="h-14 w-14 text-ink" />
      <h2 className="mt-lg font-display text-display-md">اطرح مسألةً، وتابِع تحليل زكي</h2>
      <p className="mt-sm max-w-[440px] text-body-md text-body">
        اكتب مسألةً للتحليل أو نصًّا للصياغة الرسمية. يعرض زكي خطوات تحليله قبل أن يقدّم التوصية.
      </p>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={null}>
      <PlaygroundInner />
    </Suspense>
  );
}
