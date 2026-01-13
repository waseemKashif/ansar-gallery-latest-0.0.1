"use client";

import { useCartStore } from "@/store/useCartStore";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useRemoveItemsFromCart, useUpdateCart } from "@/lib/cart/cart.api";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export const CartExpressErrorSheet = () => {
    const {
        isExpressErrorSheetOpen,
        expressErrorItems,
        closeExpressErrorSheet,
        setExpressErrorItems,
        removeFromCart
    } = useCartStore();

    const { mutateAsync: removeItems } = useRemoveItemsFromCart();
    const { mutateAsync: updateCart } = useUpdateCart();
    const [isRemoving, setIsRemoving] = useState(false);

    // Convert env var if necessary, or use default
    const baseImageUrl =
        process.env.NEXT_PUBLIC_PRODUCT_IMG_URL ||
        "https://www.ansargallery.com/media/catalog/product";

    const handleRemoveAll = async () => {
        setIsRemoving(true);
        try {
            const itemIds = expressErrorItems.map((item) => item.product.id as string).filter(Boolean);

            // Remove locally first to update UI instantly if needed
            expressErrorItems.forEach((item) => {
                removeFromCart(item.product.sku);
            });

            if (itemIds.length > 0) {
                await removeItems(itemIds);
            }

            // Sync cart again
            await updateCart([]);

            setExpressErrorItems([]);
            closeExpressErrorSheet();
            toast.success("Express items removed successfully");
        } catch (error) {
            console.error("Failed to remove express error items:", error);
            toast.error("Failed to remove items");
        } finally {
            setIsRemoving(false);
        }
    };

    if (!expressErrorItems || expressErrorItems.length === 0) return null;

    return (
        <Sheet open={isExpressErrorSheetOpen} onOpenChange={(open) => !open && closeExpressErrorSheet()}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Delivery Restriction
                    </SheetTitle>
                    <SheetDescription>
                        Express delivery is not available for your selected zone. Please remove the following items to proceed or change the delivery address.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    <div className="space-y-4">
                        {expressErrorItems.map((item) => (
                            <div key={item.product.sku} className="flex gap-4 border p-3 rounded-lg bg-red-50/50 border-red-100">
                                <div className="relative h-16 w-16 flex-shrink-0 border rounded-md bg-white overflow-hidden">
                                    {item.product.image ? (
                                        <Image
                                            src={`${baseImageUrl}${item.product.image}`}
                                            alt={item.product.name}
                                            fill
                                            className="object-contain"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full bg-gray-100 text-xs text-gray-400">
                                            No Img
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-between flex-1">
                                    <span className="text-sm font-medium line-clamp-2" title={item.product.name}>
                                        {item.product.name}
                                    </span>
                                    <div className="flex justify-between items-end mt-1">
                                        <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                        <span className="text-xs font-semibold text-red-500">Not Available</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <SheetFooter className="mt-auto border-t pt-4">
                    <Button
                        variant="destructive"
                        className="w-full gap-2"
                        onClick={handleRemoveAll}
                        disabled={isRemoving}
                    >
                        {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        Remove All Express Items
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
