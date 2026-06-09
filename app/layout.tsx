import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

/**
 * Font substitution per design.md "Note on Font Substitutes":
 * UberMove / UberMoveText are proprietary. IBM Plex Sans Arabic is a geometric,
 * engineering-grade Arabic face that matches the brand's neutral, untracked voice
 * and carries full RTL + Latin glyph coverage. Weight 700 = display, 400/500 = text.
 */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: "زكي — ذكاء اصطناعي عربي سيادي للجهات الحكومية",
  description:
    "زكي نموذجٌ لغويٌّ عربيٌّ مفتوح المصدر مبنيٌّ للاستدلال ودعم القرار والصياغة الرسمية. يُنشَر بالكامل داخل بنية الجهة — بياناتكم لا تغادر حدودكم، وكل خطوة قابلة للتدقيق.",
  metadataBase: new URL("https://zaki.ai"),
  openGraph: {
    title: "زكي — ذكاء اصطناعي عربي سيادي للجهات الحكومية",
    description:
      "نموذجٌ عربيٌّ سياديٌّ مفتوح المصدر للقطاع الحكومي: دعم قرار، صياغة رسمية، نشر محلي ومعزول، وبيانات لا تغادر حدودكم.",
    locale: "ar_EG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={plexArabic.variable}
      style={
        {
          // Map the single loaded family onto both display + text token slots.
          "--font-display": "var(--font-arabic)",
          "--font-text": "var(--font-arabic)",
        } as React.CSSProperties
      }
    >
      <body>{children}</body>
    </html>
  );
}
