"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { Logo } from "@/components/Logo";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/playground";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذّر تسجيل الدخول");
        setBusy(false);
        return;
      }
      router.replace(next);
    } catch {
      setError("تعذّر الاتصال بالخادم");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-canvas">
      <header className="container-zaki py-lg">
        <Link href="/" className="text-ink">
          <Logo />
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-lg pb-3xl">
        <div className="w-full max-w-[400px]">
          <div className="mb-2xl text-center">
            <div className="mx-auto mb-lg flex h-14 w-14 items-center justify-center rounded-full bg-canvas-soft">
              <Lock size={24} />
            </div>
            <h1 className="font-display text-display-md">بوابة الدخول</h1>
            <p className="mt-xs text-body-md text-body">سجّل الدخول للوصول إلى منصّة زكي</p>
          </div>

          <form onSubmit={submit} className="card border border-canvas-soft shadow-level-1">
            <label className="block text-body-sm-strong text-body">اسم المستخدم</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="mt-xs w-full rounded-md bg-canvas-soft p-lg text-body-md text-ink outline-none placeholder:text-mute"
              placeholder="admin"
            />

            <label className="mt-lg block text-body-sm-strong text-body">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-xs w-full rounded-md bg-canvas-soft p-lg text-body-md text-ink outline-none placeholder:text-mute"
              placeholder="••••••••"
            />

            {error && (
              <p className="mt-lg rounded-md bg-canvas-soft px-lg py-md text-body-sm text-ink">{error}</p>
            )}

            <button type="submit" disabled={busy} className="pill-primary mt-xl w-full py-lg text-body-lg disabled:opacity-50">
              {busy ? <Loader2 size={18} className="animate-spin" /> : <>دخول <ArrowLeft size={18} /></>}
            </button>
          </form>

          <p className="mt-lg text-center text-caption text-mute">
            محميٌّ بجلسةٍ موقّعة. للنشر، اضبط <code className="text-body">ZAKI_AUTH_USERS</code> و
            <code className="text-body"> ZAKI_AUTH_SECRET</code>.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
