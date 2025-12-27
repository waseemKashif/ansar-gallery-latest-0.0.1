import { apiClient } from "@/lib/apiClient";

const BASE_URL = "https://www.ansargallery.com";
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
export interface SearchResultItem {
    name: string;
    sku: string;
    id: number;
    price?: number;
    image?: string;
    url_key?: string;
    // Add other loose fields as needed since we are ignoring strict types for now
}

export interface SearchResponse {
    items: SearchResultItem[];
    total_count: number;
}

export const searchProductsApi = async (
    query: string,
    locale: string = "en",
    page: number = 1,
    limit: number = 30,
    zone: number = 56
): Promise<SearchResponse> => {
    if (!query) return { items: [], total_count: 0 };

    // Call our local API route instead of external API directly
    const url = `/api/${locale}/search`;

    try {
        const response = await apiClient<any>(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "zone": `${zone}` // Pass zone to our local API, which will forward it securely
            },
            body: JSON.stringify({
                query,
                page,
                limit,
            }),
        });

        // The local API route already formats the response using mapResponseItems
        // so we just return the data structure directly
        return response;

    } catch (error) {
        console.error("Search API Error:", error);
        return { items: [], total_count: 0 };
    }
};

export const mapResponseItems = (items: any[]): SearchResultItem[] => {
    return items.map((item) => {
        let imageUrl = item.image;

        // If image is not top-level, try to find it in custom_attributes
        if (!imageUrl && item.custom_attributes && Array.isArray(item.custom_attributes)) {
            const imageAttr = item.custom_attributes.find((attr: any) => attr.attribute_code === 'image' || attr.attribute_code === 'small_image' || attr.attribute_code === 'thumbnail');
            if (imageAttr) {
                imageUrl = imageAttr.value;
            }
        }

        // If we found a relative path (starts with /), prepend the media base URL
        if (imageUrl && imageUrl.startsWith("/")) {
            imageUrl = `https://www.ansargallery.com/pub/media/catalog/product${imageUrl}`;
        }


        return {
            id: item.id || item.entity_id || Math.random(), // Fallback to entity_id or random to prevent key collisions if missing
            sku: item.sku,
            name: item.name,
            price: item.price,
            image: imageUrl,
            url_key: item.custom_attributes?.find((a: any) => a.attribute_code === "url_key")?.value || item.url_key,
            special_price: item.special_price ? item.special_price : null,
            ah_qty: item.extension_attributes?.ah_qty,
            ah_max_qty: item.extension_attributes?.ah_max_qty,
            ah_min_qty: item.extension_attributes?.ah_min_qty,
            ah_is_in_stock: item.extension_attributes?.ah_is_in_stock,
        };
    });
};


