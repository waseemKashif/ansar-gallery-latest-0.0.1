import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string, locale: string }> }
) {
  const token = process.env.NEXT_PUBLIC_API_TOKEN;
  const { slug, locale } = await params;
  console.log("slug", slug, locale);

  if (!slug) {
    return NextResponse.json(
      { error: "Slug parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      `https://www.ansargallery.com/${locale}/rest/V1/products/${slug}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          zoneNumber: "2",
        },
      }
    );

    return NextResponse.json(response.data);
    //  eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(
      "Error fetching product:",
      error?.response?.data || error.message
    );
    return NextResponse.json(
      {
        error: "Failed to fetch product",
        details: error?.response?.data || error.message,
      },
      { status: error?.response?.status || 500 }
    );
  }
}

