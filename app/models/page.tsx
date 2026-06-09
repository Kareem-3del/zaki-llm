import Link from "next/link";
import { ArrowLeft, Check, GitFork, Cpu, Zap, Brain, Mail, Phone, ShieldCheck } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Faq } from "@/components/Faq";

const MODELS = [
  {
    icon: Zap,
    name: "زكي Mini",
    params: "٣ مليار معامل",
    desc: "خفيف وسريع — لخدمة المواطن والمهام الفورية ذات الحجم الكبير على عتاد محدود.",
    specs: ["نافذة سياق ٨٬٠٠٠ رمز", "يعمل على عتاد متواضع", "استدلال أساسي"],
  },
  {
    icon: Brain,
    name: "زكي ٢",
    params: "١٢ مليار معامل",
    desc: "النموذج المتوازن — الخيار الافتراضي لمعظم إدارات الجهة بين السرعة والدقّة.",
    specs: ["نافذة سياق ٣٢٬٠٠٠ رمز", "سلسلة تحليل كاملة", "دعم لهجات ومصطلحات رسمية"],
    featured: true,
  },
  {
    icon: Cpu,
    name: "زكي Pro",
    params: "٣٤ مليار معامل",
    desc: "للتحليل العميق ودعم القرار والسياقات الطويلة كاللوائح والعقود الضخمة.",
    specs: ["نافذة سياق ١٢٨٬٠٠٠ رمز", "استدلال متعدد الخطوات", "يتطلب عتاد GPU مخصّص"],
  },
];

const COMPARE = [
  ["نافذة السياق", "٨٬٠٠٠", "٣٢٬٠٠٠", "١٢٨٬٠٠٠"],
  ["سلسلة التحليل", "أساسية", "كاملة", "متعددة الخطوات"],
  ["الصياغة الرسمية", "✓", "✓", "✓"],
  ["نشر محلي / سيادي", "✓", "✓", "✓"],
  ["بيئة معزولة (Air-gapped)", "✓", "✓", "✓"],
  ["الحد الأدنى للعتاد", "وحدة معالجة", "GPU ١٦ﺟ", "GPU ٢٤ﺟ"],
];

const TIERS = [
  {
    name: "إثبات المفهوم",
    price: "خلال أسابيع",
    note: "مسار تجريبي مُدار",
    desc: "ابدؤوا بحالة استخدام واحدة على بياناتكم لإثبات القيمة قبل التوسّع.",
    features: ["تقييم حالة استخدام واحدة", "نشر تجريبي مُدار", "تقرير نتائج وقياس أثر", "فريق مختصّ مرافق"],
    cta: "اطلب مسار PoC",
  },
  {
    name: "نشر إداري",
    price: "حسب النطاق",
    note: "لإدارة أو قطاع",
    desc: "نشر كامل لإدارة داخل بنيتكم، مع التكامل والتدريب والحوكمة.",
    features: ["نشر محلي أو سحابة سيادية", "تكامل مع أنظمتكم", "تدريب الموظفين", "سجلّات تدقيق وحوكمة", "دعم بأولوية"],
    cta: "اطلب عرضًا توضيحيًا",
    featured: true,
  },
  {
    name: "نشر مؤسسي / وطني",
    price: "اتفاقية إطارية",
    note: "متعدد الجهات",
    desc: "نشر واسع عبر عدّة جهات، ببيئات معزولة واتفاقية مستوى خدمة.",
    features: ["بيئات معزولة (Air-gapped)", "نشر متعدد الجهات", "ضبط وتدريب على بياناتكم", "اتفاقية مستوى خدمة (SLA)", "مدير حساب حكومي"],
    cta: "تواصل مع المبيعات",
  },
];

export default function ModelsPage() {
  return (
    <main>
      <Nav />

      {/* Header */}
      <section className="container-zaki py-3xl text-center">
        <span className="inline-flex items-center gap-sm rounded-pill bg-canvas-soft px-lg py-sm text-body-sm-strong">
          <ShieldCheck size={15} /> يُنشَر داخل بنيتكم · مفتوح وقابل للمراجعة
        </span>
        <h1 className="mx-auto mt-lg max-w-[760px] font-display text-[36px] leading-[44px] md:text-display-xxl">
          النماذج وخيارات النشر السيادي
        </h1>
        <p className="mx-auto mt-lg max-w-[600px] text-body-lg text-body">
          ثلاثة نماذج بنفس قدرات التحليل والصياغة بأحجام مختلفة، تُنشَر جميعها داخل بنيتكم —
          محليًا، أو في سحابة سيادية، أو في بيئة معزولة تمامًا.
        </p>
      </section>

      {/* Model lineup */}
      <section className="container-zaki grid gap-2xl pb-3xl lg:grid-cols-3">
        {MODELS.map((m) => {
          const Icon = m.icon;
          const featured = m.featured;
          return (
            <article
              key={m.name}
              className={`flex flex-col rounded-xl p-2xl ${
                featured ? "bg-primary text-on-dark" : "bg-canvas-soft text-ink"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  featured ? "bg-black-elevated text-on-dark" : "bg-canvas text-ink"
                }`}
              >
                <Icon size={22} />
              </div>
              <h3 className={`mt-lg font-display text-display-md ${featured ? "text-on-dark" : ""}`}>{m.name}</h3>
              <p className={`text-body-sm-strong ${featured ? "text-mute" : "text-body"}`}>{m.params}</p>
              <p className={`mt-md text-body-md ${featured ? "text-mute" : "text-body"}`}>{m.desc}</p>
              <ul className="mt-lg flex flex-col gap-sm">
                {m.specs.map((s) => (
                  <li key={s} className={`flex items-center gap-sm text-body-sm ${featured ? "text-on-dark" : "text-ink"}`}>
                    <Check size={16} className="shrink-0" /> {s}
                  </li>
                ))}
              </ul>
              <Link
                href="/playground"
                className={`mt-2xl ${featured ? "pill-on-dark" : "pill-primary"} w-full`}
              >
                جرّب {m.name}
              </Link>
            </article>
          );
        })}
      </section>

      {/* Comparison table */}
      <section className="container-zaki pb-3xl">
        <h2 className="font-display text-display-lg">مقارنة سريعة</h2>
        <div className="mt-lg overflow-x-auto rounded-xl border border-canvas-soft">
          <table className="w-full min-w-[640px] border-collapse text-right">
            <thead>
              <tr className="bg-canvas-soft">
                <th className="px-lg py-md text-body-sm-strong text-body">الخاصية</th>
                <th className="px-lg py-md text-body-sm-strong text-ink">زكي Mini</th>
                <th className="px-lg py-md text-body-sm-strong text-ink">زكي ٢</th>
                <th className="px-lg py-md text-body-sm-strong text-ink">زكي Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row[0]} className="border-t border-surface-pressed">
                  <td className="px-lg py-md text-body-sm text-body">{row[0]}</td>
                  <td className="px-lg py-md text-body-sm text-ink">{row[1]}</td>
                  <td className="px-lg py-md text-body-sm text-ink">{row[2]}</td>
                  <td className="px-lg py-md text-body-sm text-ink">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Engagement / deployment tiers */}
      <section id="pricing" className="border-y border-canvas-soft bg-canvas py-3xl">
        <div className="container-zaki">
          <div className="text-center">
            <h2 className="font-display text-display-xl">خيارات التعاقد والنشر</h2>
            <p className="mx-auto mt-md max-w-[600px] text-body-lg text-body">
              نبدأ معكم بإثبات مفهوم على بياناتكم، ثم نتوسّع إلى نشر إداري فمؤسسي وفق احتياج الجهة.
              التسعير حسب النطاق ونموذج النشر.
            </p>
          </div>

          <div className="mt-3xl grid gap-2xl lg:grid-cols-3">
            {TIERS.map((t) => {
              const featured = t.featured;
              return (
                <article
                  key={t.name}
                  className={`flex flex-col rounded-xl p-2xl ${
                    featured ? "bg-primary text-on-dark" : "border border-surface-pressed bg-canvas-soft text-ink"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`font-display text-display-sm ${featured ? "text-on-dark" : ""}`}>{t.name}</h3>
                    {featured && (
                      <span className="rounded-pill bg-on-dark px-md py-xxs text-body-sm-strong text-ink">
                        الأكثر طلبًا
                      </span>
                    )}
                  </div>
                  <div className="mt-lg flex items-end gap-sm">
                    <span className={`font-display text-display-md ${featured ? "text-on-dark" : ""}`}>{t.price}</span>
                    <span className={`pb-[4px] text-body-sm ${featured ? "text-mute" : "text-body"}`}>{t.note}</span>
                  </div>
                  <p className={`mt-sm text-body-md ${featured ? "text-mute" : "text-body"}`}>{t.desc}</p>
                  <ul className="mt-lg flex flex-1 flex-col gap-sm">
                    {t.features.map((f) => (
                      <li key={f} className={`flex items-center gap-sm text-body-sm ${featured ? "text-on-dark" : "text-ink"}`}>
                        <Check size={16} className="shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="#contact"
                    className={`mt-2xl ${featured ? "pill-on-dark" : "pill-primary"} w-full`}
                  >
                    {t.cta}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open source / auditability */}
      <section id="docs" className="container-zaki py-3xl">
        <div className="grid items-center gap-3xl lg:grid-cols-2">
          <div>
            <span className="text-body-sm-strong uppercase tracking-wide text-body">مفتوح وقابل للمراجعة</span>
            <h2 className="mt-md font-display text-display-xl">لا صندوق أسود، ولا اعتماد على مورّد واحد</h2>
            <p className="mt-md text-body-lg text-body">
              زكي مبنيٌّ فوق نماذج لغوية عربية مفتوحة المصدر، خضعت لضبطٍ دقيقٍ على مهام التحليل ودعم
              القرار والصياغة الرسمية. الكود والأوزان متاحة للمراجعة بالكامل تحت رخصة Apache 2.0 —
              فتستطيع فرق الجهة التقنية تدقيقها واستضافتها دون التقيّد بمزوّد.
            </p>
            <div className="mt-2xl flex flex-wrap gap-md">
              <Link href="#" className="pill-primary">
                <GitFork size={18} /> مراجعة الكود
              </Link>
              <Link href="#" className="pill-subtle">
                اقرأ بطاقة النموذج <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md">
            {[
              ["الأساس", "نماذج عربية مفتوحة"],
              ["الضبط", "تحليل ودعم قرار وصياغة"],
              ["الرخصة", "Apache 2.0"],
              ["البيانات", "موثّقة وقابلة للتدقيق"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-canvas-soft p-lg">
                <p className="text-body-sm text-body">{k}</p>
                <p className="mt-xs text-body-md-strong text-ink">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-zaki pb-3xl">
        <h2 className="text-center font-display text-display-xl">أسئلة الجهات الحكومية</h2>
        <div className="mt-2xl">
          <Faq />
        </div>
      </section>

      {/* Contact / procurement */}
      <section id="contact" className="scroll-mt-24 border-t border-canvas-soft bg-primary py-3xl text-on-dark">
        <div className="container-zaki grid gap-3xl lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-body-sm-strong uppercase tracking-wide text-mute">القطاع الحكومي</span>
            <h2 className="mt-md font-display text-display-xl text-on-dark">
              لنبدأ بعرضٍ توضيحيٍّ على بياناتكم
            </h2>
            <p className="mt-md max-w-[520px] text-body-lg text-mute">
              تواصلوا مع فريق القطاع الحكومي لترتيب عرضٍ توضيحيٍّ، ومسارِ إثبات مفهوم، ومناقشة
              متطلبات النشر والأمان والمواءمة التنظيمية الخاصة بجهتكم.
            </p>
            <div className="mt-2xl flex flex-col gap-md">
              <a
                href="mailto:gov@zaki.ai"
                className="inline-flex items-center gap-sm text-body-lg text-on-dark transition-opacity hover:opacity-70"
              >
                <Mail size={20} /> gov@zaki.ai
              </a>
              <span className="inline-flex items-center gap-sm text-body-lg text-mute">
                <Phone size={20} /> فريق مخصّص للجهات الحكومية
              </span>
            </div>
          </div>

          {/* request panel (non-submitting placeholder for the demo) */}
          <div className="rounded-xl bg-canvas p-2xl text-ink">
            <h3 className="font-display text-display-sm">اطلب عرضًا توضيحيًا</h3>
            <p className="mt-xs text-body-sm text-body">يتواصل معكم فريقنا خلال يوم عمل واحد.</p>
            <div className="mt-lg flex flex-col gap-md">
              <input
                className="rounded-md bg-canvas-soft p-lg text-body-md text-ink outline-none placeholder:text-mute"
                placeholder="اسم الجهة"
              />
              <input
                className="rounded-md bg-canvas-soft p-lg text-body-md text-ink outline-none placeholder:text-mute"
                placeholder="البريد الرسمي"
              />
              <textarea
                rows={3}
                className="resize-none rounded-md bg-canvas-soft p-lg text-body-md text-ink outline-none placeholder:text-mute"
                placeholder="حالة الاستخدام المطلوبة"
              />
              <a href="mailto:gov@zaki.ai" className="pill-primary w-full">
                أرسِل الطلب <ArrowLeft size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
