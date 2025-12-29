import { splitPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Currency } from "@/lib/constants";
interface SplitingPriceProps {
    price: number;
    className?: string;
    type?: "special" | "normal";
}
const SplitingPrice = ({ price, className, type }: SplitingPriceProps) => {
    const { whole, decimal } = splitPrice(price);
    if (type === "special") {
        return (
            <div className="flex">
                <span className={cn("font-semibold text-2xl", className)}>{whole}</span>
                <div className="flex flex-col ml-1 mt-[2px]">
                    <span className="text-xs font-semibold mb-[-2px]">{decimal}</span>
                    <span className="text-xs font-semibold mt-[-2px]">{Currency}</span>
                </div>
            </div>
        )
    }
    return (
        <div className="flex items-baseline">
            <span className={cn("font-semibold text-xl", className)}>{whole}</span>
            <span className="text-sm font-semibold">{decimal}</span>
        </div>
    );
};

export default SplitingPrice;
