"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageContainer from "@/components/pageContainer";
import { fetchCustomProducts, fetchBanners } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { CatalogProduct, ProductRequestBody, BannersData } from "@/types";
import CatalogProductCard from "@/components/shared/product/catalogProductCard";
import { CustomPagination } from "@/components/ui/pagination";
import { useZoneStore } from "@/store/useZoneStore";
import { useLocale } from "@/hooks/useLocale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCardSkeleton from "@/components/shared/product/productCardSkeleton";


function PromotionsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { locale } = useLocale();
    const { zone } = useZoneStore();

    const idParam = searchParams.get("id");
    const pageParam = searchParams.get("p");
    const currentPage = pageParam ? parseInt(pageParam) : 1;

    const [results, setResults] = useState<CatalogProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = useState<string>("position");
    const [limit, setLimit] = useState(30);



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
                    } else if (idParam === "new_arrival=2") {
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
    }, [idParam, currentPage, limit, locale, zone]); // Added limit to dependency array

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalCount);

    // Sort products
    const sortedResults = useMemo(() => {
        if (!results.length) return [];

        const sorted = [...results];
        switch (sortBy) {
            case "name_asc":
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case "name_desc":
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case "price_asc":
                return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
            case "price_desc":
                return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
            default:
                return sorted;
        }
    }, [results, sortBy]);

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
            <div className="pb-8">
                <h1 className="text-2xl font-bold mb-3">{displayTitle}</h1>
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-1 lg:gap-4">
                        {[...Array(limit)].map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <>

                        {/* Product Listing Controls */}
                        <div className="bg-white p-2 mb-4 flex flex-wrap justify-between items-center gap-4">
                            <div className="text-sm text-neutral-600">
                                Items {totalCount > 0 ? startItem : 0}-{endItem} of {totalCount}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-neutral-600">Sort By:</span>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="position">Position</SelectItem>
                                        <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                                        <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                                        <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                                        <SelectItem value="price_desc">Price (High to Low)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-3 gap-1">
                            {sortedResults.map((item: CatalogProduct) => (
                                <CatalogProductCard key={item.sku} product={item} />
                            ))}
                        </div>

                        {/* Pagination and Show per page */}
                        {totalCount > 0 && (
                            <div className="my-2 lg:my-4 bg-white p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                {/* Pagination */}
                                {totalPages > 1 ? (
                                    <CustomPagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        className="lg:justify-start justify-center"
                                    />
                                ) : <div></div>}

                                {/* Show per page - Always show when there are products */}
                                <div className="flex items-center gap-2">
                                    <Select value={limit.toString()} onValueChange={(value) => {
                                        setLimit(Number(value));
                                        const params = new URLSearchParams(searchParams.toString());
                                        if (params.get("p") !== "1") {
                                            params.set("p", "1");
                                            router.replace(`/${locale}/promotions?${params.toString()}`);
                                        }
                                    }}>
                                        <SelectTrigger className="w-[80px] h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30</SelectItem>
                                            <SelectItem value="60">60</SelectItem>
                                            <SelectItem value="90">90</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm text-neutral-700 whitespace-nowrap">per page</span>
                                </div>
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

export default function PromotionsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <PromotionsContent />
        </Suspense>
    );
}
