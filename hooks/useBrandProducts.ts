import { CatalogProduct } from "@/types";
import { fetchBrandProducts } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useBrandProducts = (manufacturerId: string | number, page = 1, limit = 30, zone?: string | null) => {
    return useQuery({
        queryKey: ["brandProducts", manufacturerId, page, limit, zone],
        queryFn: () => fetchBrandProducts(manufacturerId, page, limit, zone),
        enabled: !!manufacturerId,
    });
};

export interface BrandProductResponse {
    items: CatalogProduct[];
    total_count?: number;
}

