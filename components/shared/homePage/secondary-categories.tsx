"use client"
import CategoryCard from "./category-card";
import CategorySkeleton from "../product/homeCategorySkeleton";
import { CategoriesWithSubCategories } from "@/types";
import { useAllCategoriesWithSubCategories } from "@/hooks/useAllCategoriesWithSubCategories";
const SecondaryCategories = () => {
    const { data, isLoading, error } = useAllCategoriesWithSubCategories();
    const mainCategories = data?.filter((category) => category.level === 2);

    return (
        <section className="lg:rounded-b-lg  bg-white">
            {isLoading && (
                <div className=" flex flex-nowrap justify-start overflow-x-scroll lg:grid grid-cols-8 gap-2 w-full  h-[300px] lg:h-[400px] p-4">
                    {[...Array(16)].map((_, i) => (
                        <CategorySkeleton key={i} />
                    ))}
                </div>
            )}
            {error && (
                <div className="grid grid-cols-8 gap-2 w-full">
                    <p className="text-red-600 mb-4">Error loading banners</p>
                </div>
            )}
            {!isLoading && !error && data?.length === 0 && (
                <div className="flex flex-nowrap justify-start overflow-x-scroll lg:grid grid-cols-8  gap-2  scrollbar-hide md:overflow-x-hidden">
                    <p className="text-red-600 mb-4">No categories found</p>
                </div>
            )}
            {data && data.length > 0 && (
                <div className="flex flex-nowrap justify-start overflow-x-scroll lg:grid grid-cols-8  gap-2  scrollbar-hide md:overflow-x-hidden w-full">
                    {mainCategories?.map((category) => (
                        <CategoryCard key={category.id} category={category as CategoriesWithSubCategories} />
                    ))}
                </div>
            )}
        </section>
    );
};
export default SecondaryCategories;
