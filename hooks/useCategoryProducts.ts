import { CatalogProduct } from "@/types";
import { fetchCategoryProducts } from "@/lib/api";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useLocale } from "@/hooks/useLocale";

export const useCategoryProducts = (categoryId: number, page = 1, limit = 30) => {
    const { locale } = useLocale();
    return useQuery({
        queryKey: ["categoryProducts", categoryId, page, limit],
        queryFn: () => fetchCategoryProducts(categoryId, page, limit, locale),
        enabled: !!categoryId, // only fetch when a category is selected
    });
};

export interface CategoryProductResponse {
    items: CatalogProduct[];
    total_count?: number;
}

export const useInfiniteCategoryProducts = (categoryId: number, limit = 30) => {
    const { locale } = useLocale();
    return useInfiniteQuery({
        queryKey: ["categoryProductsInfinite", categoryId],
        queryFn: ({ pageParam = 1 }) => fetchCategoryProducts(categoryId, pageParam as number, limit, locale),
        initialPageParam: 1,
        getNextPageParam: (lastPage: CategoryProductResponse, allPages: CategoryProductResponse[]) => {
            // If we have total_count, use it to be precise
            if (lastPage?.total_count !== undefined) {
                const loadedProducts = allPages.reduce((acc, page) => acc + (page.items?.length || 0), 0);
                return loadedProducts < lastPage.total_count ? allPages.length + 1 : undefined;
            }
            // Fallback: if existing items match limit, assume there might be more
            return lastPage?.items?.length >= limit ? allPages.length + 1 : undefined;
        },
        enabled: !!categoryId,
    });
};
