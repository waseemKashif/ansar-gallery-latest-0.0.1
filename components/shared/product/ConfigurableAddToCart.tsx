"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Settings2, Loader2 } from "lucide-react"; // Or another appropriate icon
import { CatalogProduct, ProductDetailPageType } from "@/types";
import { QuickViewModal } from "./QuickViewModal";
import { fetchProductDetailsApi } from "@/lib/api";
import { useLocale } from "@/hooks/useLocale";
import { toast } from "sonner";

interface ConfigurableAddToCartProps {
    product: CatalogProduct;
    variant?: "default" | "cardButton";
}

export default function ConfigurableAddToCart({ product, variant = "default" }: ConfigurableAddToCartProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [detailedProduct, setDetailedProduct] = useState<ProductDetailPageType | null>(null);
    const { locale } = useLocale();

    const handleOpenQuickView = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        try {
            setIsLoading(true);
            const rawSku = product.sku?.split("-").pop(); // Prepare SKU similar to logic in ProductDetailView
            const cleanSku = rawSku?.replace(/_/g, "-") || product.url_key; // Fallback to url_key if sku processing similar to page logic isn't exact match, but usually URL key or SKU works. Let's try consistent approach.
            // Actually, fetchProductDetailsApi takes 'slug' which often implies URL key or ID.
            // Looking at ProductDetailView: fetchProductDetailsApi(sku!, locale)

            const effectiveSlug = product.sku || product.url_key;

            const data = await fetchProductDetailsApi(effectiveSlug, locale);

            setDetailedProduct(data);
            setOpen(true);
        } catch (error) {
            console.error("Failed to fetch product details", error);
            toast.error("Failed to load product options. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

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
                onClick={handleOpenQuickView}
                disabled={isLoading}
                className={
                    variant === "cardButton"
                        ? " max-w-[80px] text-gray-800  transition-opacity duration-500 rounded-full border-2 border-gray-800  hover:bg-gray-800 cursor-pointer bg-white hover:text-white "
                        : "w-full"
                }

            // size={variant === "cardButton" ? "sm" : "default"}
            >
                <span className="flex items-center gap-x-1 flex-col leading-4">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            Add
                            <span className="text-xs/2 text-gray-500 ">
                                {optionCount > 0 ? `${optionCount} Options` : "Select Options"}
                            </span>
                        </>
                    )}
                </span>
                {/* <Settings2 className="w-3 h-3 mr-1.5" /> */}
            </Button>

            {open && detailedProduct && (
                <QuickViewModal
                    open={open}
                    onOpenChange={setOpen}
                    product={detailedProduct}
                />
            )}
        </div>
    );
}
