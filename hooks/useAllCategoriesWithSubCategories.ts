import { useQuery } from "@tanstack/react-query";
import { fetchAllCategoriesWithSubCategories } from "@/lib/api";
import { useZoneStore } from "@/store/useZoneStore";
import { useLocale } from "@/hooks/useLocale";

export const useAllCategoriesWithSubCategories = () => {
    const { zone } = useZoneStore();
    const { locale } = useLocale();

    return useQuery({
        queryKey: ["allCategoriesWithSubCategories", zone, locale],
        queryFn: () => fetchAllCategoriesWithSubCategories(zone, locale),
    });
};