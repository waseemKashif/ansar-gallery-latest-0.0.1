import { NextRequest, NextResponse } from "next/server";
import { extractZoneNo } from "@/utils/extractZoneNo";

const BASE_URL = "https://www.ansargallery.com";
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
interface RouteParams {
    params: Promise<{ locale: string }>;
}

export async function POST(
    request: NextRequest,
    { params }: RouteParams
) {
    const { locale: localeParam } = await params;
    const { searchParams } = new URL(request.url);
    const zoneParam = searchParams.get("zone");
    const locale = localeParam || "en";
    const zoneNumber = zoneParam ? extractZoneNo(zoneParam) : "56"

    try {
        const body = await request.json();
        const { query, page, limit } = body;

        const url = `${BASE_URL}/${locale}/rest/V2/ahmarket/products/search`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
                "zone": zoneNumber
            },
            body: JSON.stringify({
                limit,
                page,
                query
            })
        });

        if (!response.ok) {
            console.error(`Search API Error: ${response.status} ${response.statusText}`);
            return NextResponse.json(
                { items: [], total_count: 0, error: "Backend API Error" },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Use the shared mapper function
        const result = { items: data.items, total_count: data.total_count };

        return NextResponse.json(result);

    } catch (error) {
        console.error("Search Route Error:", error);
        return NextResponse.json(
            { items: [], total_count: 0, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
