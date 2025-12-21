import { NextResponse } from "next/server";
import { extractZoneNo } from "@/utils/extractZoneNo";

export async function POST(request: Request, { params }: { params: { locale: string } }) {
    const token = process.env.NEXT_PUBLIC_API_TOKEN;
    const { searchParams } = new URL(request.url);
    const zoneParam = searchParams.get("zone");

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
            `https://www.ansargallery.com/${params.locale}/rest/V1/ahmarket/products/search`;

        // Prepare headers with zone if provided
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };

        if (zoneParam) {
            headers.zoneNumber = extractZoneNo(zoneParam);
        }

        // Forward POST request to Magento
        const magentoResponse = await fetch(magentoUrl, {
            method: "POST",
            headers,
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
    } catch (error) {
        return NextResponse.json(
            { error: "Server error", message: error as string },
            { status: 500 }
        );
    }
}
