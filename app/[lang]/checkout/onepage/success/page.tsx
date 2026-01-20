"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/pageContainer";
import { useCartStore } from "@/store/useCartStore";

export default function OrderSuccessPage() {
    const { lastOrderId, setLastOrderId, clearCart } = useCartStore();
    const [hydrated, setHydrated] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        setHydrated(true);
        // Clear cart on success page load
        clearCart();
    }, [clearCart]);

    useEffect(() => {
        const verifyPayment = async () => {
            if (!lastOrderId) return;
            setIsVerifying(true);
            try {
                const res = await fetch(`/api/verify-payment?orderId=${lastOrderId}`);
                const data = await res.json();

                // Check if payment captured
                // Typical Mastercard response structure checks
                // We look for "CAPTURED" or "PAYMENT_CAPTURED" in transactions
                if (data.transaction && data.transaction.length > 0) {
                    // Check latest transaction
                    const latest = data.transaction[data.transaction.length - 1];
                    if (latest && (latest.status === "CAPTURED")) {
                        setPaymentStatus("Payment Successfully Captured");
                        clearCart();
                    } else {
                        setPaymentStatus("Payment Status: " + (latest?.status || "Failed"));
                    }
                }
                else {
                    setPaymentStatus("Payment Status: " + (data?.status || "Failed"));
                }

            } catch (error) {
                console.error("Payment verification failed", error);
            } finally {
                setIsVerifying(false);
            }
        };

        if (hydrated && lastOrderId) {
            verifyPayment();
        }
    }, [hydrated, lastOrderId]);

    // Prevent hydration mismatch
    if (!hydrated) return null;

    return (
        <PageContainer>
            <div className="flex flex-col items-center justify-center py-20 space-y-8 min-h-[60vh]">
                <div className="text-center space-y-6 max-w-md mx-auto">
                    <div className="inline-flex rounded-full bg-green-100 p-6 mb-2 animate-in zoom-in duration-300">
                        <CheckCircle2 className="h-20 w-20 text-green-600" />
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Order Placed Successfully!</h1>

                    <p className="text-gray-500 text-lg">
                        Thank you for your purchase from Ansar Gallery. Your order has been confirmed and is being processed.
                    </p>

                    {lastOrderId ? (
                        <div className="bg-gray-50 px-8 py-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:bg-white hover:shadow-md">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Order Number</p>
                            <p className="text-4xl font-bold font-mono text-primary tracking-tight select-all">{lastOrderId}</p>

                            {/* Payment Verification Status */}
                            {isVerifying ? (
                                <p className="text-sm text-blue-500 mt-2">Verifying payment...</p>
                            ) : paymentStatus ? (
                                <div className="mt-4 p-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                                    {paymentStatus}
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                            Order ID processing... check your profile for details.
                        </div>
                    )}

                    <div className="pt-4 space-y-3">
                        <p className="text-sm text-gray-500">
                            You will receive an email confirmation shortly.
                            <br />
                            To track your order, please visit your profile.
                        </p>
                    </div>

                    <div className="pt-8 w-full">
                        <Button asChild size="lg" className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all" onClick={() => {
                            if (setLastOrderId) setLastOrderId(null);
                        }}>
                            <Link href="/">
                                Check Other Products
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
