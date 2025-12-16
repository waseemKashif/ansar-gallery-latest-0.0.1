import { NextResponse } from "next/server";
import axios from "axios";
import process from "process";
import { extractZoneNo } from "@/utils/extractZoneNo";

export const GET = async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const zoneParam = searchParams.get("zone");
    const BASE_URL = "https://www.ansargallery.com/en/rest/V1/";
    const ENDPOINT = "get/categories";
    // Extract numbers from zone string (e.g. "Zone 75" -> "75") or default to "56"
    const zoneNumber = zoneParam ? extractZoneNo(zoneParam) : "56";
    const token = process.env.NEXT_PUBLIC_API_TOKEN;

    try {
        const apiUrl = `${BASE_URL}${ENDPOINT}?zone=${zoneNumber}`;
        const response = await axios.get(
            apiUrl,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch categories", details: error?.response?.data || error.message },
            { status: 500 }
        );
    }
};
