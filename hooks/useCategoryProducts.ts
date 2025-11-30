import { fetchCategoryProducts } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useCategoryProducts = (categoryId: number, page = 1, limit = 30) => {
    return useQuery({
        queryKey: ["categoryProducts", categoryId, page],
        queryFn: () => fetchCategoryProducts(categoryId, page, limit),
        enabled: !!categoryId, // only fetch when a category is selected
    });
};
