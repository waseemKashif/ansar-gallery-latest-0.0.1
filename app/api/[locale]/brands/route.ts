import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request, props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const Token = process.env.NEXT_PUBLIC_API_TOKEN;

  try {
    const response = await axios.get(
      `https://www.ansargallery.com/${locale}/rest/V1/brands`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Token}`,
        },
      }
    );

    // The API returns { "brands": [...] }
    // We map it to ensure all fields are present and compatible
    const brandsData = response.data;

    if (brandsData && Array.isArray(brandsData.brands)) {
      // Map to ensure compatibility and default values
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      brandsData.brands = brandsData.brands.map((brand: any) => ({
        ...brand,
        value: brand.id, // Map id to value for compatibility
        logo: brand.image || brand.logo || "", // Ensure logo is set from image
        description: brand.description || "",
      }));

      // Also provide 'items' for backward compatibility if we don't want to refactor everything immediately
      // but ideally we switch to 'brands'. I'll add 'items' as an alias.
      brandsData.items = brandsData.brands;
    }

    return NextResponse.json(brandsData);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { brands: [], items: [], error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

