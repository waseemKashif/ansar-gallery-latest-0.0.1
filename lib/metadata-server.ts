
import { CategoriesWithSubCategories, SectionItem, FilterType, ProductRequestBody, CatalogProduct, ProductDetailPageType } from "@/types";
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
        const data = await response.json();
        // Add slugs to categories to match client-side processing
        return addSlugsToCategories(data);
    } catch {
        return [];
    }
}

// Helper to recursively add slugs to categories (matches client-side addSelfSlugs)
function addSlugsToCategories(items: CategoriesWithSubCategories[]): CategoriesWithSubCategories[] {
    return items.map(item => {
        const newItem = { ...item };
        newItem.slug = slugify(item.title);
        if (newItem.section && newItem.section.length > 0) {
            newItem.section = addSlugsToCategories(newItem.section as CategoriesWithSubCategories[]) as SectionItem[];
        }
        return newItem;
    });
}

// Fetch category sub-tree from upstream API
export async function fetchCategoryTreeServer(
    categoryId: number | string,
    locale: string = "en"
): Promise<SectionItem[] | null> {
    const token = process.env.NEXT_PUBLIC_API_TOKEN;
    const BaseUrl = process.env.BASE_URL || "https://www.ansargallery.com";

    try {
        const response = await fetch(
            `${BaseUrl}/${locale}/rest/V1/list-of-categories/${categoryId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                next: { revalidate: 3600 } // Cache for 1 hour
            }
        );

        if (!response.ok) return null;
        const data = await response.json();
        // Convert CategoryTreeItem[] to SectionItem[] format for compatibility
        // The API returns { child: [...] } where each child has { id, name, label, image, child? }
        if (data.child && Array.isArray(data.child)) {
            return convertTreeToSectionItems(data.child);
        }
        return null;
    } catch {
        return null;
    }
}

// Convert CategoryTreeItem format to SectionItem format
function convertTreeToSectionItems(items: Array<{ id: string; name: string; label: string; slug: string; image: string; child?: unknown[] }>): SectionItem[] {
    return items
        .filter(item => item.name.toLowerCase() !== 'all') // Filter out "All" category entries
        .map(item => ({
            id: item.id,
            title: item.name,
            image: item.image,
            parent_id: '',
            level: 0,
            position: 0,
            is_active: 1 as const,
            section: item.child && Array.isArray(item.child)
                ? convertTreeToSectionItems(item.child as Array<{ id: string; name: string; label: string; slug: string; image: string; child?: unknown[] }>)
                : [],
            slug: item.slug
        }));
}
export async function fetchProductServer(slug: string, locale: string = "en"): Promise<ProductDetailPageType | null> {
    const token = process.env.NEXT_PUBLIC_API_TOKEN;
    const BaseUrl = process.env.BASE_URL || "https://www.ansargallery.com";

    // Extract SKU from slug - matches client-side logic in ProductDetailView
    // For simple products: "product-name-9120040000000" -> "9120040000000"
    // For configurable products: "product-name-4402000022581_4402000022598" -> "4402000022581-4402000022598"
    const cleanSlug = slug.replace(/\.html$/, '');
    const rawSku = cleanSlug.split("-").pop();
    const sku = rawSku?.replace(/_/g, "-") || cleanSlug;

    try {
        const response = await fetch(`${BaseUrl}/${locale}/rest/V2/products/${sku}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                zoneNumber: "2",
            },
            next: { revalidate: 3600 } // Cache for 1 hour
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

// Find category in SectionItem sub-tree by slug
export const findCategoryInSubTree = (
    items: SectionItem[],
    targetSlug: string
): SectionItem | undefined => {
    for (const item of items) {
        const itemSlug = item.slug || slugify(item.title);
        if (itemSlug === targetSlug) {
            return item;
        }
        if (item.section && item.section.length > 0) {
            const found = findCategoryInSubTree(item.section, targetSlug);
            if (found) return found;
        }
    }
    return undefined;
};

export async function fetchCategoryProductsServer(
    categoryId: number,
    page = 1,
    limit = 30,
    locale: string = "en",
    method: string = "catalog_list",
    filters: FilterType[] = []
): Promise<{ items: CatalogProduct[]; total_count: number } | null> {
    const token = process.env.NEXT_PUBLIC_API_TOKEN;
    // Note: Upstream endpoint from app/api/[locale]/products/search/route.ts
    const url = `https://www.ansargallery.com/${locale}/rest/V2/ahmarket/products/search`;

    // Ensure category_id is in filters if not present
    const filtersToSend = [...filters];
    if (!filtersToSend.some(f => f.code === 'category')) {
        filtersToSend.push({
            code: 'category',
            options: [categoryId]
        });
    }

    const body: ProductRequestBody = {
        page: page,
        limit: limit,
        filters: filtersToSend,
        method: method
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("fetchCategoryProductsServer error:", error);
        return null;
    }
}
