import Link from "next/link"
import { cn } from "@/lib/utils"
const ShopNowBtn = ({ link, className, children, title, category_id }: { link: string, className?: string, children?: React.ReactNode, title?: string, category_id?: number }) => {
    return (
        <Link href={link} className={cn("text-sm lg:text-[15px] lg:font-semibold bg-white text-black px-3 lg:py-1.5 py-1 rounded w-fit flex items-center ", className)} title={title}><span className="sr-only">{category_id}</span> {children}</Link>
    )
}
export default ShopNowBtn