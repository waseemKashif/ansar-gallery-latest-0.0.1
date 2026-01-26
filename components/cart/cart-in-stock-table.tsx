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
import AddToCart from "../shared/product/add-to-cart";
import ConfigurableAddToCart from "../shared/product/ConfigurableAddToCart";
import { AnimatePresence } from "framer-motion";
import { SwipeableCartItem } from "./swipeable-cart-item";
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
        return `${name?.toLowerCase().replace(/[\s/]+/g, "-")}-${safeSku}`;
    }
    console.log("items", items);
    return (
        <ul className="space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200">
            <AnimatePresence mode="popLayout">
                {items.map((item) => (
                    <SwipeableCartItem
                        key={item.product.sku}
                        item={item}
                        onUpdateQuantity={onUpdateQuantity}
                        isUpdating={isUpdating}
                        removeSingleItem={removeSingleItem}
                        baseImageUrl={baseImageUrl}
                    />
                ))}
            </AnimatePresence>
        </ul>
    );
};
