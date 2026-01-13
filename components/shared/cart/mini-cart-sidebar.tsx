"use client";

import { useCartStore } from "@/store/useCartStore";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import SplitingPrice from "../product/splitingPrice";

export const MiniCartSidebar = () => {
    const { items, removeFromCart, updateQuantity, totalPrice } = useCartStore();
    // Handling hydration
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);

    const outOfStockItems = items.filter(item => item.product.is_sold_out);
    const inStockItems = [...items].filter(item => !item.product.is_sold_out).reverse();
    // console.log("inStockItems", inStockItems);
    // console.log("outOfStockItems", outOfStockItems);
    // Define Cart Item Component (local)
    const CartItem = ({ item, removeFromCart, updateQuantity, isOutOfStock }: {
        item: any,
        removeFromCart: (sku: string) => void,
        updateQuantity: (sku: string, qty: number) => void,
        isOutOfStock: boolean
    }) => {
        const imgUrl = item.product.image
            ? (item.product.image.startsWith('http')
                ? item.product.image
                : `${process.env.NEXT_PUBLIC_PRODUCT_IMG_URL}/${item.product.image}`)
            : "/images/placeholder.jpg";

        return (
            <div className={cn("flex flex-col gap-1 border-b pb-4 last:border-0 relative bg-white", isOutOfStock && "pb-0")}>
                <div className="w-full h-32 aspect-square flex-shrink-0  overflow-hidden relative">
                    <Image
                        src={imgUrl}
                        alt={item.product.name}
                        fill
                        className={`object-contain ${isOutOfStock ? 'opacity-50' : ''}`}
                    />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                    {isOutOfStock ? (
                        <div className="text-red-500 font-bold text-xs mt-1 text-center">OUT OF STOCK</div>
                    ) : (
                        <div className="flex flex-col items-center justify-between mt-2">
                            <div className="font-bold text-sm">
                                <span className="text-xs font-normal text-gray-500">QAR</span> {item.product.special_price || item.product.price}
                            </div>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={String(item.quantity)}
                                    // Cast string to number before passing
                                    onValueChange={(val) => updateQuantity(item.product.sku, Number(val))}
                                >
                                    <SelectTrigger className="w-[70px] h-8 text-xs">
                                        <SelectValue placeholder="1" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: Math.min(item.product.max_qty || 10, 100) }, (_, index) => (
                                            <SelectItem value={(index + 1).toString()} key={index}>
                                                {index + 1}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <button
                                    onClick={() => removeFromCart(item.product.sku)}
                                    className=" text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                    {isOutOfStock && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="mt-2 h-7 text-xs bg-red-100 text-red-600 hover:bg-red-200 shadow-none border border-red-200"
                            onClick={() => removeFromCart(item.product.sku)}
                        >
                            Remove <Trash2 size={12} className="ml-1" />
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const subTotal = totalPrice();
    const freeShippingThreshold = 99;
    const remainingForFree = freeShippingThreshold - subTotal;
    const progress = Math.min(100, (subTotal / freeShippingThreshold) * 100);

    if (!hydrated) return null;

    return (
        <div className="flex flex-col h-full w-full">
            {/* Sticky Header */}
            <div className="flex-none p-2 border-b bg-white z-10 sticky top-0">
                <div className="flex justify-end items-center mb-0">
                    <span className="font-bold text-sm sr-only" >Cart</span>
                    <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-secondary">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </SheetClose>
                </div>

                <div className="flex flex-col justify-between items-center mb-2">
                    <span className="text-gray-500 text-sm font-semibold">Total</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm text-gray-500">QAR </span>
                        <span className="font-bold text-xl"><SplitingPrice price={subTotal} /></span>
                    </div>
                </div>

                {remainingForFree > 0 ? (
                    <div className="mb-3 text-sm text-center text-gray-600">
                        Add <span className="font-bold">QAR {remainingForFree.toFixed(2)}</span> more for <span className="text-green-600 font-bold">Free Delivery</span>
                    </div>
                ) : (
                    <div className="mb-3 text-sm text-center text-green-600 font-bold">
                        You have got Free Delivery!
                    </div>
                )}

                {/* Progress Bar Custom */}
                <div className="relative h-2 w-full bg-gray-200 rounded-full mb-6 mt-1">
                    <div
                        className="h-full bg-green-600 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                    <div
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center transition-all duration-300"
                        )}
                        style={{ left: `calc(${progress}% - 15px)` }}
                    >
                        FREE
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    {/* cart Button  */}
                    <Button variant="outline" className="w-full border-gray-300" asChild>
                        <Link href="/cart">Go to cart</Link>
                    </Button>
                </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-0 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                {/* Out of Stock Section */}
                {outOfStockItems.length > 1 && (
                    <div className="bg-red-50/50 pb-2 border border-gray-200 m-1 p-1 rounded-md">
                        <div className="flex justify-between items-center rounded text-red-600 text-sm mb-2 sticky top-0 z-10">
                            <span className=" text-center text-xs">Remove Sold Out items</span>
                            <button
                                onClick={() => {
                                    items.forEach(item => {
                                        if ((item.product.qty || 0) <= 0) removeFromCart(item.product.sku);
                                    })
                                }}
                                className="hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        {outOfStockItems.map((item) => (
                            <CartItem key={item.product.sku} item={item} removeFromCart={removeFromCart} updateQuantity={updateQuantity} isOutOfStock={true} />
                        ))}
                    </div>
                )}
                {outOfStockItems.length === 1 && (
                    <div className="bg-red-50/50 pb-2 border border-gray-200 m-1 p-1 rounded-md">
                        {outOfStockItems.map((item) => (
                            <CartItem key={item.product.sku} item={item} removeFromCart={removeFromCart} updateQuantity={updateQuantity} isOutOfStock={true} />
                        ))}
                    </div>
                )}


                {/* In Stock Items */}
                {inStockItems.map((item) => (
                    <CartItem key={item.product.sku} item={item} removeFromCart={removeFromCart} updateQuantity={updateQuantity} isOutOfStock={false} />
                ))}
            </div>
        </div>
    );
};
