"use client";

import { useEffect, useState } from "react";
import { CatalogProduct } from "@/types/index";
import { useLocale } from "./useLocale";

interface DealOfTheDayResponse {
    items: CatalogProduct[];
    total_count: number;
    // other fields if needed
}

export const useDealOfTheDay = () => {
    const { locale } = useLocale();
    const [products, setProducts] = useState<CatalogProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDealOfTheDay = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/${locale}/bannersProductsPromotions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        page: 1,
                        limit: 30,
                        category_id: ["2"],
                        method: "promotion",
                        filters: [
                            {
                                code: "promo_tag",
                                options: ["1038"],
                            },
                        ],
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch deal of the day products");
                }

                const data: DealOfTheDayResponse = await response.json();
                setProducts(data.items || []);
            } catch (err: any) {
                setError(err.message || "An error occurred");
                console.error("Deal of the Day fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (locale) {
            fetchDealOfTheDay();
        }
    }, [locale]);

    return { products, loading, error };
};
