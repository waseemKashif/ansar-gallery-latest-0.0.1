"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, ArrowRight } from "lucide-react";
import { useDictionary } from "@/hooks/useDictionary";

interface CartSummaryProps {
    subTotal: number;
    discount: number;
    totalItems: number;
    onProceed: () => void;
    isProceeding: boolean;
    isUpdating: boolean;
    hasItems: boolean;
    customError?: string | null;
}

export const CartSummary = ({
    subTotal,
    discount,
    totalItems,
    onProceed,
    isProceeding,
    isUpdating,
    hasItems,
    customError,
}: CartSummaryProps) => {
    const { dict } = useDictionary();
    // Calculate final total (Subtotal - Discount)
    const itemsTotal = subTotal - discount;

    // Shipping logic: Free if itemsTotal >= 99, otherwise 10
    const isFreeShipping = itemsTotal >= 99;
    const shippingCost = isFreeShipping ? 0 : 10;

    // Final total calculation
    const finalTotal = itemsTotal + shippingCost;

    return (
        <div>
            <span className="text-lg font-bold text-gray-700">{dict?.cartSummary?.summary}</span>
            <Card className="py-2 px-2 my-2">
                <CardContent className=" gap-4 px-2">
                    <div className="pb-3 text-lg flex justify-between">
                        <span>{dict?.cartSummary?.subtotal}</span>
                        <span className="font-bold">{subTotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="pb-3 text-lg flex justify-between text-green-600">
                            <span>{dict?.cartSummary?.discount}</span>
                            <span className="font-bold text-red-600">-{discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between mb-2">
                        <span>{dict?.cartSummary?.noOfItems}</span>
                        <span>{totalItems}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span>{dict?.cartSummary?.shipping}</span>
                        <span>
                            {isFreeShipping ? (
                                <span className="text-green-600"> {dict?.cartSummary?.freeShipping}</span>
                            ) : (
                                <span>10</span>
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between mb-2 font-bold text-xl">
                        <span>{dict?.cartSummary?.total} ({dict?.common?.QAR})</span>
                        <span>{finalTotal.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
            <Button
                className="w-full mt-3"
                disabled={!hasItems || isProceeding || isUpdating}
                onClick={onProceed}
            >
                {isProceeding ? (
                    <Loader size={20} className="animate-spin" />
                ) : (
                    <ArrowRight size={20} />
                )}{" "}
                {dict?.cartSummary?.proceedToCheckout}
            </Button>
            {customError && (
                <p className="text-red-500 text-sm mt-2 text-center font-medium animate-pulse">
                    {customError}
                </p>
            )}
        </div>
    );
};
