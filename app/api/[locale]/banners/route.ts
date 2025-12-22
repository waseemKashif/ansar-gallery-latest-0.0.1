import { NextResponse } from "next/server";
import axios from "axios";
import process from "process";
import { extractZoneNo } from "@/utils/extractZoneNo";
interface RouteParams {
  params: Promise<{ locale: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const token = process.env.NEXT_PUBLIC_API_TOKEN;
  const { locale: localeParam } = await params;
  const { searchParams } = new URL(request.url);
  const zoneParam = searchParams.get("zone");
  try {
    const response = await axios.get(
      `https://www.ansargallery.com/${localeParam}/rest/V2/banner/slider`,
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
