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
            <div className="flex items-center">
                <span className={cn("font-semibold text-2xl", className)}>{whole}</span>
                <div className="flex flex-col ml-1 ">
                    <span className="text-xs/2 font-semibold ">{decimal}</span>
                    <span className="text-xs/2 font-semibold mt-1">{Currency}</span>
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
