"use client";

import { use } from "react";
import { getSafeLegacyCategoryId } from "@/lib/getCategoryIdFromSlug";
import GenericPageLoading from "@/components/shared/genericPageLoading";
import { CatalogProduct } from "@/types";
import CatalogProductCard from "@/components/shared/product/catalogProductCard";
import PageContainer from "@/components/pageContainer";
import Heading from "@/components/heading";
import { Breadcrumbs } from "@/components/breadcurmbsComp";
import { useAllCategoriesWithSubCategories } from "@/hooks/useAllCategoriesWithSubCategories";
import { slugify } from "@/lib/utils";
import { CategoriesWithSubCategories } from "@/types";
import ProductDetailView from "@/components/shared/product/ProductDetailView";
import { useCategoryProducts } from "@/hooks/useCategoryProducts";
import { SubCategoryCarousel } from "@/components/shared/product/sub-category-carousel";
import { SectionItem } from "@/types";

export default function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = use(params);
    // Convert generic slug to string array for easier handling if it isn't already (though Next.js ensures it is for [...slug])
    const slugArray = Array.isArray(slug) ? slug : [slug];
    const currentSlug = slugArray[slugArray.length - 1];

    // 1. Try to get Safe Legacy ID (only from map, no regex)
    const safeLegacyId = getSafeLegacyCategoryId(currentSlug);

    // 2. Load full category tree
    const { data: allCategories, isLoading: isCategoriesLoading } = useAllCategoriesWithSubCategories();

    // 3. Determine if it matches a category in the tree
    // Recursive Finder that returns the chain of categories matching the last slug
    const findCategoryChain = (
        categories: CategoriesWithSubCategories[],
        targetSlug: string
    ): CategoriesWithSubCategories[] | undefined => {
        for (const cat of categories) {
            // Use property slug if available (populated by hook), otherwise fallback to legacy check
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
    }

    let isCategory = false;
    let categoryData: CategoriesWithSubCategories | undefined;
    let computedCategoryId: number | undefined = safeLegacyId;
    const breadcrumbs = [{ label: "Home", href: "/" }];

    // Logic:
    // A. If we have categories loaded, check the tree.
    if (allCategories) {
        const chain = findCategoryChain(allCategories, currentSlug);
        if (chain) {
            isCategory = true;
            categoryData = chain[chain.length - 1];
            computedCategoryId = Number(categoryData.id);

            // Build Breadcrumbs from validity chain
            let currentPath = "";
            chain.forEach((cat) => {
                const s = slugify(cat.title);
                currentPath += `/${s}`;
                breadcrumbs.push({ label: cat.title, href: currentPath });
            });
        }
    }

    // B. Critical Fix: If categories are NOT loaded yet, we must decide what to show.
    // If we have a safeLegacyId, we can confidently show the Category Skeleton (by returning CategoryView which handles loading).
    // If we DON'T have a safeLegacyId, and categories are loading, we don't know if it's a new category or a product yet.
    // Showing Product Skeleton here is what caused the bug.
    // So we show a Generic Loading state.
    if (!allCategories && isCategoriesLoading && !safeLegacyId) {
        return <GenericPageLoading />;
    }

    // C. Final Decision to render Category View
    // It is a category if:
    // 1. It matched the tree (isCategory = true)
    // 2. OR we have a safe legacy ID (and thus assume it's a category even if tree isn't matched/loaded yet)
    const isValidCategory = isCategory || !!safeLegacyId;

    if (isValidCategory && computedCategoryId) {
        return (
            <CategoryView
                categoryId={computedCategoryId}
                breadcrumbs={breadcrumbs}
                displayTitle={currentSlug.replace(/-?\d+$/, "").replace(/-/g, " ")}
                currentPath={breadcrumbs[breadcrumbs.length - 1]?.href || "/"}
                subCategories={categoryData?.section}
            />
        );
    }

    // Otherwise, assume Product View
    const productBreadcrumbs = [{ label: "Home", href: "/" }];

    // Always generate breadcrumbs from segments, enriching with titles if available
    if (slugArray.length > 1) {
        let currentPath = "";
        let currentLevelCategories = allCategories || [];

        // Iterate all segments except the last one (product)
        for (let i = 0; i < slugArray.length - 1; i++) {
            const segment = slugArray[i];
            currentPath += `/${segment}`;

            // Find category matches segment if we have data
            let matchedCategory: CategoriesWithSubCategories | undefined;
            if (currentLevelCategories.length > 0) {
                matchedCategory = currentLevelCategories.find(c => slugify(c.title) === segment);
            }

            if (matchedCategory) {
                productBreadcrumbs.push({ label: matchedCategory.title, href: currentPath });
                // Prepare for next iteration
                currentLevelCategories = matchedCategory.section || [];
            } else {
                // Fallback: Use segment as label
                const segmentLabel = segment.replace(/-/g, " ");
                productBreadcrumbs.push({ label: segmentLabel, href: currentPath });
                // If we lose the chain, we can't look up deeper levels properly, but we continue generating links
                currentLevelCategories = [];
            }
        }
    }

    return (
        <ProductDetailView productSlug={currentSlug} breadcrumbs={productBreadcrumbs} />
    );
}


import { CustomPagination } from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductCardSkeleton from "@/components/shared/product/productCardSkeleton";
import { ItemsPerPage } from "@/components/shared/product/items-per-page";
import { Button } from "@/components/ui/button";

function CategoryView({ categoryId, breadcrumbs, displayTitle, currentPath, subCategories }: { categoryId: number, breadcrumbs: any[], displayTitle: string, currentPath: string, subCategories?: SectionItem[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Get page from URL or default to 1
    const pageParam = searchParams.get("p");
    const initialPage = pageParam ? parseInt(pageParam) : 1;

    // We can just use the URL param as the source of truth, but keeping local state for immediate feedback is also fine.
    // However, to keep it perfectly synced, let's rely on the URL param + a local sync.
    const [page, setPage] = useState(initialPage);

    // Sync state if URL changes (e.g. back button)
    useEffect(() => {
        const p = searchParams.get("p");
        if (p) {
            setPage(parseInt(p));
        } else {
            setPage(1);
        }
    }, [searchParams]);

    const [limit, setLimit] = useState(30);
    const { data, isLoading: isProductsLoading, error, refetch } = useCategoryProducts(categoryId, page, limit);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });

        const params = new URLSearchParams(searchParams.toString());
        params.set("p", newPage.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
        const params = new URLSearchParams(searchParams.toString());
        params.set("p", "1");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    if (isProductsLoading) return (
        <PageContainer>
            <Breadcrumbs items={breadcrumbs.length > 1 ? breadcrumbs : [
                { label: "Home", href: "/" },
                { label: displayTitle },
            ]} />
            <Heading level={1} className="text-2xl font-bold lg:mb-4 mb-2 capitalize" title={displayTitle}>{displayTitle}</Heading>
            <div className="flex justify-between items-center mb-4">
                <div>{/* Placeholder for left side content if any */}</div>
                <ItemsPerPage currentLimit={limit} onLimitChange={handleLimitChange} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-4">
                {[...Array(limit)].map((_, index) => (
                    <ProductCardSkeleton key={index} />
                ))}
            </div>
        </PageContainer>
    );

    const totalCount = data?.total_count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <PageContainer>
            <Breadcrumbs items={breadcrumbs.length > 1 ? breadcrumbs : [
                { label: "Home", href: "/" },
                { label: displayTitle },
            ]} />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center lg:mb-4 mb-2 lg:gap-4 gap-2">
                <Heading level={1} className="text-2xl font-bold capitalize" title={displayTitle}>{displayTitle}</Heading>
                <ItemsPerPage currentLimit={limit} onLimitChange={handleLimitChange} />
            </div>

            {subCategories && subCategories.length > 0 && (
                <SubCategoryCarousel subCategories={subCategories} />
            )}


            {!data && error ? (
                <div className="py-8 text-center text-red-500">Failed to load products {" "}
                    {error?.message ? error?.message : ""}
                    <br />
                    <div className="flex gap-2 w-full justify-center">
                        <Button onClick={() => router.back()} className="bg-transparent bg-none text-blue-500 hover:text-blue-600 ">Back</Button>
                        <Button onClick={() => refetch()} className="bg-primary text-white">Retry</Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2  gap-1 lg:gap-3 lg:pb-4 pb-2">
                        {data?.items?.map((product: CatalogProduct) => (
                            <CatalogProductCard key={product.id} product={product} categoryPath={currentPath} />
                        ))}
                    </div>
                    {data?.items?.length > 0 && (
                        <div className="lg:py-8 py-4">
                            <CustomPagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </PageContainer>
    );
}

