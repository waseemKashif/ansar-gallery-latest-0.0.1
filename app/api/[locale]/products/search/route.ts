import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request, props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const token = process.env.NEXT_PUBLIC_API_TOKEN;

    if (!token) {
        return NextResponse.json(
            { error: "API token not configured" },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();

        const response = await axios.post(
            `https://www.ansargallery.com/${locale}/rest/V2/ahmarket/products/search`,
            body,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Error fetching products:", error.response?.data || error.message);
        return NextResponse.json(
            { items: [], error: "Failed to fetch products" },
            { status: error.response?.status || 500 }
        );
    }
}
