import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const response = await axios.get(
      "https://www.ansargallery.com/en/rest/V1/ahmarket-recommendation/buywith-and-recom-product/25249",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer hmgp2e5zrtmlbikvrfl2h4d9s0z5309h",
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
