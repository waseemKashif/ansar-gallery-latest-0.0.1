import { splitPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/hooks/useDictionary";


interface SplitingPriceProps {
    price: number;
    className?: string;
    type?: "special" | "normal";
}
const SplitingPrice = ({ price, className, type }: SplitingPriceProps) => {
    const { whole, decimal } = splitPrice(price);
    const { dict } = useDictionary();
    if (type === "special") {
        return (
            <div className="flex items-center  rtl:flex-row-reverse">
                <span className={cn("font-semibold text-2xl", className)}>{whole}</span>
                <div className="flex flex-col rtl:ml-1 ">
                    <span className="text-xs/2 font-semibold ">.{decimal}</span>
                    <span className="text-xs/2 font-semibold mt-1">{dict?.common?.QAR}</span>
                </div>
            </div>
        )
    }
    return (
        <div className="flex items-baseline rtl:flex-row-reverse">
            <span className={cn("font-semibold text-xl", className)}>{whole}</span>
            <span className="text-sm font-semibold rtl:mr-1 flex"><span className="rtl:hidden block">.</span> {decimal} <span className="rtl:block hidden">.</span></span>
        </div>
    );
};

export default SplitingPrice;
