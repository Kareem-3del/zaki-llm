import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";
import { ReasoningMark } from "./Logo";

const COLUMNS = [
  {
    title: "الحلول",
    links: ["خدمة المواطن", "صياغة المراسلات", "تحليل الوثائق", "دعم القرار", "الترجمة المؤسسية"],
  },
  {
    title: "النشر والأمان",
    links: ["النشر المحلي", "السحابة السيادية", "البيئات المعزولة", "سجلّات التدقيق", "إدارة الصلاحيات"],
  },
  {
    title: "المصدر المفتوح",
    links: ["رخصة Apache 2.0", "بطاقة النموذج", "مراجعة الكود", "بيانات التدريب", "المواءمة التنظيمية"],
  },
  {
    title: "الجهة",
    links: ["عن زكي", "القطاع الحكومي", "الشركاء", "تواصل معنا", "سياسة الخصوصية"],
  },
];

export function Footer() {
  return (
    <footer className="bg-primary text-on-dark">
      <div className="container-zaki py-3xl">
        <div className="grid gap-3xl md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-sm text-on-dark">
              <ReasoningMark className="h-7 w-7" variant="onDark" />
              <span className="font-display text-display-sm">زكي</span>
            </div>
            <p className="mt-md max-w-[260px] text-body-sm text-mute">
              ذكاءٌ اصطناعيٌّ عربيٌّ سياديّ للجهات الحكومية — يُنشَر داخل بنيتكم.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-body-md-strong text-on-dark">{col.title}</h4>
              <ul className="mt-lg flex flex-col gap-md">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-body-sm text-mute transition-colors hover:text-on-dark"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-3xl flex flex-col items-start justify-between gap-lg border-t border-hairline-mid pt-2xl md:flex-row md:items-center">
          <p className="text-caption text-mute">© 2026 زكي. مفتوح المصدر تحت رخصة Apache 2.0.</p>
          <div className="flex items-center gap-md">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <Link
                key={i}
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black-elevated text-on-dark transition-colors hover:bg-white hover:text-ink"
                aria-label="رابط اجتماعي"
              >
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
