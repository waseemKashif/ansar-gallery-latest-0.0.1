"use client";

import Image from "next/image";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { CartItemType } from "@/types";
import placeholderImage from "@/public/images/placeholder.jpg"
import { useDictionary } from "@/hooks/useDictionary";
interface CartOutOfStockTableProps {
    items: CartItemType[];
    onRemove: (sku: string, id: string) => void;
    isUpdating: boolean;
    onRemoveAllOOS: () => void;
}

export const CartOutOfStockTable = ({
    items,
    onRemove,
    isUpdating,
    onRemoveAllOOS,
}: CartOutOfStockTableProps) => {
    const { dict } = useDictionary();
    if (!items || items.length === 0) return null;

    return (
        <div>
            <div className="flex items-center justify-between">
                <span className="text-base text-red-500 font-semibold">{dict?.cart?.soldOutItems || "Sold Out Items"}</span>
                <button className="text-base text-red-500 font-semibold flex items-center border px-2 py-1 rounded-lg cursor-pointer hover:bg-red-50" onClick={() => onRemoveAllOOS()}><Trash2 className="h-4 w-4 mr-2" /> {dict?.cart?.clear}</button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{dict?.cart?.item}</TableHead>
                        <TableHead className="text-right">{dict?.cart?.price}</TableHead>
                        <TableHead className="text-right">{dict?.cart?.status}</TableHead>
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
                                        src={item.product.image || placeholderImage}
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
                            <TableCell className="text-right">
                                <span>{Number(item.product.price).toFixed(2)}</span>
                            </TableCell>
                            <TableCell className="text-right text-red-500 font-semibold">
                                <span>{dict?.common?.soldOut}</span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
