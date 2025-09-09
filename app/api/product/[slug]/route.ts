import { NextResponse } from "next/server";
import axios from "axios";
import process from "process";

export async function GET(request: Request) {
  console.log("welcome to route")
  const token = process.env.NEXT_PUBLIC_API_TOKEN;

  // Get the slug from URL search params
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  console.log("API Route - Slug from params:", slug);

  if (!slug) {
    return NextResponse.json(
      { error: "Slug parameter is required" },
      { status: 400 }
    );
  }

  // Decode and extract SKU from slug


  try {
    console.log("hit here")
    const response = await axios.get(
      `https://www.ansargallery.com/en/rest/V1/products/${slug}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          zoneNumber: "2",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching product:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to fetch product",
          details: error.response?.data || error.message,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
