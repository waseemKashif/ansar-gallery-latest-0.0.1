"use client";
import { CartItemType, CatalogProduct } from "@/types";
import { AnimatePresence } from "framer-motion";
import { SwipeableCartItem } from "./swipeable-cart-item";
interface CartInStockTableProps {
    items: CartItemType[];
    onUpdateQuantity: (product: CatalogProduct, qty: number) => void;
    isUpdating: boolean;
    removeSingleItem: (sku: string, id: string) => void;
}

export const CartInStockTable = ({
    items,
    onUpdateQuantity,
    isUpdating,
    removeSingleItem,
}: CartInStockTableProps) => {
    if (!items || items.length === 0) return null;
    return (
        <ul className="space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200">
            <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                    <SwipeableCartItem
                        key={index}
                        item={item}
                        onUpdateQuantity={onUpdateQuantity}
                        isUpdating={isUpdating}
                        removeSingleItem={removeSingleItem}
                    />
                ))}
            </AnimatePresence>
        </ul>
    );
};
