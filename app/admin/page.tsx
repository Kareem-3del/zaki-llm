"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Cpu,
  KeyRound,
  ShieldAlert,
  Database,
  LogOut,
  Check,
  X,
  Terminal,
  RefreshCw,
} from "lucide-react";
import { Nav } from "@/components/Nav";

type Status = {
  user: string;
  ollamaUp: boolean;
  ollamaBaseUrl: string;
  roles: { role: string; model: string; ready: boolean }[];
  apiModels: string[];
  apiKeyConfigured: boolean;
  authSecretIsDefault: boolean;
};

export default function AdminPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/status");
      if (res.status === 403) {
        router.replace("/playground");
        return;
      }
      setStatus(await res.json());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <main className="min-h-screen">
      <Nav />
      <div className="container-zaki py-2xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-body-sm-strong uppercase tracking-wide text-body">لوحة التحكّم</span>
            <h1 className="mt-xs font-display text-display-lg">إدارة زكي</h1>
          </div>
          <div className="flex items-center gap-md">
            <button onClick={load} className="pill-subtle" aria-label="تحديث">
              <RefreshCw size={16} /> تحديث
            </button>
            <button onClick={logout} className="pill-secondary">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>

        {loading || !status ? (
          <div className="mt-3xl text-body-md text-body">جارٍ التحميل…</div>
        ) : (
          <div className="mt-2xl grid gap-2xl lg:grid-cols-2">
            {/* Security posture */}
            {(status.authSecretIsDefault || !status.apiKeyConfigured) && (
              <div className="lg:col-span-2 flex items-start gap-md rounded-xl border border-surface-pressed bg-canvas-soft p-lg">
                <ShieldAlert size={20} className="mt-[2px] shrink-0" />
                <div className="text-body-sm text-ink">
                  <p className="text-body-md-strong">قبل النشر، ظبط الإعدادات الأمنية:</p>
                  <ul className="mt-xs list-inside list-disc text-body">
                    {status.authSecretIsDefault && <li>عيّن <code>ZAKI_AUTH_SECRET</code> قويًّا (السرّ الحالي افتراضي).</li>}
                    {!status.apiKeyConfigured && <li>عيّن <code>ZAKI_API_KEY</code> لتأمين واجهة الـ API العامة.</li>}
                    <li>غيّر بيانات الدخول الافتراضية عبر <code>ZAKI_AUTH_USERS</code>.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Models */}
            <section className="card border border-canvas-soft">
              <div className="flex items-center gap-sm">
                <Cpu size={18} /> <h2 className="font-display text-display-sm">النماذج المحلية</h2>
                <span
                  className={`me-auto inline-flex items-center gap-xs rounded-pill px-md py-xxs text-body-sm-strong ${
                    status.ollamaUp ? "bg-canvas-soft text-ink" : "bg-canvas-soft text-body"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${status.ollamaUp ? "bg-ink" : "bg-mute"}`} />
                  {status.ollamaUp ? "المحرّك يعمل" : "المحرّك متوقّف"}
                </span>
              </div>
              <ul className="mt-lg flex flex-col gap-sm">
                {status.roles.map((r) => (
                  <li key={r.role} className="flex items-center justify-between gap-md border-b border-canvas-soft pb-sm">
                    <div>
                      <p className="text-body-md-strong text-ink">{r.role}</p>
                      <p className="font-mono text-caption text-body" dir="ltr">{r.model}</p>
                    </div>
                    <span className={`inline-flex items-center gap-xs text-body-sm ${r.ready ? "text-ink" : "text-mute"}`}>
                      {r.ready ? <Check size={15} /> : <X size={15} />} {r.ready ? "جاهز" : "غير محمّل"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-md font-mono text-caption text-body" dir="ltr">{status.ollamaBaseUrl}</p>
            </section>

            {/* API access */}
            <section className="card border border-canvas-soft">
              <div className="flex items-center gap-sm">
                <KeyRound size={18} /> <h2 className="font-display text-display-sm">واجهة API</h2>
                <span className="me-auto inline-flex items-center gap-xs rounded-pill bg-canvas-soft px-md py-xxs text-body-sm-strong">
                  {status.apiKeyConfigured ? "مؤمّنة بمفتاح" : "مفتوحة (محليًا)"}
                </span>
              </div>
              <p className="mt-md text-body-sm text-body">متوافقة مع OpenAI — النماذج المتاحة:</p>
              <div className="mt-sm flex flex-wrap gap-xs">
                {status.apiModels.map((m) => (
                  <span key={m} className="rounded-pill bg-canvas-soft px-md py-xxs font-mono text-caption" dir="ltr">{m}</span>
                ))}
              </div>
              <div className="mt-lg rounded-md bg-ink p-md" dir="ltr">
                <code className="block whitespace-pre-wrap font-mono text-caption text-on-dark">{`curl ${typeof window !== "undefined" ? window.location.origin : ""}/v1/chat/completions \\
  -H "Authorization: Bearer $ZAKI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"zaki","messages":[{"role":"user","content":"مرحبا"}]}'`}</code>
              </div>
              <p className="mt-md text-caption text-mute">
                لتدوير المفتاح: عيّن <code>ZAKI_API_KEY</code> في البيئة وأعِد التشغيل (لا يُدار من الويب لأسباب أمنية).
              </p>
            </section>

            {/* Knowledge base (RAG) — honest scope */}
            <section className="card lg:col-span-2 border border-canvas-soft">
              <div className="flex items-center gap-sm">
                <Database size={18} /> <h2 className="font-display text-display-sm">قاعدة المعرفة — تعلّم من بياناتكم</h2>
                <span className="me-auto rounded-pill bg-canvas-soft px-md py-xxs text-body-sm-strong text-body">قيد التطوير</span>
              </div>
              <p className="mt-md max-w-[640px] text-body-md text-body">
                ارفع وثائق الجهة (لوائح، عقود، أدلّة) ليجيب زكي منها عبر الاسترجاع (RAG) — دون إعادة تدريب،
                وداخل بنيتكم. الخطوة دي محتاجة طبقة فهرسة وتضمين (embeddings) + مخزن متجهات؛ هي التالية في الخطة.
              </p>
              <button
                disabled
                className="mt-lg inline-flex cursor-not-allowed items-center gap-sm rounded-pill bg-canvas-soft px-lg py-md text-body-md-strong text-mute"
              >
                <Terminal size={16} /> رفع وثائق (قريبًا)
              </button>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
