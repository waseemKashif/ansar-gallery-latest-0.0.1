import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/shared/homePage/header";
import QueryProvider from "@/lib/providers/query-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/footer";
import { APP_NAME, DESCRIPTION, SERVER_URL } from "@/lib/constants";
// import { useAuthStore } from "@/store/auth.store";
// import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: `%s | Ansar Gallery`,
    default: APP_NAME,
  },
  description: DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // useEffect(() => {
  //   initializeAuth(); // Load auth from localStorage
  // }, []);
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F9FAFC]`}
      >
        <QueryProvider>
          <div className="flex h-screen flex-col ">
            <Header />
            <main className="flex-1 wrapper">{children}</main>
            <Footer />
            <Toaster />
          </div>
          <SpeedInsights />
        </QueryProvider>
      </body>
    </html>
  );
}
