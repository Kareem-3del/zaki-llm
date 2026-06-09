import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  FileText,
  Languages,
  Scale,
  Server,
  Users,
  ClipboardCheck,
  Database,
  ArrowLeft,
  Landmark,
  Network,
  GitFork,
  FileSearch,
  Globe,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AskCard } from "@/components/AskCard";
import { SovereignData, Institution, DocPipeline, LocalDevice } from "@/components/Illustrations";

const TRUST = [
  { icon: ShieldCheck, label: "سيادة كاملة للبيانات" },
  { icon: Server, label: "نشر داخل بنيتكم" },
  { icon: ClipboardCheck, label: "سجلّات تدقيق شاملة" },
  { icon: Languages, label: "عربيّ أصيل" },
  { icon: GitFork, label: "مفتوح وقابل للمراجعة" },
  { icon: Lock, label: "يعمل بلا اتصال خارجي" },
];

const USE_CASES = [
  { icon: Users, title: "خدمة المواطن", body: "مساعد ذكي يجيب عن استفسارات المواطنين بالعربية على مدار الساعة، ويوجّههم للخدمة الصحيحة." },
  { icon: FileText, title: "صياغة المراسلات الرسمية", body: "تحرير الخطابات والقرارات والمذكّرات بلغة رسمية متّسقة مع دليل الهوية المؤسسية." },
  { icon: FileSearch, title: "تحليل الوثائق واللوائح", body: "تلخيص اللوائح والعقود والتقارير الطويلة، واستخراج البنود والمخاطر والالتزامات." },
  { icon: Scale, title: "دعم القرار", body: "تحليل أثر السياسات والقرارات خطوة بخطوة، مع عرض الافتراضات والمسوّغات بشفافية." },
  { icon: Languages, title: "الترجمة المؤسسية", body: "ترجمة المستندات الرسمية بدقّة وحفاظ على المصطلحات المعتمدة داخل الجهة." },
  { icon: Database, title: "المعرفة الداخلية", body: "البحث والإجابة من وثائق الجهة وأنظمتها الداخلية دون أن تغادر البيانات حدودها." },
];

export default function Home() {
  return (
    <main>
      <Nav />

      {/* ── Hero ── */}
      <section className="container-zaki grid items-center gap-3xl py-3xl lg:grid-cols-2 lg:py-[64px]">
        <div>
          <span className="inline-flex items-center gap-sm rounded-pill bg-canvas-soft px-lg py-sm text-body-sm-strong">
            <ShieldCheck size={15} /> حلٌّ سياديّ · يعمل داخل بنيتكم التحتية
          </span>
          <h1 className="mt-lg font-display text-[36px] leading-[44px] md:text-display-xxl">
            ذكاءٌ اصطناعيٌّ عربيٌّ سياديّ في خدمة الجهات الحكومية
          </h1>
          <p className="mt-lg max-w-[540px] text-body-lg text-body">
            زكي نموذجٌ لغويٌّ عربيٌّ مفتوح المصدر، مبنيٌّ للاستدلال ودعم القرار وصياغة المراسلات
            الرسمية. يُنشَر بالكامل داخل بنية الجهة — بياناتكم لا تغادر حدودكم، وكل خطوة في تحليله
            قابلة للمراجعة والتدقيق.
          </p>
          <div className="mt-2xl flex flex-wrap items-center gap-md">
            <Link href="/models#contact" className="pill-primary text-body-lg">
              اطلب عرضًا توضيحيًا <ArrowLeft size={18} />
            </Link>
            <Link href="/models" className="pill-subtle text-body-lg">
              تعرّف على نموذج النشر
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <AskCard />
        </div>
      </section>

      {/* ── Trust / sovereignty strip ── */}
      <section className="border-y border-canvas-soft bg-canvas">
        <div className="container-zaki flex gap-md overflow-x-auto py-lg no-scrollbar">
          {TRUST.map((c) => {
            const Icon = c.icon;
            return (
              <span key={c.label} className="chip shrink-0">
                <Icon size={16} /> {c.label}
              </span>
            );
          })}
        </div>
      </section>

      {/* ── Why Zaki for government ── */}
      <section className="container-zaki py-[64px]">
        <div className="max-w-[680px]">
          <span className="text-body-sm-strong uppercase tracking-wide text-body">لماذا زكي للقطاع الحكومي</span>
          <h2 className="mt-md font-display text-display-xl">مبنيٌّ للاستدلال، لا لمجرّد الإجابة</h2>
          <p className="mt-md text-body-lg text-body">
            القرار الحكومي لا يحتمل صندوقًا أسود. زكي يعرض خطوات تحليله — الافتراضات، المعطيات،
            والمسوّغات — فيستطيع الموظّف مراجعة المخرَج والوثوق به قبل اعتماده.
          </p>
        </div>

        <div className="mt-3xl grid gap-2xl lg:grid-cols-2">
          <PromoCard
            illustration={<Institution className="h-full w-full" />}
            title="دعم قرار قابل للتدقيق"
            body="يحلّل المسألة خطوة بخطوة ويعرض مسوّغاته بوضوح، فيتحوّل من أداة إجابة إلى أداة دعم قرار يثق بها صنّاع السياسات."
            cta="اطّلع على التفاصيل"
          />
          <PromoCard
            illustration={<DocPipeline className="h-full w-full" />}
            title="معالجة الوثائق بكفاءة"
            body="تلخيص واستخراج وتصنيف للوائح والعقود والتقارير الطويلة، مع الحفاظ على المصطلحات الرسمية المعتمدة."
            cta="جرّب على وثائقكم"
          />
        </div>
      </section>

      {/* ── Sovereignty band (black) ── */}
      <section className="bg-primary text-on-dark">
        <div className="container-zaki grid items-center gap-3xl py-[64px] lg:grid-cols-2">
          <div>
            <span className="text-body-sm-strong uppercase tracking-wide text-mute">سيادة البيانات</span>
            <h2 className="mt-md font-display text-display-xl text-on-dark">
              بياناتكم لا تغادر حدود مؤسستكم
            </h2>
            <p className="mt-md max-w-[500px] text-body-lg text-mute">
              يُنشَر زكي بالكامل داخل مراكز بياناتكم — على بنية معزولة عن الإنترنت إن لزم.
              لا استدعاءات لسحابة أجنبية، ولا بيانات تخرج عن سيطرتكم، ولا اعتماد على مزوّد خارجي.
            </p>
            <div className="mt-2xl flex flex-wrap gap-md">
              <span className="inline-flex items-center gap-sm rounded-pill bg-black-elevated px-lg py-sm text-body-sm-strong text-on-dark">
                <Network size={15} /> دعم البيئات المعزولة (Air-gapped)
              </span>
              <span className="inline-flex items-center gap-sm rounded-pill bg-black-elevated px-lg py-sm text-body-sm-strong text-on-dark">
                <Lock size={15} /> تشفير البيانات أثناء الحفظ والنقل
              </span>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl">
            <SovereignData className="h-full w-full" />
          </div>
        </div>
      </section>

      {/* ── Government use cases ── */}
      <section id="use-cases" className="scroll-mt-24 container-zaki py-[64px]">
        <h2 className="font-display text-display-xl">حالات استخدام في القطاع الحكومي</h2>
        <p className="mt-md max-w-[560px] text-body-lg text-body">
          من خدمة المواطن إلى دعم القرار — منصّة واحدة تخدم مختلف الإدارات بالعربية.
        </p>
        <div className="mt-3xl grid gap-2xl md:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((u) => (
            <FeatureCard key={u.title} icon={u.icon} title={u.title} body={u.body} />
          ))}
        </div>
      </section>

      {/* ── Deployment models ── */}
      <section className="container-zaki pb-[64px]">
        <div className="grid items-center gap-2xl overflow-hidden rounded-xl bg-canvas-soft lg:grid-cols-2">
          <div className="p-3xl">
            <span className="text-body-sm-strong uppercase tracking-wide text-body">نموذج النشر</span>
            <h2 className="mt-md font-display text-display-lg">يُنشَر داخل بنيتكم، بثلاثة خيارات</h2>
            <p className="mt-md text-body-lg text-body">
              على خوادمكم المحلية، أو في سحابة سيادية وطنية، أو في بيئة معزولة بالكامل عن الشبكة —
              يبقى زكي والبيانات تحت سيطرتكم في كل الأحوال.
            </p>
            <ul className="mt-lg flex flex-col gap-md">
              {[
                ["نشر محلي (On-premise)", "على خوادم الجهة، دون أي اعتماد خارجي."],
                ["سحابة سيادية", "داخل حدود الدولة وفق متطلبات الجهات التنظيمية."],
                ["بيئة معزولة (Air-gapped)", "للأنظمة الحسّاسة والمصنّفة، بلا اتصال بالإنترنت."],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-md">
                  <Server size={18} className="mt-[2px] shrink-0" />
                  <span>
                    <span className="text-body-md-strong text-ink">{k}</span>
                    <span className="block text-body-sm text-body">{v}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="h-full min-h-[300px]">
            <LocalDevice className="h-full w-full" />
          </div>
        </div>
      </section>

      {/* ── Security & compliance ── */}
      <section className="container-zaki pb-[64px]">
        <h2 className="font-display text-display-xl">أمنٌ وحوكمةٌ من الأساس</h2>
        <p className="mt-md max-w-[560px] text-body-lg text-body">
          مصمَّم ليتوافق مع متطلبات القطاع الحكومي في حماية البيانات والتحكّم بالوصول.
        </p>
        <div className="mt-3xl grid gap-2xl md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={Users} title="تحكّم بالصلاحيات" body="إدارة وصول قائمة على الأدوار (RBAC) وتكامل مع أنظمة الهويّة المؤسسية." />
          <FeatureCard icon={ClipboardCheck} title="سجلّات تدقيق" body="تسجيل كامل لكل استعلام ومخرَج، يدعم المساءلة والمراجعة الداخلية." />
          <FeatureCard icon={Lock} title="تشفير شامل" body="تشفير البيانات أثناء الحفظ والنقل، مع إدارة مفاتيح داخل بنيتكم." />
          <FeatureCard icon={GitFork} title="شفافية مفتوحة المصدر" body="الكود والأوزان قابلة للمراجعة — لا صندوق أسود، ولا اعتماد على مورّد واحد." />
          <FeatureCard icon={Globe} title="عزل الشبكة" body="يعمل بكفاءة في بيئات معزولة عن الإنترنت دون فقدان أي قدرة." />
          <FeatureCard icon={Landmark} title="مواءمة تنظيمية" body="يُهيّأ ليتوافق مع سياسات حماية البيانات وتصنيف المعلومات المعتمدة لديكم." />
        </div>
      </section>

      {/* ── Showcase card ── */}
      <section className="container-zaki pb-[64px]">
        <div className="relative overflow-hidden rounded-xl bg-primary p-3xl text-on-dark">
          <div className="relative z-10 max-w-[600px]">
            <span className="text-body-sm-strong uppercase tracking-wide text-mute">نسخة القطاع الحكومي</span>
            <h2 className="mt-md font-display text-[36px] leading-[44px] md:text-display-xxl">
              زكي للحكومة · جاهزٌ للنشر السيادي
            </h2>
            <p className="mt-lg text-body-lg text-mute">
              حزمة نشر متكاملة تشمل النماذج، أدوات الحوكمة والتدقيق، والدعم والتدريب — مهيّأة
              للتشغيل داخل بنيتكم في أسابيع.
            </p>
            <Link href="/models#contact" className="mt-2xl inline-flex pill-on-dark text-body-lg">
              احجز عرضًا للجهة <ArrowLeft size={18} />
            </Link>
          </div>
          <div className="pointer-events-none absolute -bottom-16 left-0 hidden opacity-[0.08] lg:block">
            <Institution className="h-[420px] w-[560px]" />
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-canvas-soft">
        <div className="container-zaki flex flex-col items-center gap-lg py-[64px] text-center">
          <h2 className="max-w-[680px] font-display text-display-xl">
            مستعدّون لذكاء اصطناعيٍّ عربيٍّ تحت سيطرتكم الكاملة
          </h2>
          <p className="max-w-[540px] text-body-lg text-body">
            تواصلوا مع فريق القطاع الحكومي لترتيب عرضٍ توضيحيٍّ ومسارِ إثبات مفهوم (PoC) على بياناتكم.
          </p>
          <div className="mt-md flex flex-wrap justify-center gap-md">
            <Link href="/models#contact" className="pill-primary text-body-lg">
              تواصل مع فريق المبيعات الحكومي
            </Link>
            <Link href="/playground" className="pill-subtle text-body-lg">
              جرّب المنصّة
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function PromoCard({
  illustration,
  title,
  body,
  cta,
}: {
  illustration: React.ReactNode;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <article className="card shadow-level-1">
      <div className="overflow-hidden rounded-xl">
        <div className="aspect-[4/3]">{illustration}</div>
      </div>
      <h3 className="mt-2xl font-display text-display-md">{title}</h3>
      <p className="mt-sm text-body-md text-body">{body}</p>
      <button className="mt-lg pill-subtle">{cta}</button>
    </article>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  body: string;
}) {
  return (
    <article className="card border border-canvas-soft">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas-soft">
        <Icon size={22} />
      </div>
      <h3 className="mt-lg font-display text-display-sm">{title}</h3>
      <p className="mt-sm text-body-md text-body">{body}</p>
    </article>
  );
}
