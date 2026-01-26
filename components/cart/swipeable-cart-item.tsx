"use client";

import { motion, useAnimation, useMotionValue, useTransform, PanInfo } from "framer-motion";
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
import { Calendar, Trash, Trash2 } from "lucide-react";
import { CartItemType, CatalogProduct } from "@/types";
import placeholderImage from "@/public/images/placeholder.jpg"
import SplitingPrice from "../shared/product/splitingPrice";
import LocaleLink from "../shared/LocaleLink";
import { cn } from "@/lib/utils";
import { useState } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";

interface SwipeableCartItemProps {
    item: CartItemType;
    onUpdateQuantity: (product: CatalogProduct, qty: number) => void;
    isUpdating: boolean;
    removeSingleItem: (sku: string, id: string) => void;
    baseImageUrl?: string;
}

export const SwipeableCartItem = ({
    item,
    onUpdateQuantity,
    isUpdating,
    removeSingleItem,
    baseImageUrl
}: SwipeableCartItemProps) => {
    const controls = useAnimation();
    const x = useMotionValue(0);
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width: 1020px)");

    function makeSlug(name: string, sku: string) {
        const safeSku = sku.replace(/-/g, "_");
        return `${name?.toLowerCase().replace(/[\s/]+/g, "-")}-${safeSku}`;
    }

    const currentPrice = Number(item.product.price);
    const specialPrice = item.product.special_price ? Number(item.product.special_price) : null;
    const productSlug = makeSlug(item.product.name, item.product.sku);
    const productLink = `/${productSlug}`;

    const handleDragEnd = async (event: any, info: PanInfo) => {
        if (!isMobile) return;

        const offset = info.offset.x;
        const velocity = info.velocity.x;

        // Threshold to open the delete action
        if (offset < -50 || velocity < -500) {
            await controls.start({ x: -80 });
            setIsOpen(true);
        } else {
            await controls.start({ x: 0 });
            setIsOpen(false);
        }
    };

    const handleDelete = () => {
        removeSingleItem(item.product.sku, item.product.id as string);
        // Optionally animate closing or rely on item removal from list
        controls.start({ x: 0 });
    };

    return (
        <motion.li
            layout
            exit={{ x: -300, opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden mb-2 rounded-lg"
        >
            {/* Background / Delete Action Layer - Only on mobile */}
            {isMobile && (
                <div className="absolute inset-y-1/2 right-1 w-24 bg-red-500 rounded-r-lg flex items-center justify-center z-0 h-[98%] translate-y-[-50%]">
                    <button
                        onClick={handleDelete}
                        className="flex flex-col items-center justify-center text-white w-full h-full"
                        disabled={isUpdating}
                    >
                        <Trash2 className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">Remove</span>
                    </button>
                </div>
            )}

            {/* Foreground / Item Content Layer */}
            <motion.div
                className="bg-white relative z-10 flex gap-4 md:gap-6 p-2 rounded-lg border border-gray-100 shadow-sm"
                drag={isMobile ? "x" : false}
                dragConstraints={{ left: -80, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                whileTap={isMobile ? { cursor: "grabbing" } : { cursor: "auto" }}
            >
                {/* Image */}
                <div className="flex-shrink-0 border rounded-md overflow-hidden bg-white w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] relative">
                    <Image
                        src={`${item.product.image}` || placeholderImage}
                        alt={item.product.name}
                        fill
                        className="object-contain p-2"
                    />
                </div>

                {/* Details */}
                <div className="flex-grow flex flex-col justify-between">
                    <div className="space-y-4">
                        <LocaleLink href={productLink} className="font-medium text-sm lg:text-base lg:font-semibold text-gray-900 line-clamp-2 mb-0 lg:mb-2 hover:underline">
                            {item.product.name}
                        </LocaleLink>

                        <div className="lg:flex items-center gap-4 hidden">
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
                                        {Array.from({ length: item.product.max_qty || 0 }, (_, i) => i + 1).map((num) => (
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
                        {/* mobile price */}
                        <div className=" lg:hidden flex flex-col justify-start gap-1">
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
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                        <span>{item.product.delivery_type}</span>
                    </div>
                </div>

                {/* Desktop Price (Hidden on mobile) */}
                <div className=" hidden lg:flex flex-col items-end gap-1">
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

                {/* Mobile Add to Cart/Qty Controls */}
                <div className="lg:hidden flex flex-col items-end justify-between py-1">
                    {/* mobile qty */}
                    <div className="w-fit">
                        <Select
                            disabled={isUpdating}
                            value={item.quantity.toString()}
                            onValueChange={(val) => onUpdateQuantity(item.product, Number(val))}
                        >
                            <SelectTrigger className="h-8 w-16 px-2">
                                <SelectValue placeholder="Qty" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: item.product.max_qty || 0 }, (_, i) => i + 1).map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                        {num}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Drag hint or other mobile specific UI can go here if needed, 
                          but typically the swipe affordance is enough */}
                </div>

            </motion.div>
        </motion.li>
    );
};
