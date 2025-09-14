import Image from "next/image";
import Link from "next/link";
import HomePage from "@/components/shared/homePage/homepageCore";
export default async function Home() {
  return (
    <main className=" ">
      {/* <Link href="/products" className=" px-5 py-1 border border-gray-500 rounded-full hover:bg-accent" title="see Products">Go to Products</Link> */}
      <HomePage />
     
    </main>
  );
}
