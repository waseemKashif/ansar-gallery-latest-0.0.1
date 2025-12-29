"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoaderCircle, Minus, Plus, Trash } from "lucide-react";
import { CartItemType, CatalogProduct } from "@/types";

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
                                className="flex items-center"
                            >
                                <Image
                                    src={`${baseImageUrl}${item.product.image}`}
                                    alt={item.product.name}
                                    height={77}
                                    width={75}
                                    priority={true}
                                    className="rounded-md"
                                />
                                <span className="max-w-[300px] overflow-ellipsis line-clamp-2">
                                    {item.product.name}
                                </span>
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
