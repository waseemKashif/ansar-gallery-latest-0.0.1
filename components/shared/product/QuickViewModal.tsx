"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CatalogProduct } from "@/types";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import placeholderImage from "@/public/images/placeholder.jpg";
import SplitingPrice from "./splitingPrice";
import { ShoppingCart } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface QuickViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: CatalogProduct;
}

export function QuickViewModal({ open, onOpenChange, product }: QuickViewModalProps) {
    // 1. Extract Attributes from configured_data
    // structure of configured_data: [{ sku, price, config_attributes: [{ code, label, value }] }]
    // We need to group by code/label to create selectors

    // Initial State
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [selectedVariant, setSelectedVariant] = useState<any | null>(null);

    const attributes = useMemo(() => {
        // cast to any to bypass strict type check for now if interface isn't fully updated yet
        // or ensure CatalogProduct interface has configurable_data as any[]
        const variants = product.configurable_data;
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
    }, [product.configurable_data]);


    // Find matching variant when selections change
    useEffect(() => {
        const variants = product.configurable_data;
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
    }, [selectedAttributes, product.configurable_data, attributes]);


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
    }, [open, attributes]);


    const handleAttributeSelect = (code: string, value: string) => {
        setSelectedAttributes(prev => ({
            ...prev,
            [code]: value
        }));
    };

    // Determine default display variant: First variant from configurable_data if no selection made
    const defaultVariant = product.configurable_data && product.configurable_data.length > 0
        ? product.configurable_data[0]
        : null;

    const displayVariant = selectedVariant || defaultVariant;

    // Use selectedVariant price/special_price if available, otherwise defaultVariant, then fallback to product level
    const rawPrice = displayVariant?.price ?? product.price;
    const currentPrice = Number(rawPrice);

    const rawSpecialPrice = displayVariant?.special_price ?? product.special_price;
    const currentSpecialPrice = rawSpecialPrice ? Number(rawSpecialPrice) : null;

    // Determine image: Selected variant image -> Product main image -> Placeholder
    // Note: User data suggests 'url' within 'images' array for variants
    let displayImage = placeholderImage;
    if (displayVariant?.images && displayVariant.images.length > 0) {
        // Check if image object has 'url' or 'file' property based on different API responses seen
        const firstImg = displayVariant.images[0];
        displayImage = firstImg.url || firstImg.file || placeholderImage;
    } else if (product.image) {
        displayImage = product.image;
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

                                            if (code === "color") {
                                                return (
                                                    <div
                                                        key={value}
                                                        className="flex flex-col items-center gap-1 cursor-pointer"
                                                        onClick={() => handleAttributeSelect(code, value)}
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
                                                    onClick={() => handleAttributeSelect(code, value)}
                                                    className={`px-3 py-1.5 rounded-md border text-sm transition-all ${isSelected
                                                        ? "border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary"
                                                        : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
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
                        <div className="pt-4 border-t">
                            <Button className="w-full text-base py-6" size="lg">
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

