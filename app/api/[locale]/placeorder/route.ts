import { NextResponse } from "next/server";
export async function POST(request: Request) {
    const token = process.env.NEXT_PUBLIC_API_TOKEN;
    const BASEURL = process.env.NEXT_PUBLIC_API_URL;
    try {
        const body = await request.json();
        console.log("place order the body is", body);
        const magentoEndPoint = `${BASEURL}/placeorder`
        const magentoResponse = await fetch(magentoEndPoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        if (!magentoResponse.ok) {
            const errorText = await magentoResponse.text();
            return NextResponse.json(
                { error: "Failed to place order", details: errorText },
                { status: magentoResponse.status }
            );
        }
        const response = await magentoResponse.json();
        console.log("place order the response is", response);
        return NextResponse.json(response);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to place order", details: error as string },
            { status: 500 }
        );
    }

}