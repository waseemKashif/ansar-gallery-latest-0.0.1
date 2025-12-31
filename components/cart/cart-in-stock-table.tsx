"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, LoaderCircle, Minus, Plus, Trash } from "lucide-react";
import { CartItemType, CatalogProduct } from "@/types";
import placeholderImage from "@/public/images/placeholder.jpg"
interface CartInStockTableProps {
    items: CartItemType[];
    onIncrease: (product: CatalogProduct) => void;
    onDecrease: (sku: string, qty: number, id: string) => void;
    isUpdating: boolean;
    isPendingIncrease: boolean;
    isPendingDecrease: boolean;
    baseImageUrl: string;
}

export const CartInStockTable = ({
    items,
    onIncrease,
    onDecrease,
    isUpdating,
    isPendingIncrease,
    isPendingDecrease,
    baseImageUrl,
}: CartInStockTableProps) => {
    if (!items || items.length === 0) return null;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-left">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                    <TableRow key={item.product.sku}>
                        <TableCell>
                            <Link
                                href={`/productDetails/${item.product.sku}`}
                                className="flex items-start"
                            >
                                <Image
                                    src={item.product.image || placeholderImage}
                                    alt={item.product.name}
                                    height={77}
                                    width={75}
                                    priority={true}
                                    className="rounded-md"
                                />
                                <div className="flex flex-col justify-between">
                                    <span className="max-w-[300px] overflow-ellipsis line-clamp-2">
                                        {item.product.name}
                                    </span>
                                    <div className="flex items-center gap-2 text-gray-500"><CalendarIcon className="h-4 w-4 text-green-700" /> Tomorrow 7th December </div>
                                </div>
                            </Link>
                        </TableCell>
                        <TableCell className="flex-center gap-2">
                            <div className="border-2 border-black rounded-full flex items-center max-w-[108px] bg-white overflow-clip transition-opacity duration-300">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onDecrease(item.product.sku, item.quantity, item.product.id as string)}
                                    disabled={isPendingDecrease || isUpdating}
                                    className="rounded-full"
                                >
                                    {isPendingDecrease || isUpdating ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : item.quantity === 1 ? (
                                        <Trash className="h-4 w-4" />
                                    ) : (
                                        <Minus className="h-4 w-4" />
                                    )}
                                </Button>
                                <span className="px-2 bg-white">{item.quantity}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onIncrease(item.product)}
                                    disabled={isPendingIncrease || isUpdating}
                                    className="rounded-full"
                                >
                                    {isPendingIncrease || isUpdating ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <span>{Number(item.product.price).toFixed(2)}</span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
