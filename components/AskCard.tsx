"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Sparkles, Brain, PenLine } from "lucide-react";

const MODES = [
  { id: "reason", label: "تحليل ودعم قرار", icon: Brain },
  { id: "rewrite", label: "صياغة رسمية", icon: PenLine },
];

const SUGGESTIONS = [
  "لخّص هذه اللائحة التنفيذية في نقاط",
  "صُغ خطابًا رسميًا لرد على تظلّم",
  "حلّل أثر هذا القرار على الخدمات",
];

export function AskCard() {
  const router = useRouter();
  const [mode, setMode] = useState("reason");
  const [value, setValue] = useState("");

  function submit(q: string) {
    const text = q.trim();
    if (!text) return;
    router.push(`/playground?q=${encodeURIComponent(text)}&mode=${mode}`);
  }

  return (
    <div className="card w-full max-w-[460px] shadow-level-2">
      {/* tab-toggle — off-shape pill-tab 36px */}
      <div className="inline-flex rounded-pill-tab bg-canvas-soft p-xxs">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`inline-flex items-center gap-sm rounded-pill-tab px-lg py-sm text-body-sm-strong transition-colors ${
                active ? "bg-canvas text-ink shadow-level-3" : "text-body"
              }`}
            >
              <Icon size={16} />
              {m.label}
            </button>
          );
        })}
      </div>

      <h3 className="mt-2xl font-display text-display-md">
        {mode === "reason" ? "اطرح المسألة، وتابِع تحليل زكي" : "أدخِل النص لصياغته رسميًا"}
      </h3>

      <form
        className="mt-lg flex flex-col gap-md"
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
      >
        <div className="flex items-start gap-md rounded-md bg-canvas-soft p-lg">
          <Sparkles size={20} className="mt-[2px] shrink-0 text-body" />
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            placeholder={
              mode === "reason"
                ? "اكتب المسألة… ويعرض زكي خطوات تحليله قبل التوصية"
                : "ألصِق النص المراد صياغته رسميًا…"
            }
            className="w-full resize-none bg-transparent text-body-md text-ink outline-none placeholder:text-mute"
          />
        </div>

        <button type="submit" className="pill-primary w-full py-lg text-body-lg">
          {mode === "reason" ? "حلّل بزكي" : "صُغ رسميًا"}
          <ArrowLeft size={18} />
        </button>
      </form>

      <div className="mt-lg flex flex-wrap gap-sm">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => submit(s)} className="chip">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
