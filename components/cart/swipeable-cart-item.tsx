"use client";

import { motion, useAnimation, useMotionValue, PanInfo } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, Minus, Plus, Trash, Trash2, LoaderCircle } from "lucide-react";
import { CartItemType, CatalogProduct } from "@/types";
import placeholderImage from "@/public/images/placeholder.jpg"
import SplitingPrice from "../shared/product/splitingPrice";
import LocaleLink from "../shared/LocaleLink";
import { useState } from "react";
import { useDictionary } from "@/hooks/useDictionary";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface SwipeableCartItemProps {
    item: CartItemType;
    onUpdateQuantity: (product: CatalogProduct, qty: number, options?: any[]) => Promise<void>;
    isUpdating: boolean;
    removeSingleItem: (sku: string, id: string, options?: any[]) => Promise<void>;
}

export const SwipeableCartItem = ({
    item,
    onUpdateQuantity,
    isUpdating,
    removeSingleItem,
}: SwipeableCartItemProps) => {
    const { dict } = useDictionary();
    const controls = useAnimation();
    const x = useMotionValue(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState<'plus' | 'minus' | 'qty' | 'delete' | null>(null);
    const isMobile = useMediaQuery("(max-width: 1020px)");

    function makeSlug(name: string, sku: string) {
        const safeSku = sku.replace(/-/g, "_");
        return `${name?.toLowerCase().replace(/[\s/]+/g, "-")}-${safeSku}`;
    }

    const currentPrice = Number(item.product.price);
    const specialPrice = item.product.special_price ? Number(item.product.special_price) : null;
    const productSlug = makeSlug(item.product.name, item.product.sku);
    const productLink = `/${productSlug}`;

    const handleUpdate = async (newQty: number, type: 'plus' | 'minus' | 'qty') => {
        setLoadingAction(type);
        try {
            await onUpdateQuantity(item.product, newQty, item.product.selected_assorted_options);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleDelete = () => {
        // Trigger removal immediately without waiting for API
        // Optimistic update in parent will remove item from list, triggering exit animation
        removeSingleItem(item.product.sku, item.product.id as string, item.product.selected_assorted_options);
    };

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
                        <span className="text-xs font-medium">{dict?.common?.remove}</span>
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
                <div className="flex-grow flex flex-col justify-start lg:justify-between">
                    <div className="space-y-4">
                        <LocaleLink href={productLink} className="font-medium text-sm lg:text-base lg:font-semibold text-gray-900 line-clamp-2 mb-0 lg:mb-2 hover:underline">
                            {item.product.name}
                        </LocaleLink>

                        {/* Assorted Options Display */}
                        {item.product.selected_assorted_options && item.product.selected_assorted_options.length > 0 && (
                            <div className="mt-2 space-y-1 mb-0">
                                {item.product.selected_assorted_options.map((opt, idx) => (
                                    <div key={idx} className="text-sm text-gray-500 flex gap-2">
                                        <span className="font-medium">{opt.label}:</span>
                                        <span>{opt.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="lg:flex items-center gap-4 hidden mb-0">
                            <div className="w-fit">
                                <Select
                                    disabled={isUpdating}
                                    value={item.quantity.toString()}
                                    onValueChange={(val) => onUpdateQuantity(item.product, Number(val), item.product.selected_assorted_options)}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Qty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: Math.min(item.product.max_qty || 0, 100) }, (_, i) => i + 1).map((num) => (
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
                                onClick={() => removeSingleItem(item.product.sku, item.product.id as string, item.product.selected_assorted_options)}
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
                                        <span className="text-sm text-gray-500">{dict?.common?.QAR}</span>
                                        <span className="text-gray-400 line-through text-lg font-medium"><SplitingPrice price={currentPrice} /></span>
                                        <span className="text-red-600 text-xl font-bold"><SplitingPrice price={specialPrice} /></span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm text-gray-500">{dict?.common?.QAR}</span>
                                    <span className="text-gray-900 text-xl font-bold"><SplitingPrice price={currentPrice} /></span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                            <span>{item.product.delivery_type}</span>
                        </div>
                        {/* Mobile Add to Cart/Qty Controls */}
                        <div className="lg:hidden flex flex-col items-end justify-end py-1">
                            {/* mobile qty */}
                            <div className="flex items-center border border-primary rounded-full overflow-hidden bg-white">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => item.quantity === 1 ? handleDelete() : handleUpdate(item.quantity - 1, 'minus')}
                                    className="h-8 px-2 hover:bg-gray-100 rounded-none border-none shadow-none focus:ring-0"
                                    disabled={isUpdating || loadingAction !== null}
                                >
                                    {loadingAction === 'minus' ? (
                                        <LoaderCircle className="w-3 h-3 animate-spin text-gray-500" />
                                    ) : (
                                        item.quantity === 1 ? <Trash className="w-4 h-4 text-gray-500" /> : <Minus className="w-4 h-4" />
                                    )}
                                </Button>

                                <div className="h-9 flex items-center justify-center bg-white min-w-[3rem]">
                                    <Select
                                        disabled={isUpdating || loadingAction !== null}
                                        value={item.quantity.toString()}
                                        onValueChange={(val) => handleUpdate(Number(val), 'qty')}
                                    >
                                        <SelectTrigger className="w-full h-full border-0 shadow-none focus:ring-0 px-1 gap-1 justify-center rounded-none bg-transparent">
                                            {loadingAction === 'qty' ? (
                                                <LoaderCircle className="w-3 h-3 animate-spin text-gray-500" />
                                            ) : (
                                                <SelectValue placeholder="Qty" />
                                            )}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: Math.min(item.product.max_qty || 100, 100) }, (_, i) => i + 1).map((num) => (
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
                                    onClick={() => handleUpdate(item.quantity + 1, 'plus')}
                                    className="h-8 px-2 hover:bg-gray-100 rounded-none border-none shadow-none focus:ring-0"
                                    disabled={isUpdating || item.quantity >= (item.product.max_qty || 100) || loadingAction !== null}
                                >
                                    {loadingAction === 'plus' ? (
                                        <LoaderCircle className="w-3 h-3 animate-spin text-gray-500" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>

                            {/* Drag hint or other mobile specific UI can go here if needed, 
                          but typically the swipe affordance is enough */}
                        </div>
                    </div>

                </div>

                {/* Desktop Price (Hidden on mobile) */}
                <div className=" hidden lg:flex flex-col items-end gap-1">
                    {specialPrice ? (
                        <>
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm text-gray-500">{dict?.common?.QAR}</span>
                                <span className="text-gray-400 line-through text-lg font-medium"><SplitingPrice price={currentPrice} /></span>
                                <span className="text-red-600 text-xl font-bold"><SplitingPrice price={specialPrice} /></span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm text-gray-500">{dict?.common?.QAR}</span>
                            <span className="text-gray-900 text-xl font-bold"><SplitingPrice price={currentPrice} /></span>
                        </div>
                    )}
                </div>



            </motion.div>
        </motion.li>
    );
};
