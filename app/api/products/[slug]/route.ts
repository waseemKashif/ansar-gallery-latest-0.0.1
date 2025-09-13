import { NextResponse } from "next/server";
import axios from "axios";
import process from "process";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const token = process.env.NEXT_PUBLIC_API_TOKEN;
  const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }
  try {
    const response = await axios.get(
      `https://www.ansargallery.com/en/rest/V1/ahmarket-recommendation/buywith-and-recom-product/${slug}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          zoneNumber: "2",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

