import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import HeaderComponent from "@/components/shared/homePage/HeaderComponent";
import QueryProvider from "@/lib/providers/query-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/footer";
import { APP_NAME, DESCRIPTION, SERVER_URL } from "@/lib/constants";
import { i18n, isRtlLocale, type Locale } from "@/lib/i18n";
import MobileBottomNav from "@/components/shared/mobile-nav/mobile-bottom-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Arabic font
const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
});

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export const metadata: Metadata = {
  title: {
    template: `%s | Ansar Gallery`,
    default: APP_NAME,
  },
  description: DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
};

// Next.js 15: params is now a Promise
interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function RootLayout({ children, params }: LayoutProps) {
  // Await params before using
  const { lang } = await params;
  const validLang = lang as Locale;

  const isRtl = isRtlLocale(validLang);
  const fontClass = isRtl ? cairo.variable : geistMono.variable;

  return (
    <html lang={validLang} suppressHydrationWarning dir={isRtl ? "rtl" : "ltr"}>
      <body
        className={`${geistSans.variable} ${fontClass} ${isRtl ? "font-cairo" : "font-geist-mono"} antialiased bg-[#F9FAFC]`}
      >
        <QueryProvider>
          <div className="flex h-screen flex-col">
            {/* Pass lang to HeaderWrapper which fetches dictionary */}
            <HeaderComponent lang={validLang} />
            <main className="flex-1 wrapper">{children}</main>
            <Footer />
            <MobileBottomNav />
            <Toaster />
          </div>
          <SpeedInsights />
        </QueryProvider>
      </body>
    </html>
  );
}