"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Script from "next/script";

function PaymentContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId");
    const [error, setError] = useState<string | null>(null);

    // Exact script from user request
    const htmlLiveScript = "https://test-cbq.mtf.gateway.mastercard.com/static/checkout/checkout.min.js";

    useEffect(() => {
        if (!sessionId) {
            setError("Session ID is missing");
        }
    }, [sessionId]);

    const handleScriptLoad = () => {
        if (!sessionId) return;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof (window as any).Checkout === "undefined") {
                console.error("Checkout undefined");
                sendToParent({ type: "checkout_missing" });
                return;
            }

            // Bind callbacks to window so Mastercard script can find them if it looks for globals
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).errorCallback = (error: any) => {
                sendToParent({ type: "error", data: error });
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).cancelCallback = () => {
                sendToParent({ type: "cancel" });
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).completeCallback = (response: any) => {
                sendToParent({ type: "complete", data: response });
            };

            console.log("Configuring Checkout with session:", sessionId);

            // Match user snippet: configure only with session ID
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Checkout.configure({
                session: { id: sessionId }
            });

            sendToParent({ type: "configured" });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Checkout.showEmbeddedPage("#embed-target",
                (data: any) => {
                    console.log("Checkout complete", data);
                    sendToParent({ type: "complete", data: data });
                }
            );

        } catch (err: any) {
            console.error("Exception in payment init", err);
            sendToParent({ type: "exception", error: err.toString() });
        }
    };

    const sendToParent = (msg: any) => {
        if (window.parent) window.parent.postMessage(JSON.stringify(msg), "*");
    };

    if (error) {
        return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
    }

    if (!sessionId) {
        return <div style={{ padding: 20 }}>Initializing...</div>;
    }

    return (
        <>
            <style jsx global>{`
                html, body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    background: #ffffff;
                }
                #embed-wrapper {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                    background: white;
                }
                #embed-target {
                    width: 100%;
                    min-height: 100%;
                    background: white;
                }
            `}</style>

            <Script
                src={htmlLiveScript}
                strategy="lazyOnload"
                onLoad={handleScriptLoad}
                onError={() => {
                    sendToParent({ type: "error", data: "Script failed to load" });
                }}
            />

            <div id="embed-wrapper">
                <div id="embed-target"></div>
            </div>
        </>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentContent />
        </Suspense>
    );
}
