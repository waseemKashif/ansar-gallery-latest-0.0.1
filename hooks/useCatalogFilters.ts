
import { useQuery } from "@tanstack/react-query";
import { fetchCatalogFilters } from "@/lib/api";
import { useLocale } from "@/hooks/useLocale";
import { CatalogFilter } from "@/types";

export const useCatalogFilters = (categoryId: number) => {
    const { locale } = useLocale();
    return useQuery<CatalogFilter[]>({
        queryKey: ["catalogFilters", categoryId, locale],
        queryFn: () => fetchCatalogFilters(categoryId, locale),
        enabled: !!categoryId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
