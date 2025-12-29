"use client";

import Image from "next/image";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, LoaderCircle } from "lucide-react";
import { CartItemType } from "@/types";

interface CartOutOfStockTableProps {
    items: CartItemType[];
    onRemove: (sku: string, id: string) => void;
    isUpdating: boolean;
    baseImageUrl: string;
}

export const CartOutOfStockTable = ({
    items,
    onRemove,
    isUpdating,
    baseImageUrl,
}: CartOutOfStockTableProps) => {
    if (!items || items.length === 0) return null;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-left">Action</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                    <TableRow key={item.product.sku} className="bg-red-50 border-red-50">
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
                        <TableCell>
                            <button
                                onClick={() => onRemove(item.product.sku, item.product.id as string)}
                                className="cursor-pointer"
                                title="Remove"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4 cursor-pointer" />
                                )}
                            </button>
                        </TableCell>
                        <TableCell className="text-right">
                            <span>{Number(item.product.price).toFixed(2)}</span>
                        </TableCell>
                        <TableCell className="text-right text-red-500 font-semibold">
                            <span>Out of stock</span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
