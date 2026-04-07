import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ locale: string; categoryId: string }> }
) {
    const token = process.env.NEXT_PUBLIC_API_TOKEN;
    const BaseUrl = process.env.BASE_URL || "https://www.ansargallery.com";
    const { locale, categoryId } = await params;

    if (!categoryId) {
        return NextResponse.json(
            { error: "Category ID is required" },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `${BaseUrl}/${locale}/rest/V1/list-of-categories/${categoryId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch category tree" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("Error fetching category tree:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
