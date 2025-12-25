"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/pageContainer";
import { searchProductsApi } from "@/lib/search/search.service";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import placeholderImage from "@/public/images/placeholder.jpg";
// import { ProductCard } from "@/components/products/product-card"; // Assuming a shared product card exists or distinct
// If invalid, we'll map a simple view. User said: "later when product attributes will be changed... we can use product card"
// So for now, we should "only show items names as search results"?
// "can we ignore types for now to this and only show items names as search results ? later when product attributes will be changed from backend we can use product card at that time to show it properly."
// This implies a temporary simple list view.

import { CustomPagination } from "@/components/ui/pagination";
import { useZoneStore } from "@/store/useZoneStore";
import { extractZoneNo } from "@/utils/extractZoneNo";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter(); // Import useRouter
    const params = useParams(); // Import useParams
    const locale = (params?.lang as string) || "en";
    const query = searchParams.get("q") || "";
    const pageParam = searchParams.get("p");
    const currentPage = pageParam ? parseInt(pageParam) : 1;
    const limit = 30;

    const [results, setResults] = useState<any[]>([]);
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
                <h1 className="text-2xl font-bold mb-4">Search Results for &quot;{query}&quot;</h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
                    </div>
                ) : results.length > 0 ? (
                    <>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {results.map((item: any) => (
                                <div key={item.sku} className="border rounded-md p-4 hover:shadow-lg transition-shadow bg-white">
                                    {/* Simple View as requested for now */}
                                    <Link href={`/${locale}/product/${item.url_key}`}>
                                        <div className="aspect-square relative mb-2 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                                            {item.image ? (
                                                <Image src={item.image || placeholderImage} alt={item.name} width={200} height={200} className="object-cover " />
                                            ) : (
                                                <span className="text-gray-400 text-xs">No Image</span>
                                            )}
                                        </div>
                                        <h3 className="font-medium text-sm line-clamp-2 mb-1">{item.name}</h3>
                                    </Link>
                                    {item.special_price ? (
                                        <div className="text-primary font-bold">
                                            QAR {item.special_price}
                                            <div className="text-gray-500 line-through">
                                                QAR {item.price}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-primary font-bold">
                                            QAR {item.price}
                                        </div>
                                    )}
                                </div>
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
