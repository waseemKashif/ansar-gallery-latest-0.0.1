import { NextResponse } from "next/server";
import axios from "axios";
import process from "process";
import { extractZoneNo } from "@/utils/extractZoneNo";

export async function GET(request: Request) {
  const token = process.env.NEXT_PUBLIC_API_TOKEN;
  const { searchParams } = new URL(request.url);
  const zoneParam = searchParams.get("zone");
  try {
    const response = await axios.get(
      "https://www.ansargallery.com/en/rest/V1/bestsellers/3/5/1",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          zoneNumber: zoneParam ? extractZoneNo(zoneParam) : "56",
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
