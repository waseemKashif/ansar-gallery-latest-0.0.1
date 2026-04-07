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
    } catch (error: unknown) {
        return NextResponse.json(
            { error: "Failed to fetch products", details: error as string },
            { status: 500 }
        );
    }
}
