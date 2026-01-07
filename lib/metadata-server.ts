
import { CategoriesWithSubCategories } from "@/types";
import { extractZoneNo } from "@/utils/extractZoneNo";
import { slugify } from "@/lib/utils";

// Server-side fetching logic for metadata
export async function fetchCategoriesServer(locale: string = "en", zone?: string): Promise<CategoriesWithSubCategories[]> {
    const zoneNumber = zone ? extractZoneNo(zone) : "56";
    // Construct absolute URL for the upstream API (bypass local proxy to avoid host resolution issues if possible)
    // Or use the upstream URL directly: https://www.ansargallery.com/${locale}/rest/V1/
    const BASE_URL = `https://www.ansargallery.com/${locale}/rest/V1/`;
    const ENDPOINT = "get/categories";
    const token = process.env.NEXT_PUBLIC_API_TOKEN;

    const apiUrl = `${BASE_URL}${ENDPOINT}?zone=${zoneNumber}`;
    try {
        const response = await fetch(apiUrl, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}

export async function fetchProductServer(slug: string, locale: string = "en") {
    const token = process.env.NEXT_PUBLIC_API_TOKEN;
    const BaseUrl = process.env.BASE_URL || "https://www.ansargallery.com"; // Fallback if env missing

    try {
        const response = await fetch(`${BaseUrl}/${locale}/rest/V2/products/${slug}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                zoneNumber: "2",
            },
            next: { revalidate: 3600 }
        });
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

// Replicate category finding logic
export const findCategoryChain = (
    categories: CategoriesWithSubCategories[],
    targetSlug: string
): CategoriesWithSubCategories[] | undefined => {
    for (const cat of categories) {
        const catSlug = cat.slug || slugify(cat.title);
        if (catSlug === targetSlug) {
            return [cat];
        }
        if (cat.section) {
            const subChain = findCategoryChain(cat.section, targetSlug);
            if (subChain) {
                return [cat, ...subChain];
            }
        }
    }
    return undefined;
};
