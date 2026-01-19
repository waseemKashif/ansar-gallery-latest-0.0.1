import { NextResponse } from "next/server";

const merchantPasswordLive = process.env.NEXT_PUBLIC_MERCHANT_PASSWORD_LIVE;
const merchantUsernameLive = process.env.NEXT_PUBLIC_MERCHANT_USERNAME_LIVE;
const createSessionUrlLive = process.env.NEXT_PUBLIC_CREATE_SESSION_URL_LIVE || "https://test-gateway.mastercard.com/api/rest/version/100/merchant/testANSARGAL/session";

export async function POST(request: Request) {
    try {
        const { orderId, amount } = await request.json();

        const body = {
            apiOperation: "INITIATE_CHECKOUT",
            order: {
                currency: "QAR",
                amount: amount,
                id: orderId,
                reference: orderId,
                description: `Order Number: ${orderId} , Order Amount: ${amount}`,
            },
            transaction: {
                reference: orderId,
            },
            interaction: {
                operation: "PURCHASE",
                returnUrl: "https://www.ansargallery.com",
                merchant: {
                    name: "Ansar Gallery",
                    url: "https://www.ansargallery.com",
                    address: {
                        line1: "Jeera Zone, Barwa Commercial Avenue, Industrial Area Road",
                        line2: null,
                        line3: "56",
                        line4: "Qatar",
                    },
                    email: "customercare@ansargallery.com",
                    phone: "+97444486000",
                    logo: "https://media-qatar.ansargallery.com/mastercard/logs/default/ansar-gallery_1_.png",
                },
                displayControl: {
                    shipping: "HIDE",
                    customerEmail: "HIDE",
                    billingAddress: "HIDE",
                },
            },
        };

        const credentials = `${merchantUsernameLive}:${merchantPasswordLive}`;
        const base64 = Buffer.from(credentials).toString("base64");
        const authHeader = "Basic " + base64;

        const response = await fetch(createSessionUrlLive, {
            method: "POST",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Request Failed");
        }

        const json = await response.json();
        const sId = json?.session?.id || null;

        if (sId) {
            return NextResponse.json({ sessionId: sId });
        } else {
            return NextResponse.json({ error: "No session ID returned" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Error in API route:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
