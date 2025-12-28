import { useCategoryStore } from "@/store/useCategoryStore";

export const useAllCategoriesWithSubCategories = () => {
    const categories = useCategoryStore((state) => state.categories);
    const isLoading = useCategoryStore((state) => state.isLoading);
    const error = useCategoryStore((state) => state.error);

    return {
        data: categories,
        isLoading,
        error,
        // Refetch can be exposed if needed, but the provider handles it automatically
    };
};
