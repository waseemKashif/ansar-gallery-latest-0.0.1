"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, Trash } from "lucide-react";
import { CartItemType, CatalogProduct } from "@/types";
import placeholderImage from "@/public/images/placeholder.jpg"
import SplitingPrice from "../shared/product/splitingPrice";
import LocaleLink from "../shared/LocaleLink";
interface CartInStockTableProps {
    items: CartItemType[];
    onUpdateQuantity: (product: CatalogProduct, qty: number) => void;
    isUpdating: boolean;
    removeSingleItem: (sku: string, id: string) => void;
    baseImageUrl: string;
}

export const CartInStockTable = ({
    items,
    onUpdateQuantity,
    isUpdating,
    removeSingleItem,
    baseImageUrl,
}: CartInStockTableProps) => {
    if (!items || items.length === 0) return null;
    function makeSlug(name: string, sku: string) {
        // Replace hyphens with underscores in SKU to ensure safe splitting later
        const safeSku = sku.replace(/-/g, "_");
        return `${name.toLowerCase().replace(/[\s/]+/g, "-")}-${safeSku}`;
    }

    return (
        <ul className="divide-y divide-gray-200">
            {items.map((item) => {
                const currentPrice = Number(item.product.price);
                const specialPrice = item.product.special_price ? Number(item.product.special_price) : null;
                const productSlug = makeSlug(item.product.name, item.product.sku);
                const productLink = `/${productSlug}`;
                return (
                    <li key={item.product.sku} className="py-2 flex gap-4 md:gap-6">
                        {/* Image */}
                        <div className="flex-shrink-0 border rounded-md overflow-hidden bg-white w-[100px] h-[100px] relative">
                            <Image
                                src={item.product.image || placeholderImage}
                                alt={item.product.name}
                                fill
                                className="object-contain p-2"
                            />
                        </div>

                        {/* Details */}
                        <div className="flex-grow flex flex-col justify-between">
                            <div className="space-y-4">
                                <LocaleLink href={productLink} className="font-semibold text-gray-900 line-clamp-2 hover:underline">
                                    {item.product.name}
                                </LocaleLink>

                                <div className="flex items-center gap-4">
                                    <div className="w-fit">
                                        <Select
                                            disabled={isUpdating}
                                            value={item.quantity.toString()}
                                            onValueChange={(val) => onUpdateQuantity(item.product, Number(val))}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Qty" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                                    <SelectItem key={num} value={num.toString()}>
                                                        {num}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSingleItem(item.product.sku, item.product.id as string)}
                                        disabled={isUpdating}
                                        className="text-gray-500 hover:text-red-500 hover:bg-red-50 h-9 px-2"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mt-2">
                                <Calendar className="w-4 h-4 mr-2 text-green-600" />
                                <span>Delivery 7 January</span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex flex-col items-end gap-1">
                            {specialPrice ? (
                                <>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm text-gray-500">QAR</span>
                                        <span className="text-gray-400 line-through text-lg font-medium"><SplitingPrice price={currentPrice} /></span>
                                        <span className="text-red-600 text-xl font-bold"><SplitingPrice price={specialPrice} /></span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm text-gray-500">QAR</span>
                                    <span className="text-gray-900 text-xl font-bold"><SplitingPrice price={currentPrice} /></span>
                                </div>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};
