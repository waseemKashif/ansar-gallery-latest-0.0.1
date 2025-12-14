import cn from "clsx"
const DiscountPercentage = ({ discount, className }: { discount: number, className?: string }) => {

    return (
        <span className={cn(`absolute top-2 right-1 rounded-full bg-[#CC190C] text-white px-1.5 py-0.5 font-medium text-sm`, className)}>{-discount}%</span>
    )
}
export default DiscountPercentage