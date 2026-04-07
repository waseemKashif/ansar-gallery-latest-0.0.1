"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import Script from "next/script";

function PaymentContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId");
    const [error, setError] = useState<string | null>(null);
    const isConfigured = useRef(false);

    // Exact script from user request
    const htmlLiveScript = "https://test-cbq.mtf.gateway.mastercard.com/static/checkout/checkout.min.js";

    useEffect(() => {
        if (!sessionId) {
            setError("Session ID is missing");
        }
    }, [sessionId]);

    const handleScriptLoad = () => {
        if (!sessionId) return;
        if (isConfigured.current) return;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof (window as any).Checkout === "undefined") {
                console.error("Checkout undefined");
                // sendToParent({ type: "checkout_missing" });
                return;
            }

            console.log("Configuring Checkout with session:", sessionId);
            isConfigured.current = true;

            // Delay configuration to avoid race conditions and ensure DOM is ready
            setTimeout(() => {
                if (!document.body) {
                    console.error("Document body missing");
                    isConfigured.current = false;
                    return;
                }

                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if ((window as any).Checkout) {
                        try {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (window as any).Checkout.configure({
                                merchant: "testANSARGAL",
                                session: { id: sessionId }
                            });

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (window as any).Checkout.showPaymentPage();
                        } catch (e) {
                            console.error("Delayed Checkout Init Error", e);
                            isConfigured.current = false;
                            // sendToParent({ type: "exception", error: e.toString() });
                        }
                    }
                } catch (e) {
                    console.error("Critical checkout error", e);
                }
            }, 500);

        } catch (err: unknown) {
            console.error("Exception in payment init", err);
            // sendToParent({ type: "exception", error: err.toString() });
        }
    };

    if (error) {
        return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
    }

    if (!sessionId) {
        return <div style={{ padding: 20 }}>Initializing...</div>;
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-white">
            <div className="text-center">
                <p className="text-lg font-semibold mb-2">Redirecting to Secure Payment...</p>
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>

            {/* Inline script to define callbacks before the external script loads */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        window.errorCallback = function(error) {
                            console.error("Payment Error:", error);
                            window.location.href = "/cart?error=" + encodeURIComponent(JSON.stringify(error));
                        };
                        window.cancelCallback = function() {
                            console.log("Payment Cancelled");
                            window.location.href = "/cart";
                        };
                        window.completeCallback = function(response) {
                            console.log("Payment Complete:", response);
                            // If response has resultIndicator, pass it
                            var params = "";
                            if (response && response.resultIndicator) {
                                params = "?resultIndicator=" + response.resultIndicator;
                            }
                            window.location.href = "/checkout/onepage/success" + params;
                        };
                    `
                }}
            />

            <Script
                src={htmlLiveScript}
                strategy="lazyOnload"
                onLoad={handleScriptLoad}
                onError={() => {
                    console.error("Script failed to load");
                    // Optional: redirect to cart or show error
                }}
                data-error="errorCallback"
                data-cancel="cancelCallback"
                data-complete="completeCallback"
            />

            {/* Hidden container just in case SDK needs it internally */}
            <div id="nm_payment_target" style={{ display: 'none' }}></div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentContent />
        </Suspense>
    );
}
