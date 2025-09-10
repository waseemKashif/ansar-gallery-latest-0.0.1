import Image from "next/image";
import Link from "next/link";
export default async function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col md:flex-row gap-[32px] row-start-2 items-center sm:items-start">
        <Link href="/products" className=" px-5 py-1 border border-gray-500 rounded-full hover:bg-accent" title="see Products">Go to Products</Link>
        <Link href="/bestSeller" className=" px-5 py-1 border border-gray-500 rounded-full hover:bg-accent" title="Best Sellers">Go to Best Seller</Link>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://ansargallery.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Ansar Gallery
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://play.google.com/store/apps/details?id=com.ahmarkets.ecom"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Goto Application
        </a>
      </footer>
    </div>
  );
}
