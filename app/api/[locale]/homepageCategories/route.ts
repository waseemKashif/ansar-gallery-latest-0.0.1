// app/api/[locale]/homepageCategories/route.ts

import { NextResponse } from "next/server";
import axios from "axios";
import process from "process";

// Next.js 15: params is a Promise
interface RouteParams {
    params: Promise<{ locale: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    // Await params first
    const { locale: localeParam } = await params;

    const token = process.env.NEXT_PUBLIC_API_TOKEN;
    const locale = localeParam || "en";

    try {
        const magentoUrl = `https://www.ansargallery.com/${locale}/rest/V1/activecategories/categories`;
        const response = await axios.get(magentoUrl, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                zoneNumber: "56",
            },
        });
        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}