"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageContainer from "@/components/pageContainer";
import { CatalogProduct } from "@/types";
import CatalogProductCard from "@/components/shared/product/catalogProductCard";
import { CustomPagination } from "@/components/ui/pagination";
import { useLocale } from "@/hooks/useLocale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCardSkeleton from "@/components/shared/product/productCardSkeleton";

interface PromotionsViewProps {
    products: CatalogProduct[];
    totalCount: number;
    bannerTitle: string | null;
    page: number;
    limit: number;
}

export default function PromotionsView({
    products,
    totalCount,
    bannerTitle,
    page: initialPage,
    limit: initialLimit
}: PromotionsViewProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { locale } = useLocale();

    // Use URL params or props for current state
    const currentPage = initialPage;
    const currentLimit = initialLimit;

    const [sortBy, setSortBy] = useState<string>("position");
    // Loading state for client-side transitions (optional, but good for UX)
    const [isNavigating, setIsNavigating] = useState(false);

    // Reset navigating state when products change (navigation complete)
    useEffect(() => {
        setIsNavigating(false);
    }, [products]);

    const startItem = (currentPage - 1) * currentLimit + 1;
    const endItem = Math.min(currentPage * currentLimit, totalCount);

    // Client-side sorting of the *displayed* (fetched) page
    const sortedResults = useMemo(() => {
        if (!products.length) return [];

        const sorted = [...products];
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
    }, [products, sortBy]);

    const totalPages = Math.ceil(totalCount / currentLimit);

    const updateUrl = (newPage: number, newLimit: number) => {
        setIsNavigating(true);
        const params = new URLSearchParams(searchParams.toString());
        params.set("p", newPage.toString());
        params.set("limit", newLimit.toString());

        router.push(`/${locale}/promotions?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePageChange = (newPage: number) => {
        updateUrl(newPage, currentLimit);
    };

    const handleLimitChange = (value: string) => {
        const newLimit = Number(value);
        updateUrl(1, newLimit); // Reset to page 1 when limit changes
    };

    const idParam = searchParams.get("id");
    const displayTitle = bannerTitle || (idParam?.includes("product_tags") ? "Promotions" : (!idParam ? "Promotions" : "New Arrivals"));

    return (
        <PageContainer>
            <div className="pb-8">
                <h1 className="text-2xl font-bold mb-3">{displayTitle}</h1>

                {isNavigating && (
                    <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center">
                        {/* Overlay loader if desired, or just fallback to opacity */}
                    </div>
                )}

                {/* Loading skeleton or opacity transition during nav could be handled here */}
                {isNavigating && products.length === 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-1 lg:gap-4">
                        {[...Array(currentLimit)].map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                    </div>
                ) : products.length > 0 ? (
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

                        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-3 gap-1 ${isNavigating ? 'opacity-50' : ''}`}>
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
                                    <Select value={currentLimit.toString()} onValueChange={handleLimitChange}>
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
