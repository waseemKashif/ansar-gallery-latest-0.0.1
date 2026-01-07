import { apiClient } from "@/lib/apiClient";
import { CatalogProduct } from "@/types";
const BASE_URL = "https://www.ansargallery.com";



export interface SearchResponse {
    items: CatalogProduct[];
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
        const response = await apiClient<SearchResponse>(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "zone": `${zone}`
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


export interface SuggestionItem {
    title: string;
    num_results?: string;
}

export const fetchSearchSuggestions = async (
    query: string,
    locale: string = "en"
): Promise<SuggestionItem[]> => {
    if (!query) return [];

    const url = `${BASE_URL}/${locale}/rest/V1/ahmarket/search-multi-suggestion?query=${encodeURIComponent(query)}&website=1`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        // The API returns an array of strings
        // if it do not find any result it returns empty array

        if (Array.isArray(data)) {
            return data.map((item: string) => {
                return {
                    title: item,
                };
            });
        }

        return [];
    } catch (error) {
        console.error("Suggestion API Error:", error);
        return [];
    }
};
