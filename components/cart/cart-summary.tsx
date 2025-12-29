"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, ArrowRight } from "lucide-react";

interface CartSummaryProps {
    subTotal: number;
    totalItems: number;
    onProceed: () => void;
    isProceeding: boolean;
    isUpdating: boolean;
    hasItems: boolean;
}

export const CartSummary = ({
    subTotal,
    totalItems,
    onProceed,
    isProceeding,
    isUpdating,
    hasItems,
}: CartSummaryProps) => {
    // Shipping logic from original code: Free if >= 99, otherwise 10
    const isFreeShipping = subTotal >= 99;
    const shippingCost = isFreeShipping ? 0 : 10;

    // Let's check original code. 
    // Original: <span>{totalPrice()}</span> for Subtotal 
    // And <span>{totalPrice().toFixed(2)}</span> for Total (QAR)
    // Shipping price logic: {totalPrice() >= 99 ? ... Free Shipping ... : ... 10 ...}
    // But it doesn't seem to add 10 to the total displayed at the bottom? 
    // Line 350: <span>{totalPrice().toFixed(2)}</span>. 
    // UseCartStore totalPrice() typically returns the sum of products. 
    // The original code MIGHT be visual only or the total calculation in store includes shipping?
    // Let's stick to EXACTLY what the original code did to avoid logic changes. 

    // Original code:
    // Subtotal: totalPrice()
    // Shipping: logic
    // Total: totalPrice().toFixed(2)
    // It seems the Shipping display is just informational or the store handles it? 
    // But if I look closely at line 350: <span>{totalPrice().toFixed(2)}</span>
    // And line 332: <span className="font-bold">{totalPrice()}</span>

    // It seems the original code has a BUG or `totalPrice()` returns a string/number that is just products sum.
    // And the shipping cost is NOT added to the displayed total. 
    // I will replicate the original behavior strictly.
    //  because now backend team will handle the price matters and we need to just display the incoming price as sub total and total amount. 

    return (
        <div>
            <span className="text-lg font-bold text-gray-700">Summary</span>
            <Card className="py-2 px-2 my-2">
                <CardContent className=" gap-4 px-2">
                    <div className="pb-3 text-lg flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-bold">{subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span>No of Items</span>
                        <span>{totalItems}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span>Shipping Price</span>
                        <span>
                            {isFreeShipping ? (
                                <span className="text-green-700"> Free Shipping</span>
                            ) : (
                                <span>10</span>
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between mb-2 font-bold text-xl">
                        <span>Total (QAR)</span>
                        <span>{subTotal.toFixed(2)}</span>
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
                Proceed to checkout
            </Button>
        </div>
    );
};
