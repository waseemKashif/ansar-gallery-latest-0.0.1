"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentCompleteContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        // Convert search params to object
        const entries = Array.from(searchParams.entries());
        // const data = Object.fromEntries(entries);
        const queryString = new URLSearchParams(entries as any).toString();

        console.log("PaymentCompletePage MOUNTED. Redirecting to success...");

        // Redirect to success page (Middleware should handle locale)
        router.push(`/checkout/onepage/success?${queryString}`);

    }, [searchParams, router]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h2>Processing Payment...</h2>
            <p>You are being redirected.</p>
        </div>
    );
}

export default function PaymentCompletePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentCompleteContent />
        </Suspense>
    );
}
