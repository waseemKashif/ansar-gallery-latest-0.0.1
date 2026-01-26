"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // Or another appropriate icon
import { CatalogProduct, ProductDetailPageType } from "@/types";
import { QuickViewModal } from "./QuickViewModal";
import { fetchProductDetailsApi } from "@/lib/api";
import { useLocale } from "@/hooks/useLocale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AssortedAddToCartProps {
    product: CatalogProduct;
    variant?: "default" | "cardButton";
    className?: string;
}

export default function AssortedAddToCart({ product, variant = "default", className }: AssortedAddToCartProps) {
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

    return (
        <div className={cn(" absolute bottom-2 right-2 z-10 ", className)}>
            <Button
                onClick={handleOpenQuickView}
                disabled={isLoading}
                className={
                    variant === "cardButton"
                        ? " max-w-[80px] text-black  transition-opacity duration-500 rounded-full border-2 border-black  hover:bg-black cursor-pointer bg-white hover:text-white "
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
                                {product.option_count ? product.option_count > 0 ? `${product.option_count} Option` : "Select Options" : "Select Options"}
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
