import { NextResponse } from "next/server";

const merchantPasswordLive = "4616a9c64bb8a67b7f9c5130069d8ca5";
const merchantUsernameLive = "merchant.testANSARGAL";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            return NextResponse.json({ error: "Booking ID (Order ID) is required" }, { status: 400 });
        }

        const credentials = `${merchantUsernameLive}:${merchantPasswordLive}`;
        const base64 = Buffer.from(credentials).toString("base64");
        const authHeader = "Basic " + base64;

        const verifyUrl = `https://test-gateway.mastercard.com/api/rest/version/100/merchant/testANSARGAL/order/${orderId}`;

        const response = await fetch(verifyUrl, {
            method: "GET",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Mastercard Verify Error:", text);
            return NextResponse.json({ error: "Failed to verify transaction" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Verify API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
