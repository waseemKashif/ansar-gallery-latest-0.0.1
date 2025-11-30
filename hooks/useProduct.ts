import { useQuery } from "@tanstack/react-query";
import { CatalogProduct } from "@/types";

const fetchProduct = async (sku: string): Promise<CatalogProduct> => {
    const res = await fetch(`/api/product/${sku}`);
    if (!res.ok) {
        throw new Error("Failed to fetch product");
    }
    return res.json();
};

export const useProduct = (sku: string | undefined) => {
    return useQuery({
        queryKey: ["product", sku],
        queryFn: () => fetchProduct(sku!),
        enabled: !!sku,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
