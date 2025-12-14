import { useQuery } from "@tanstack/react-query";
import { fetchAllCategoriesWithSubCategories } from "@/lib/api";

export const useAllCategoriesWithSubCategories = () => {
    return useQuery({
        queryKey: ["allCategoriesWithSubCategories"],
        queryFn: () => fetchAllCategoriesWithSubCategories(),
    });
};