"use client"
import CategoryCard from "./category-card";
import { CategoryData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { fetchHomepageCategories } from "@/lib/api";
import CategorySkeleton from "../product/homeCategorySkeleton";
import { useLocale } from "@/hooks/useLocale";
const SecondaryCategories = () => {
    const { locale } = useLocale();
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["fetch-homepage-categories"],
        queryFn: () => fetchHomepageCategories(locale),
        retry: 1,
    });


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
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            )}
            {!isLoading && !error && data?.length === 0 && (
                <div className="flex flex-nowrap justify-start overflow-x-scroll lg:grid grid-cols-8  gap-2  scrollbar-hide md:overflow-x-hidden">
                    <p className="text-red-600 mb-4">No categories found</p>
                </div>
            )}
            {data && data.length > 0 && (
                <div className="flex flex-nowrap justify-start overflow-x-scroll lg:grid grid-cols-8  gap-2  scrollbar-hide md:overflow-x-hidden w-full">
                    {data?.map((category) => (
                        <CategoryCard key={category.category_id} category={category as CategoryData} />
                    ))}
                </div>
            )}
        </section>
    );
};
export default SecondaryCategories;
