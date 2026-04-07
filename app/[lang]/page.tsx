import HomePage from "@/components/shared/homePage/homepageCore";
import { Locale } from "@/lib/i18n";

interface PageProps {
  params: Promise<{
    lang: Locale;
  }>;
}

export default async function Home({ params }: PageProps) {
  const { lang } = await params;
  return (
    <div className=" ">
      {/* <Link href="/products" className=" px-5 py-1 border border-gray-500 rounded-full hover:bg-accent" title="see Products">Go to Products</Link> */}
      <HomePage lang={lang} />
    </div>
  );
}
