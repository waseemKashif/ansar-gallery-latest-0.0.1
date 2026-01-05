"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/pageContainer";
import { searchProductsApi } from "@/lib/search/search.service";
import { Loader2 } from "lucide-react";
import { CustomPagination } from "@/components/ui/pagination";
import { useZoneStore } from "@/store/useZoneStore";
import { extractZoneNo } from "@/utils/extractZoneNo";
import { CatalogProduct } from "@/types";
import CatalogProductCard from "@/components/shared/product/catalogProductCard";
export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter(); // Import useRouter
    const params = useParams(); // Import useParams
    const locale = (params?.lang as string) || "en";
    const query = searchParams.get("q") || "";
    const pageParam = searchParams.get("p");
    const currentPage = pageParam ? parseInt(pageParam) : 1;
    const limit = 30;

    const [results, setResults] = useState<CatalogProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const { zone } = useZoneStore()

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const data = await searchProductsApi(query, locale, currentPage, limit, parseInt(extractZoneNo(zone || '56')));
                setResults(data.items || []);
                setTotalCount(data.total_count || 0);
                console.log(data, "the search results")
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchResults();
        } else {
            setResults([]);
            setLoading(false);
        }
    }, [query, locale, currentPage, zone]);

    const totalPages = Math.ceil(totalCount / limit);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("p", newPage.toString());
        router.push(`/${locale}/search?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <PageContainer>
            <div className="py-8">
                <h1 className="text-2xl font-bold mb-3">Search Results for &quot;{query}&quot;</h1>
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
                        <div className="py-8 mt-4">
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">No results found for &quot;{query}&quot;</p>
                    </div>
                )}
            </div>
        </PageContainer >
    );
}
