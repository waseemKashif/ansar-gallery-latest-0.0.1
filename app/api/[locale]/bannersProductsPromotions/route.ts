import { NextResponse } from "next/server";
import { extractZoneNo } from "@/utils/extractZoneNo";
interface RouteParams {
    params: Promise<{ locale: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
    const token = process.env.NEXT_PUBLIC_API_TOKEN;
    const BASEURL = process.env.BASE_URL;
    const { searchParams } = new URL(request.url);
    const zoneParam = searchParams.get("zone");
    const locale = (await params).locale || "en";
    try {
        const body = await request.json();

        if (!body?.filters || !Array.isArray(body.filters)) {
            return NextResponse.json(
                { error: "Invalid request. Missing filters." },
                { status: 400 }
            );
        }

        const magentoUrl =
            `${BASEURL}/${locale}/rest/V2/ahmarket/products/search`;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };

        if (zoneParam) {
            headers.zoneNumber = extractZoneNo(zoneParam);
        }

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
