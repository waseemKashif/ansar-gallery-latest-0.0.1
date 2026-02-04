"use client";
import { getSafeLegacyCategoryId } from "@/lib/getCategoryIdFromSlug";
import GenericPageLoading from "@/components/shared/genericPageLoading";
import { CatalogProduct } from "@/types";
import CatalogProductCard from "@/components/shared/product/catalogProductCard";
import PageContainer from "@/components/pageContainer";
import Heading from "@/components/heading";
import { Breadcrumbs, Crumb } from "@/components/breadcurmbsComp";
import { useAllCategoriesWithSubCategories } from "@/hooks/useAllCategoriesWithSubCategories";
import { slugify } from "@/lib/utils";
import { CategoriesWithSubCategories } from "@/types";
import ProductDetailView from "@/components/shared/product/ProductDetailView";
import { useCategoryProducts } from "@/hooks/useCategoryProducts";
import { SubCategoryCarousel } from "@/components/shared/product/sub-category-carousel";
import { SectionItem } from "@/types";
import { CustomPagination } from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductCardSkeleton from "@/components/shared/product/productCardSkeleton";
import { ItemsPerPage } from "@/components/shared/product/items-per-page";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import CatalogFilters from "@/components/shared/product/CatalogFilters";
import { parseUrlParamsToFilters, filtersToUrlSearchString } from "@/lib/filterUtils";
import { useUIStore } from "@/store/useUIStore";
import { useDictionary } from "@/hooks/useDictionary";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useMemo } from "react";
interface CatchAllPageClientProps {
    slug: string[];
    initialData?: {
        isCategory: boolean;
        categoryData?: CategoriesWithSubCategories;
        categoryId?: number;
        productSlug?: string;
        allCategories?: CategoriesWithSubCategories[];
        initialProductList?: { items: CatalogProduct[]; total_count: number } | null;
    }
}
// ... (imports remain)
// ... (imports remain)

export default function CatchAllPageClient({ slug, initialData }: CatchAllPageClientProps) {
    // const { slug } = use(params); // Passed as prop now
    // Convert generic slug to string array for easier handling if it isn't already (though Next.js ensures it is for [...slug])
    const slugArray = Array.isArray(slug) ? slug : [slug];
    const currentSlug = slugArray[slugArray.length - 1];

    // 1. Try to get Safe Legacy ID (only from map, no regex)
    const safeLegacyId = getSafeLegacyCategoryId(currentSlug);

    // 2. Load full category tree (Client fallbacks)
    // If we have initialData with allCategories, we might not strictly need to fetch, 
    // but React Query / Hooks usually want to revalidate or manage state. 
    // For now, we continue to rely on the hook for updates, but we can use initialData as "loading" state bypass or initial data seeding if the hook supported it.
    // However, since `useAllCategoriesWithSubCategories` might fetch on its own, we use it.
    // Optimization: If `initialData.allCategories` is passed, we can SKIP the waiting check.

    const { data: allCategories, isLoading: isCategoriesLoading } = useAllCategoriesWithSubCategories();

    const { dict } = useDictionary();

    // Check if we already know what this page is from Server Data
    if (initialData) {
        if (initialData.isCategory && initialData.categoryId) {
            // Reconstruct breadcrumbs for Server Detected Category
            const breadcrumbs = [{ label: dict?.common.home || "Home", href: "/" }];

            // Basic breadcrumb reconstruction from slug
            let currentPath = "";
            slugArray.forEach((seg) => {
                currentPath += `/${seg}`;
                breadcrumbs.push({ label: seg.replace(/-/g, " "), href: currentPath });
            });

            // If we have categoryData with title, update the last breadcrumb or the title display
            const displayTitle = initialData.categoryData?.title || currentSlug.replace(/-?\d+$/, "").replace(/-/g, " ");

            return (
                <CategoryView
                    categoryId={initialData.categoryId}
                    breadcrumbs={breadcrumbs}
                    displayTitle={displayTitle}
                    currentPath={breadcrumbs[breadcrumbs.length - 1]?.href || "/"}
                    subCategories={initialData.categoryData?.section}
                    initialProductList={initialData.initialProductList}
                />
            );
        }
    }

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
    const breadcrumbs = [{ label: dict?.common.home || "Home", href: "/" }];

    // Logic:
    // A. Use allCategories if available (hook or passed initial?)
    const categoriesToUse = allCategories || initialData?.allCategories;

    if (categoriesToUse) {
        const chain = findCategoryChain(categoriesToUse, currentSlug);
        if (chain) {
            isCategory = true;
            categoryData = chain[chain.length - 1];
            computedCategoryId = Number(categoryData.id);

            // Build Breadcrumbs from validity chain
            let currentPath = "";
            chain.forEach((cat) => {
                const s = cat.slug || slugify(cat.title);
                currentPath += `/${s}`;
                breadcrumbs.push({ label: cat.title, href: currentPath });
            });
        }
    }

    // B. Critical Fix: If categories are NOT loaded yet, we must decide what to show.
    // If we have initialData (even if not category), passing down implies we might be in product mode or have enough info.
    // If we DON'T have a safeLegacyId, and categories are loading, we don't know if it's a new category or a product yet.
    if (!categoriesToUse && isCategoriesLoading && !safeLegacyId && !initialData) {
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
                initialProductList={initialData?.initialProductList}
            />
        );
    }

    // Otherwise, assume Product View
    const productBreadcrumbs = [{ label: dict?.common.home || "Home", href: "/" }];

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
                matchedCategory = currentLevelCategories.find(c => (c.slug === segment) || (slugify(c.title) === segment));
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


function CategoryView({ categoryId, breadcrumbs, displayTitle, currentPath, subCategories, initialProductList }: {
    categoryId: number,
    breadcrumbs: Crumb[],
    displayTitle: string,
    currentPath: string,
    subCategories?: SectionItem[],
    initialProductList?: { items: CatalogProduct[]; total_count: number } | null
}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const setHeaderFilterButtonVisible = useUIStore((state) => state.setHeaderFilterButtonVisible);
    const { dict } = useDictionary();
    useEffect(() => {
        setHeaderFilterButtonVisible(true);
        return () => setHeaderFilterButtonVisible(false);
    }, [setHeaderFilterButtonVisible]);

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

    // Parse filters from URL
    const filters = parseUrlParamsToFilters(searchParams);

    const [limit, setLimit] = useState(30);
    const { data, isLoading: isProductsLoading, error, refetch } = useCategoryProducts(
        categoryId,
        page,
        limit,
        "catalog_list",
        filters,
        (page === 1 && limit === 30 && Object.keys(filters).length === 0) ? initialProductList : undefined
    );

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

    const handleFilterChange = (newFilters: Record<string, (string | number)[]>) => {
        const queryString = filtersToUrlSearchString(newFilters, searchParams);
        router.push(`${pathname}?${queryString}`, { scroll: false });
    };

    const [sortBy, setSortBy] = useState<string>("position");

    // Sort products
    const sortedItems = useMemo(() => {
        if (!data?.items) return [];

        const sorted = [...data.items];
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
    }, [data?.items, sortBy]);

    const totalCount = data?.total_count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    console.log("catalogue data", data);
    return (
        <PageContainer>
            <Breadcrumbs items={breadcrumbs.length > 1 ? breadcrumbs : [
                { label: dict?.common.home || "Home", href: "/" },
                { label: displayTitle },
            ]} />
            <Heading level={1} className="text-2xl font-bold capitalize sr-only" title={displayTitle}>{displayTitle}</Heading>
            {subCategories && subCategories.length > 0 && (
                <SubCategoryCarousel subCategories={subCategories} parentPath={currentPath} />
            )}

            <div className="flex flex-col lg:flex-row gap-2">
                <div className="w-full lg:w-2/8 bg-white rounded-lg h-fit">
                    <h3 className="text-lg font-bold text-white bg-primary p-2 lg:block hidden rounded-t-lg">{dict?.common.shopBy}</h3>
                    <CatalogFilters
                        categoryId={categoryId}
                        categoryName={displayTitle} // Pass displayTitle so we can identify the category filter
                        onFilterChange={handleFilterChange}
                    />
                </div>
                <div className="w-full">
                    {isProductsLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-4">
                            {[...Array(limit)].map((_, index) => (
                                <ProductCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : !data && error ? (
                        <div className="py-8 text-center text-red-500">Failed to load products {" "}
                            {error?.message ? error?.message : ""}
                            <br />
                            <div className="flex gap-2 w-full justify-center">
                                <Button onClick={() => router.back()} className="bg-transparent bg-none text-blue-500 hover:text-blue-600 ">Back</Button>
                                <Button onClick={() => refetch()} className="bg-primary text-white">Retry</Button>
                            </div>
                        </div>
                    ) : data?.items?.length === 0 ? (
                        <div className="py-16 text-center text-neutral-500 flex flex-col items-center justify-center">
                            <Image
                                src="/images/no-results.png"
                                alt="No items found"
                                width={200}
                                height={200}
                                className="mb-4"
                            />
                            <p className="text-lg font-medium">No items found</p>
                            <div className="mt-4">
                                {/* Allow resetting filters even if no results */}
                                <Button variant="outline" onClick={() => router.push(pathname)}>Clear Filters</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* items count and product sorting */}
                            <div className="bg-white p-2 mb-2 flex flex-wrap justify-between items-center gap-4 rounded-t-lg">
                                <div className="text-sm text-neutral-600 ">
                                    {dict?.common?.items || "Items"} {(data?.total_count || 0) > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, data?.total_count || 0)} {dict?.common?.of || "of"} {data?.total_count || 0}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-neutral-600">{dict?.common?.sortBy || "Sort By"}:</span>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={dict?.common?.sortBy || "Sort by"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="position">{dict?.common?.position || "Position"}</SelectItem>
                                            <SelectItem value="name_asc">{dict?.common?.nameAZ || "Name (A-Z)"}</SelectItem>
                                            <SelectItem value="name_desc">{dict?.common?.nameZA || "Name (Z-A)"}</SelectItem>
                                            <SelectItem value="price_asc">{dict?.common?.priceLowHigh || "Price (Low to High)"}</SelectItem>
                                            <SelectItem value="price_desc">{dict?.common?.priceHighLow || "Price (High to Low)"}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2  gap-1 lg:gap-2 lg:pb-4 pb-2">
                                {sortedItems.map((product: CatalogProduct) => (
                                    <CatalogProductCard key={product.id} product={product} categoryPath={currentPath} />
                                ))}
                            </div>

                            {data?.items?.length > 0 && (
                                <div className="lg:py-3 p-2 px-2 flex flex-col lg:flex-row lg:justify-between justify-center lg:items-start items-center bg-white mb-4">
                                    <CustomPagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        className="lg:justify-start justify-center"
                                    />
                                    <ItemsPerPage currentLimit={limit} onLimitChange={handleLimitChange} className=" flex items-center gap-2 shrink-0" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}


