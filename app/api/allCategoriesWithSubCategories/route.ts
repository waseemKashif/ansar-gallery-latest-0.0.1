import { NextResponse } from "next/server";
import axios from "axios";
import process from "process";
import { useZoneStore } from "@/store/useZoneStore";

export const GET = async () => {
    const { zone } = useZoneStore.getState();
    const BASE_URL = "https://www.ansargallery.com/en/rest/V1/";
    const ENDPOINT = "get/categories";
    const zoneNumber = zone || 56;
    const token = process.env.NEXT_PUBLIC_API_TOKEN;
    // if (isLoading) {
    //     return NextResponse.json(
    //         { isLoading: true },
    //         { status: 200 }
    //     );
    // }

    try {
        const response = await axios.get(
            `${BASE_URL}${ENDPOINT}?zone=${zoneNumber}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
};
