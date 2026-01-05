"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react"; // Or another appropriate icon
import { CatalogProduct } from "@/types";
import { QuickViewModal } from "./QuickViewModal";

interface ConfigurableAddToCartProps {
    product: CatalogProduct;
    variant?: "default" | "cardButton";
}

export default function ConfigurableAddToCart({ product, variant = "default" }: ConfigurableAddToCartProps) {
    const [open, setOpen] = useState(false);

    // Calculate number of options/variations
    // Option A: Count unique configuration keys (e.g. Color, Size = 2 Options)
    // Option B: Count total variants (e.g. 12 combinations)
    // User requested "show options count", usually means "2 options available" (attributes) or "12 variants"
    // Let's assume distinct attributes count for now as it's cleaner info.
    const optionCount = useMemo(() => {
        const variants = product.configurable_data || product.configured_data;
        if (variants && variants.length > 0) {
            return variants[0].config_attributes.length;
        }
        return 0;
    }, [product.configurable_data, product.configured_data]);

    return (
        <div className=" absolute bottom-2 right-2 z-10 ">
            <Button
                onClick={(e) => {
                    e.preventDefault(); // Prevent navigating to product page
                    e.stopPropagation();
                    setOpen(true);
                }}
                className={
                    variant === "cardButton"
                        ? " max-w-[80px] text-gray-800  transition-opacity duration-500 rounded-full border-2 border-gray-800  hover:bg-gray-800 cursor-pointer bg-white hover:text-white "
                        : "w-full"
                }

            // size={variant === "cardButton" ? "sm" : "default"}
            >
                <span className="flex items-center gap-x-1 flex-col leading-4">
                    Add
                    <span className="text-xs/2 text-gray-500 ">
                        {optionCount > 0 ? `${optionCount} Options` : "Select Options"}
                    </span>
                </span>
                {/* <Settings2 className="w-3 h-3 mr-1.5" /> */}
            </Button>

            <QuickViewModal
                open={open}
                onOpenChange={setOpen}
                product={product}
            />
        </div>
    );
}
