import { useQuery } from "@tanstack/react-query";
import { fetchAllCategoriesWithSubCategories } from "@/lib/api";
import { useZoneStore } from "@/store/useZoneStore";

export const useAllCategoriesWithSubCategories = () => {
    const { zone } = useZoneStore();
    return useQuery({
        queryKey: ["allCategoriesWithSubCategories", zone],
        queryFn: () => fetchAllCategoriesWithSubCategories(zone),
    });
};