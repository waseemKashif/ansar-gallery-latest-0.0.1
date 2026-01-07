import { cn } from "@/lib/utils";

const OutOfStockLabel = (props: { className?: string, children?: React.ReactNode }) => {
    return (
        <div className={cn(" text-xs w-fit bg-red-500  text-white rounded-l-md px-2 py-1 absolute bottom-2 right-0", props.className)}   >
            {props.children}
        </div>
    );
};

export default OutOfStockLabel;