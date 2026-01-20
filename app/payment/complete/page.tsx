"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentCompletePage() {
    const searchParams = useSearchParams();

    useEffect(() => {
        // Convert search params to object
        const entries = Array.from(searchParams.entries());
        const data = Object.fromEntries(entries);

        console.log("Payment Complete Redirect Reached", data);

        // Send message to parent window
        if (window.opener) {
            window.opener.postMessage(JSON.stringify({ type: "complete", data }), "*");
        } else if (window.parent) {
            window.parent.postMessage(JSON.stringify({ type: "complete", data }), "*");
        }

    }, [searchParams]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h2>Payment Processing...</h2>
            <p>Please wait while we confirm your payment.</p>
        </div>
    );
}
