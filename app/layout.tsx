import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/shared/homePage/header";
import QueryProvider from "@/lib/providers/query-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/footer";
import { APP_NAME , APP_DESCRIPTION} from "@/lib/constants";


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
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,
    default:APP_NAME,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  // themeColor: "#ffffff",
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
    siteName: APP_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/og-image.png"],
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
    // bing: "bing-site-verification-code",
  },
  authors: [{ name: "Ansar Gallery", url: "https://ansargallery.com" }],
  creator: "Waseem Kashif",
  publisher: "Ansar Gallery",
  applicationName: APP_NAME,
  category: "Shopping",
  keywords: [
    "Ansar Gallery",
    "Online Shopping",
    "Electronics",
    "Fashion",
    "Home Appliances",
    "GCC",
    "Retail",
    "Gadgets",
    "Clothing",
    "Accessories",
    "Furniture",
    "Toys",
    "Sports Equipment",
    "Beauty Products",
    "Books",
    "Groceries",
    "Mobile Phones",
    "Laptops",
    "Cameras",
    "Watches",
    "Jewelry",
    "Discounts",
    "Deals",
    "Free Shipping",
    "Customer Service",
    "Secure Payment",
    "New Arrivals",
    "Best Sellers",
    "Gift Cards",
    "Shop Now",
  ],

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <div className="flex h-screen flex-col">
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
