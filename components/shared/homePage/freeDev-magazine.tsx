import Link from "next/link"
import Image from "next/image"
const FreeDevMagazine = () => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
            <Link href="/" title="Free Delivery">
                <Image src="/images/free-delivery.webp" alt="FreeDevMagazine" width={500} height={100} />
            </Link>
            <Link href="/" title="Buy Fashion" className="col-span-2 order-first lg:order-none">
                <Image src="/images/wideMidlebanner.webp" alt="FreeDevMagazine" width={800} height={100} className="w-full" />
            </Link>
            <Link href="/" title="View Promotions Booklets" className="flex gap-2 bg-white p-2 rounded-lg overflow-hidden justify-between">
                <div className="flex flex-col text-center justify-center text-xl lg:text-2xl font-semibold grow">
                    <span>View</span>
                    <span className="bg-[#FFE83D] text-[#C9112A] px-2 py-1 font-bold">Promotions</span>
                    <span>Booklets</span>
                </div>
                <Image src="/images/magazine.webp" alt="FreeDevMagazine" width={110} height={100} className=" object-cover flex-shrink-0 " />
            </Link>
        </div>
    )
}
export default FreeDevMagazine