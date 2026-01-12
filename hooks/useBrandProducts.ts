import { CatalogProduct } from "@/types";
import { fetchBrandProducts } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { useDictionary } from "./useDictionary";

export const useBrandProducts = (manufacturerId: string | number, page = 1, limit = 30, zone?: string | null) => {
    const { locale } = useDictionary();
    return useQuery({
        queryKey: ["brandProducts", manufacturerId, page, limit, zone, locale],
        queryFn: () => fetchBrandProducts(manufacturerId, page, limit, zone, locale),
        enabled: !!manufacturerId,
    });
};

export interface BrandProductResponse {
    items: CatalogProduct[];
    total_count?: number;
}

