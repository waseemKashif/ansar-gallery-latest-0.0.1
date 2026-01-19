
import { NextResponse } from "next/server";
import axios from "axios";
import { i18n, type Locale } from "@/lib/i18n";

interface RouteParams {
    params: Promise<{ locale: string; categoryId: string }>;
}

export const GET = async (request: Request, { params }: RouteParams) => {
    const { locale: localeParam, categoryId } = await params;

    const locale: Locale = i18n.locales.includes(localeParam as Locale)
        ? (localeParam as Locale)
        : "en";

    // URL: https://www.ansargallery.com/{locale}/rest/V1/catalog/filters/{categoryID}
    // Fixed double slash issue
    const BASE_URL = `https://www.ansargallery.com/${locale}/rest/V1/`;
    // Removed leading slash from ENDPOINT to avoid double slash with BASE_URL
    const ENDPOINT = `catalog/filters/${categoryId}`;

    const token = process.env.NEXT_PUBLIC_API_TOKEN;

    try {
        const apiUrl = `${BASE_URL}${ENDPOINT}`;

        // Console log for debugging server-side
        console.log(`Fetching Catalog Filters from: ${apiUrl}`);

        const response = await axios.get(apiUrl, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        return NextResponse.json(response.data);
    } catch (error: unknown) {
        let details = "An unexpected error occurred";

        if (axios.isAxiosError(error)) {
            details = error.response?.data || error.message;
            console.error("API Error Details:", details);
        } else if (error instanceof Error) {
            details = error.message;
            console.error("Error Message:", details);
        }

        return NextResponse.json(
            { error: "Failed to fetch filters", details },
            { status: 500 }
        );
    }
};
