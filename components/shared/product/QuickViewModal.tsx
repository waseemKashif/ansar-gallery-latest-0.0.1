"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductDetailPageType, ConfigurableProductVariant, CatalogProduct } from "@/types";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import placeholderImage from "@/public/images/placeholder.jpg";
import SplitingPrice from "./splitingPrice";
import { ShoppingCart, Plus, Minus, Trash, CircleSlash } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface QuickViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: ProductDetailPageType;
}

export function QuickViewModal({ open, onOpenChange, product }: QuickViewModalProps) {
    const { items, addToCart, removeSingleCount } = useCartStore();
    // 1. Extract Attributes from configured_data
    // structure of configured_data: [{ sku, price, config_attributes: [{ code, label, value }] }]
    // We need to group by code/label to create selectors

    // Initial State
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [selectedVariant, setSelectedVariant] = useState<ConfigurableProductVariant | null>(null);
    console.log("the product quick view", product);
    const attributes = useMemo(() => {
        // Handle both API response structures
        const variants = product.configured_data;
        if (!variants) return {};

        const attrs: Record<string, { label: string, values: Set<string> }> = {};

        variants.forEach((variant) => {
            variant.config_attributes.forEach((attr) => {
                if (!attrs[attr.code]) {
                    attrs[attr.code] = { label: attr.label, values: new Set() };
                }
                attrs[attr.code].values.add(attr.value);
            });
        });

        // Convert Sets to Arrays for rendering
        const processedAttrs: Record<string, { label: string, values: string[] }> = {};
        Object.keys(attrs).forEach(key => {
            processedAttrs[key] = {
                label: attrs[key].label,
                values: Array.from(attrs[key].values)
            };
        });

        return processedAttrs;
    }, [product.configured_data]);

    // Find matching variant when selections change
    useEffect(() => {
        const variants = product.configured_data;
        if (!variants || Object.keys(selectedAttributes).length === 0) return;

        // Try to find a variant that matches ALL selected attributes
        // Note: In real world, we need to handle incomplete selections if not all attributes are picked yet.
        // Assuming we force all to be picked or partial match is just for display.

        const match = variants.find((variant) => {
            return variant.config_attributes.every((attr) => {
                // If attribute is selected, it must match
                return selectedAttributes[attr.code] ? selectedAttributes[attr.code] === attr.value : true;
            });
        });

        if (match) {
            // If we have a full match (or best guess), update displayed variant
            // To be strict: check if number of keys in selectedAttributes === number of config_attributes
            if (Object.keys(selectedAttributes).length === Object.keys(attributes).length) {
                setSelectedVariant(match);
            }
        }
    }, [selectedAttributes, product.configured_data, attributes]);


    // Default selection (optional: select first options)
    useEffect(() => {
        if (open && Object.keys(selectedAttributes).length === 0 && Object.keys(attributes).length > 0) {
            const defaults: Record<string, string> = {};
            // Simple default strategy: pick first available value for each attribute
            Object.keys(attributes).forEach(key => {
                defaults[key] = attributes[key].values[0];
            });
            setSelectedAttributes(defaults);
        }
    }, [open, attributes, selectedAttributes]);


    // Helper to check if an option is available given current selections
    const isOptionAvailable = (attributeCode: string, attributeOptionValue: string) => {
        const sourceData = product?.configured_data;
        if (!sourceData) return true;

        return sourceData.some((variant) => {
            const variantAttributes = variant.config_attributes;
            // Check if variant has the target option
            const hasTarget = variantAttributes.some(
                (attr) => attr.code === attributeCode && attr.value === attributeOptionValue
            );
            if (!hasTarget) return false;

            // Check compatibility with other selected options
            return Object.entries(selectedAttributes).every(([selectedCode, selectedValue]) => {
                if (selectedCode === attributeCode) return true; // Skip the attribute we're testing
                return variantAttributes.some(
                    (attr) => attr.code === selectedCode && attr.value === selectedValue
                );
            });
        });
    };

    const handleAttributeSelect = (code: string, value: string) => {
        setSelectedAttributes(prev => ({
            ...prev,
            [code]: value
        }));
    };

    // Determine default display variant: First variant from configurable_data if no selection made
    const defaultVariant = product.configured_data && product.configured_data.length > 0
        ? product.configured_data[0]
        : null;

    const displayVariant = selectedVariant || defaultVariant;

    // Use selectedVariant price/special_price if available, otherwise defaultVariant, then fallback to product level
    const currentPrice = displayVariant ? Number(displayVariant.price) : Number(product.price);
    const maxQty = displayVariant ? (displayVariant.max_qty ?? 0) : (product.ah_max_qty || 100);

    let currentSpecialPrice: number | null = null;
    let currentPercentage: string | number | null = null;

    if (displayVariant) {
        currentSpecialPrice = displayVariant.special_price ? Number(displayVariant.special_price) : null;
        currentPercentage = displayVariant.percentage || null;
    } else {
        currentSpecialPrice = product.special_price ? Number(product.special_price) : null;
        currentPercentage = product.percentage_value || null;
    }

    // Determine Stock Status
    // Logic: If variant selected, check its qty/stock. If not, check global.
    // However, API response shows min_qty/max_qty on variants.
    // Use `ah_is_in_stock` from product for general availability or variant specific if available.

    // Correction: Configured variants in 'configured_data' might not have 'ah_is_in_stock' directly, 
    // but usually have 'is_in_stock' or we infer from qty.
    // The sample response shows 'ah_is_in_stock' on the main product. 




    // Determine image: Selected variant image -> Product main image -> Placeholder
    // Note: User data suggests 'url' within 'images' array for variants
    let displayImage = placeholderImage;
    if (displayVariant?.images && displayVariant.images.length > 0) {
        // Check if image object has 'url' or 'file' property based on different API responses seen
        const firstImg = displayVariant.images[0];
        displayImage = firstImg.url || (firstImg as any).file || placeholderImage;
    } else if (product.images && product.images.length > 0) {
        displayImage = product.images[0].url;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{product.name}</DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 mt-4">
                    {/* Left: Image */}
                    <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image
                            src={displayImage}
                            alt={product.name}
                            width={500}
                            height={500}
                            className="object-contain w-full h-full"
                        />
                    </div>

                    {/* Right: Details & Options */}
                    <div className="space-y-6">
                        {/* Price */}
                        <div>
                            {currentSpecialPrice ? (
                                <div className="flex flex-col">
                                    <div className="flex gap-x-2 items-baseline">
                                        <SplitingPrice price={currentSpecialPrice} type="special" />
                                    </div>
                                    <div className="flex gap-x-2 items-baseline mt-1">
                                        <span className="text-gray-500 text-sm">Was</span>
                                        <span className="line-through text-gray-500"><SplitingPrice price={currentPrice} className="text-gray-500 font-medium" /></span>
                                        {currentPercentage && <span className="text-green-700 font-semibold text-lg">save {currentPercentage}%</span>}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-x-1">
                                    <span className="text-gray-500 text-sm">QAR</span>
                                    <SplitingPrice price={currentPrice} className="text-2xl" />
                                </div>
                            )}
                        </div>

                        {/* Attribute Selectors */}
                        <div className="space-y-4">
                            {Object.keys(attributes).map((code) => (
                                <div key={code} className="space-y-2">
                                    <Label className="capitalize font-semibold">{attributes[code].label}</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {attributes[code].values.map((value) => {
                                            const isSelected = selectedAttributes[code] === value;
                                            const isAvailable = isOptionAvailable(code, value);

                                            if (code === "color") {
                                                return (
                                                    <div
                                                        key={value}
                                                        className={`flex flex-col items-center gap-1 transition-all ${!isAvailable ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                                                        onClick={() => {
                                                            if (isAvailable) handleAttributeSelect(code, value);
                                                        }}
                                                    >
                                                        <div
                                                            title={value}
                                                            className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected
                                                                ? "border-primary ring-2 ring-primary ring-offset-2"
                                                                : "border-gray-200 hover:border-gray-300"
                                                                }`}
                                                            style={{ backgroundColor: value.toLowerCase() }}
                                                            aria-label={`Select color ${value}`}
                                                        />
                                                        <span className={`text-xs ${isSelected ? "font-semibold text-primary" : "text-gray-600"}`}>
                                                            {value}
                                                        </span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <button
                                                    key={value}
                                                    disabled={!isAvailable}
                                                    onClick={() => handleAttributeSelect(code, value)}
                                                    className={`px-3 py-1.5 rounded-md border text-sm transition-all ${isSelected
                                                        ? "border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary"
                                                        : "border-gray-200 text-gray-700"
                                                        } ${!isAvailable
                                                            ? "opacity-50 cursor-not-allowed bg-gray-100 hover:border-gray-200"
                                                            : "hover:border-gray-300 hover:bg-gray-50 bg-white"
                                                        }`}
                                                >
                                                    {value}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add to Cart Actions */}
                        <div className="pt-4 border-t space-y-3">
                            {/* Stock Status Message */}
                            {maxQty === 0 ? (
                                <div className="text-red-600 font-semibold">Sold Out</div>
                            ) : (
                                <div className="text-sm text-green-600 font-medium">In Stock</div>
                            )}

                            {(() => {
                                const cartItem = displayVariant ? items.find(i => i.product.sku === displayVariant.sku) : null;
                                const qty = cartItem ? cartItem.quantity : 0;

                                const handleAdd = () => {
                                    if (!displayVariant) return;

                                    if (qty >= maxQty) {
                                        toast.error("Max quantity reached");
                                        return;
                                    }

                                    const imageUrl = (typeof displayImage === 'string') ? displayImage : displayImage.src;

                                    const cartProduct: CatalogProduct = {
                                        ...product,
                                        id: displayVariant.sku,
                                        sku: displayVariant.sku,
                                        price: Number(displayVariant.price),
                                        special_price: displayVariant.special_price ? Number(displayVariant.special_price) : null,
                                        image: imageUrl,
                                        thumbnail: imageUrl,
                                        is_configure: true,
                                        name: product.name,
                                        configured_data: undefined,
                                        configurable_data: undefined
                                    } as CatalogProduct;

                                    addToCart(cartProduct, 1);
                                    if (qty === 0) toast.success("Added to cart");
                                };

                                const handleRemove = () => {
                                    if (!displayVariant) return;
                                    removeSingleCount(displayVariant.sku);
                                };

                                if (qty > 0) {
                                    return (
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="flex items-center border-2 border-black rounded-full overflow-hidden bg-white">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handleRemove}
                                                    className="h-12 w-12 hover:bg-gray-100"
                                                >
                                                    {qty === 1 ? <Trash className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                                                </Button>
                                                <span className="w-12 text-center font-semibold text-lg">{qty}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handleAdd}
                                                    className="h-12 w-12 hover:bg-gray-100"
                                                    disabled={qty >= maxQty}
                                                >
                                                    {qty >= maxQty ? <CircleSlash className="h-5 w-5 text-gray-400" /> : <Plus className="h-5 w-5" />}
                                                </Button>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {qty} in cart
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    maxQty > 0 ? (
                                        <Button
                                            className="w-full text-base py-3 bg-primary hover:bg-primary/80 text-white"
                                            size="lg"
                                            onClick={handleAdd}
                                            disabled={!displayVariant}
                                        >
                                            <ShoppingCart className="mr-2 h-5 w-5" />
                                            {displayVariant ? "Add to Cart" : "Select Options"}
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full text-base py-3 bg-gray-300 text-gray-500 cursor-not-allowed"
                                            size="lg"
                                            disabled
                                        >
                                            Sold Out
                                        </Button>
                                    )
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

