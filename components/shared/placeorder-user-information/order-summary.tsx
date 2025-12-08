"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartItemType } from "@/types";
import { ArrowRight } from "lucide-react";



const OrderSummary = (items: CartItemType[], totalPrice: () => number, totalItems: () => number, canProceed: boolean, isPersonalValid: () => boolean, isAddressValid: () => boolean, isEditingPersonal: boolean, isEditingAddress: boolean) => {
    return (
        <div className="lg:col-span-1">
            <Card className="sticky top-4">
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="max-h-48 overflow-y-auto space-y-3">
                        {items.map((item) => (
                            <div key={item.product.sku} className="flex gap-3 text-sm">
                                <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="truncate">{item.product.name}</p>
                                    <p className="text-gray-500">x{item.quantity}</p>
                                </div>
                                <p className="font-medium">
                                    {(item.product.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal ({totalItems()} items)</span>
                            <span>QAR {totalPrice().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Shipping</span>
                            <span className={totalPrice() >= 99 ? "text-green-600" : ""}>
                                {totalPrice() >= 99 ? "Free" : "QAR 10.00"}
                            </span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total</span>
                            <span>QAR {(totalPrice() + (totalPrice() >= 99 ? 0 : 10)).toFixed(2)}</span>
                        </div>
                    </div>

                    {!canProceed && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                            {!isPersonalValid() && <p>• Complete your personal information</p>}
                            {!isAddressValid() && <p>• Add your shipping address</p>}
                            {(isEditingPersonal || isEditingAddress) && <p>• Save your changes</p>}
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
};

export default OrderSummary;