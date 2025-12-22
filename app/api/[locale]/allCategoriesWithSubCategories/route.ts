// app/api/[locale]/allCategoriesWithSubCategories/route.ts

import { NextResponse } from "next/server";
import axios from "axios";
import process from "process";
import { extractZoneNo } from "@/utils/extractZoneNo";
import { i18n, type Locale } from "@/lib/i18n";

interface RouteParams {
    params: Promise<{ locale: string }>;
}

export const GET = async (request: Request, { params }: RouteParams) => {
    // Next.js 15: await params
    const { locale: localeParam } = await params;
    const { searchParams } = new URL(request.url);
    const zoneParam = searchParams.get("zone");

    // Validate locale, default to "en"
    const locale: Locale = i18n.locales.includes(localeParam as Locale)
        ? (localeParam as Locale)
        : "en";

    const BASE_URL = `https://www.ansargallery.com/${locale}/rest/V1/`;
    const ENDPOINT = "get/categories";
    const zoneNumber = zoneParam ? extractZoneNo(zoneParam) : "56";
    const token = process.env.NEXT_PUBLIC_API_TOKEN;

    try {
        const apiUrl = `${BASE_URL}${ENDPOINT}?zone=${zoneNumber}`;
        const response = await axios.get(apiUrl, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch categories", details: error?.response?.data || error.message },
            { status: 500 }
        );
    }
};