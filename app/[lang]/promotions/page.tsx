"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageContainer from "@/components/pageContainer";
import { fetchCustomProducts, fetchBanners } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { CatalogProduct, ProductRequestBody, BannersData } from "@/types";
import CatalogProductCard from "@/components/shared/product/catalogProductCard";
import { CustomPagination } from "@/components/ui/pagination";
import { useZoneStore } from "@/store/useZoneStore";
import { useLocale } from "@/hooks/useLocale";

export default function PromotionsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { locale } = useLocale();
    const { zone } = useZoneStore();

    const idParam = searchParams.get("id");
    const pageParam = searchParams.get("p");
    const currentPage = pageParam ? parseInt(pageParam) : 1;
    const limit = 30;

    const [results, setResults] = useState<CatalogProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                let body: ProductRequestBody;

                if (!idParam) {
                    // Case: Default Promotions Page
                    body = {
                        page: currentPage,
                        limit: limit,
                        category_id: ["2"],
                        method: "promotion",
                        filters: []
                    };
                } else {
                    // Check if id contains "product_tags="
                    const tagMatch = idParam.match(/product_tags=(\d+)/);

                    if (tagMatch) {
                        // Case: Promotional Tag
                        const tagId = tagMatch[1];
                        body = {
                            page: currentPage,
                            limit: limit,
                            category_id: ["2"],
                            method: "promotion",
                            filters: [
                                {
                                    code: "promo_tag",
                                    options: [tagId]
                                }
                            ]
                        };
                    } else if (idParam === "299") {
                        // Case: New Arrival (ID 299)
                        body = {
                            page: currentPage,
                            limit: limit,
                            category_id: [2],
                            method: "new_arrival",
                            filters: []
                        };
                    } else {
                        // Case: Simple Category ID (numeric) or Fallback
                        body = {
                            page: currentPage,
                            limit: limit,
                            category_id: [idParam],
                            method: "catalog_list",
                            filters: []
                        };
                    }
                }

                const data = await fetchCustomProducts(body, locale);

                if (data && data.items) {
                    setResults(data.items);
                    setTotalCount(data.total_count || 0);
                } else {
                    setResults([]);
                    setTotalCount(0);
                }

            } catch (error) {
                console.error("Promotions API Error:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [idParam, currentPage, locale, zone]);

    const totalPages = Math.ceil(totalCount / limit);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("p", newPage.toString());
        router.push(`/${locale}/promotions?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const [bannerTitle, setBannerTitle] = useState<string | null>(null);

    useEffect(() => {
        setBannerTitle(null);
        const fetchTitle = async () => {
            if (idParam) {
                try {
                    const banners = await fetchBanners(locale, zone);
                    const matchingBanner = banners.find((b: BannersData) => b.category_id === idParam);
                    if (matchingBanner?.title) {
                        setBannerTitle(matchingBanner.title);
                    }
                } catch (error) {
                    console.error("Error fetching banner title:", error);
                }
            }
        };
        fetchTitle();
    }, [idParam, locale, zone]);

    const displayTitle = bannerTitle || (idParam?.includes("product_tags") ? "Promotions" : (!idParam ? "Promotions" : "New Arrivals"));

    return (
        <PageContainer>
            <div className="py-8">
                <h1 className="text-2xl font-bold mb-3">{displayTitle}</h1>
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {results.map((item: CatalogProduct) => (
                                <CatalogProductCard key={item.sku} product={item} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="py-8 mt-4">
                                <CustomPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">No products found.</p>
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
