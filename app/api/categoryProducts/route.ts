import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // Read raw body sent from frontend
        const body = await request.json();

        // Validate required fields
        if (!body?.filters || !Array.isArray(body.filters)) {
            return NextResponse.json(
                { error: "Invalid request. Missing filters." },
                { status: 400 }
            );
        }

        // Magento API endpoint
        const magentoUrl =
            "https://www.ansargallery.com/en/rest/V1/ahmarket/products/search";

        // Forward POST request to Magento
        const magentoResponse = await fetch(magentoUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            cache: "no-store",
            body: JSON.stringify(body)
        });

        if (!magentoResponse.ok) {
            const errorText = await magentoResponse.text();
            return NextResponse.json(
                { error: "Magento request failed", details: errorText },
                { status: magentoResponse.status }
            );
        }

        const data = await magentoResponse.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Server error", message: error.message },
            { status: 500 }
        );
    }
}
