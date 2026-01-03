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
        <>
            <Button
                onClick={(e) => {
                    e.preventDefault(); // Prevent navigating to product page
                    e.stopPropagation();
                    setOpen(true);
                }}
                className={
                    variant === "cardButton"
                        ? "w-full rounded-none bg-primary hover:bg-primary/90 text-white h-9 text-xs font-semibold uppercase tracking-wider"
                        : "w-full"
                }
                size={variant === "cardButton" ? "sm" : "default"}
            >
                {/* <Settings2 className="w-3 h-3 mr-1.5" /> */}
                {optionCount > 0 ? `${optionCount} Options` : "Select Options"}
            </Button>

            <QuickViewModal
                open={open}
                onOpenChange={setOpen}
                product={product}
            />
        </>
    );
}
