import { NextResponse } from "next/server";
import axios from "axios";
import process from "process";

export async function GET() {
  const token = process.env.NEXT_PUBLIC_API_TOKEN;
  try {
    const response = await axios.get(
      "https://www.ansargallery.com/en/rest/V1/ahmarket-recommendation/buywith-and-recom-product/27256",
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
