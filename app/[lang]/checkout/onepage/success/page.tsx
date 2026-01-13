"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MapPin, Phone, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PageContainer from "@/components/pageContainer";
import { useCartStore } from "@/store/useCartStore";

// Global timer for cleanup debounce (pushes cleanup to next tick, handles Strict Mode)
let cleanupTimer: NodeJS.Timeout | undefined;

export default function OrderSuccessPage() {
    const { lastOrderData, setLastOrderData } = useCartStore();
    const router = useRouter();
    const [hydrated, setHydrated] = useState(false);
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const productImageUrl = process.env.NEXT_PUBLIC_PRODUCT_IMG_URL;

    useEffect(() => {
        // Wait for store to likely be ready (in case of hydration lag)
        setHydrated(true);

        // Cancel any pending cleanup from a previous unmount
        if (cleanupTimer) {
            clearTimeout(cleanupTimer);
            cleanupTimer = undefined;
        }

        // Check for Page Refresh
        if (typeof window !== "undefined" && window.performance) {
            const navigation = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
            if (navigation?.type === "reload") {
                if (setLastOrderData) setLastOrderData(null);
                router.push("/");
                return;
            }
        }
    }, [router, setLastOrderData]);

    useEffect(() => {
        // Delay the redirect check slightly to allow Zustand to provide data
        if (hydrated) {
            const timer = setTimeout(() => {
                if (!lastOrderData) {
                    console.error("OrderSuccessPage: Check failed. lastOrderData is missing. Redirecting home.");
                    setShouldRedirect(true);
                } else {
                    console.log("OrderSuccessPage: Data found.", lastOrderData);
                }
            }, 500); // 500ms grace period
            return () => clearTimeout(timer);
        }
    }, [hydrated, lastOrderData]);

    useEffect(() => {
        if (shouldRedirect) {
            router.push("/");
        }
    }, [shouldRedirect, router]);

    useEffect(() => {
        // Clear the data when the component unmounts
        return () => {
            // Debounce the cleanup to ignore Strict Mode double-invocations
            cleanupTimer = setTimeout(() => {
                // Only clear if we are actually leaving the page (not just re-rendering)
                // However, logic here is tricky. Let's rely on the reload check for now.
                // Or maybe we don't clear it at all on unmount, only on reload? 
                // Creating a risk of stale data if user navigates back?
                // For now, let's keep it but ensure it doesn't trigger prematurely.
                if (setLastOrderData) {
                    setLastOrderData(null);
                }
            }, 2000);
        };
    }, [setLastOrderData]);

    if (!hydrated || !lastOrderData) {
        // Show loading instead of null to prevent flash
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                    <div className="border-4 border-gray-100 border-t-primary rounded-full w-12 h-12 animate-spin"></div>
                    <p className="text-gray-500">Loading order details...</p>
                </div>
            </PageContainer>
        );
    }

    const { checkoutData, address, location, paymentMethod, orderId } = lastOrderData;

    // Helper to find payment title
    const paymentTitle = checkoutData.payment.find(p => p.code === paymentMethod)?.title || paymentMethod;


    return (
        <PageContainer>
            <div className="flex flex-col items-center justify-center py-12 space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex rounded-full bg-green-100 p-4 mb-4">
                        <CheckCircle2 className="h-16 w-16 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Order Placed Successfully!</h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>
                    <p>To see your order details, please visit your profile.</p>
                    {orderId && (
                        <div className="bg-gray-50 px-6 py-3 rounded-lg border inline-block">
                            <p className="text-sm text-gray-500 mb-1">Order Number</p>
                            <p className="text-2xl font-bold font-mono text-primary">{orderId}</p>
                        </div>
                    )}
                </div>

                <div className="w-full max-w-4xl grid lg:grid-cols-3 gap-8 text-left">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Items List */}
                        <div className="border rounded-lg p-6 bg-white shadow-sm space-y-4">
                            <h2 className="font-semibold text-lg border-b pb-2">Ordered Items</h2>
                            <div className="space-y-4">
                                {checkoutData.items.map((group, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <div className="text-sm font-medium text-gray-500 bg-gray-50 p-2 rounded flex justify-between">
                                            <span>{group.title} - {group.timeslot}</span>
                                            {group.express && <span className="text-green-600 text-xs px-2 py-0.5 bg-green-100 rounded-full">Express</span>}
                                        </div>
                                        {group.data.map((item, itemIdx) => (
                                            <div key={`${idx}-${itemIdx}`} className="flex gap-4 items-center">
                                                <div className="relative h-16 w-16 bg-gray-100 rounded-md border flex-shrink-0">
                                                    {item.image && (
                                                        <Image
                                                            src={`${productImageUrl}/${item.image}`}
                                                            alt={item.name}
                                                            fill
                                                            className="object-contain p-1"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate" title={item.name}>{item.name}</p>
                                                    <div className="text-sm text-gray-500 flex gap-4 mt-1">
                                                        <span>Qty: {item.qty}</span>
                                                        <span className="font-semibold text-gray-900">QAR {item.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery & Payment */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border rounded-lg p-6 bg-white shadow-sm space-y-3">
                                <h2 className="font-semibold text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gray-500" />
                                    Delivery Address
                                </h2>
                                <div className="text-sm space-y-1 text-gray-600">
                                    <p className="font-medium text-gray-900">{address.firstname} {address.lastname}</p>
                                    <p>{address.customBuildingName}, {address.street}</p>
                                    <p>{address.city}, {address.area}</p>
                                    <p className="flex items-center gap-2 mt-2 pt-2 border-t">
                                        <Phone className="h-4 w-4" />
                                        {address.telephone}
                                    </p>
                                </div>
                                <div className="text-xs bg-gray-50 p-2 rounded text-gray-500 mt-2">
                                    Map: {location.formattedAddress}
                                </div>
                            </div>

                            <div className="border rounded-lg p-6 bg-white shadow-sm space-y-3 h-fit">
                                <h2 className="font-semibold text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-gray-500" />
                                    Payment Method
                                </h2>
                                <p className="text-sm font-medium text-gray-900">{paymentTitle}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <div className="border rounded-lg p-6 bg-white shadow-sm sticky top-24 space-y-4">
                            <h2 className="font-semibold text-lg">Order Summary</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>QAR {checkoutData.total[0].sub_total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span>
                                        {Number(checkoutData.total[0].delivery) === 0 ? "Free" : `QAR ${checkoutData.total[0].delivery}`}
                                    </span>
                                </div>
                                {Number(checkoutData.total[0].discount) > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Discount</span>
                                        <span>- QAR {checkoutData.total[0].discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t pt-4 mt-2">
                                    <span>Total</span>
                                    <span>QAR {checkoutData.total[0].total_amount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            <Button asChild size="lg" className="w-full">
                                <Link href="/">
                                    Continue Shopping
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
