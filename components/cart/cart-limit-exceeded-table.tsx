import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { CartItemType, CatalogProduct } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import placeholderImage from "@/public/images/placeholder.jpg";
import LocaleLink from "../shared/LocaleLink";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CartLimitExceededTableProps {
    items: CartItemType[];
    onRemove: (sku: string, id: string, options?: any[]) => void;
    onUpdateQuantity: (product: CatalogProduct, qty: number, options?: any[]) => void;
}

export const CartLimitExceededTable = ({
    items,
    onRemove,
    onUpdateQuantity,
}: CartLimitExceededTableProps) => {
    if (!items || items.length === 0) return null;

    function makeSlug(name: string, sku: string) {
        const safeSku = sku.replace(/-/g, "_");
        return `${name?.toLowerCase().replace(/[\s/]+/g, "-")}-${safeSku}`;
    }

    return (
        <ul className="space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200">
            <AnimatePresence mode="popLayout">
                {items.map((item) => {
                    const productSlug = makeSlug(item.product.name, item.product.sku);
                    const productLink = `/${productSlug}`;

                    return (
                        <motion.li
                            key={item.product.sku + (item.product.selected_assorted_options ? JSON.stringify(item.product.selected_assorted_options) : "")}
                            layout
                            exit={{ opacity: 0, height: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="bg-red-50 p-4 mb-2 lg:mb-0 rounded-lg lg:rounded-none lg:bg-transparent"
                        >
                            <div className="flex gap-4 items-center">
                                {/* Image */}
                                <div className="flex-shrink-0 border rounded-md overflow-hidden bg-white w-20 h-20 relative">
                                    <Image
                                        src={`${item.product.image}` || placeholderImage}
                                        alt={item.product.name}
                                        fill
                                        className="object-contain p-1"
                                    />
                                </div>

                                <div className="flex-grow">
                                    <LocaleLink href={productLink} className="font-semibold text-gray-900 hover:underline line-clamp-2">
                                        {item.product.name}
                                    </LocaleLink>

                                    {/* Assorted Options */}
                                    {item.product.selected_assorted_options && item.product.selected_assorted_options.length > 0 && (
                                        <div className="mt-1 text-sm text-gray-500">
                                            {item.product.selected_assorted_options.map((opt, idx) => (
                                                <span key={idx} className="mr-3">
                                                    {opt.label}: {opt.value}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-2 text-sm text-red-600 font-medium flex items-center gap-2">

                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-700">Requested:</span>
                                            <span>{item.quantity}</span>
                                        </div>
                                        <span className="text-gray-400 mx-1">|</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-700">Available:</span>
                                            <span>{item.product.max_qty || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-700">Change Quantity:</span>
                                            <Select
                                                value={String(item.quantity)}
                                                defaultValue={String(item.product.max_qty)}
                                                onValueChange={(val) =>
                                                    onUpdateQuantity(
                                                        item.product,
                                                        Number(val),
                                                        item.product.selected_assorted_options
                                                    )

                                                }
                                            >
                                                <SelectTrigger className="w-[70px] h-8 text-xs bg-white focus:ring-red-500 placeholder:text-black">
                                                    <SelectValue placeholder={String(item.quantity || 0)} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: (item.product.max_qty || 0) }, (_, index) => (
                                                        <SelectItem value={(index + 1).toString()} key={index}>
                                                            {index + 1}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemove(item.product.sku, item.product.id as string, item.product.selected_assorted_options)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    <span className="sr-only">Remove</span>
                                </Button> */}
                            </div>
                        </motion.li>
                    );
                })}
            </AnimatePresence>
        </ul>
    );
};
