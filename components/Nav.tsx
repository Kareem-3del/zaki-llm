"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/", label: "المنصة" },
  { href: "/#use-cases", label: "الحلول" },
  { href: "/models", label: "النماذج والنشر" },
  { href: "/playground", label: "التجربة" },
  { href: "/models#contact", label: "التواصل" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-canvas-soft bg-canvas/95 backdrop-blur">
      <nav className="container-zaki flex items-center justify-between py-lg">
        <div className="flex items-center gap-3xl">
          <Link href="/" className="text-ink">
            <Logo />
          </Link>
          <ul className="hidden items-center gap-2xl lg:flex">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-body-md-strong text-ink transition-opacity hover:opacity-60"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-md lg:flex">
          <Link href="/login" className="text-body-md-strong text-ink transition-opacity hover:opacity-60">
            بوابة الدخول
          </Link>
          <Link href="/models#contact" className="pill-primary">
            اطلب عرضًا توضيحيًا
          </Link>
        </div>

        <button
          type="button"
          aria-label="القائمة"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas-soft lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-canvas-soft bg-canvas lg:hidden">
          <ul className="container-zaki flex flex-col py-md">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-md text-body-lg text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-md flex flex-col gap-md">
              <Link href="/login" onClick={() => setOpen(false)} className="pill-secondary w-full">
                بوابة الدخول
              </Link>
              <Link href="/models#contact" onClick={() => setOpen(false)} className="pill-primary w-full">
                اطلب عرضًا توضيحيًا
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
