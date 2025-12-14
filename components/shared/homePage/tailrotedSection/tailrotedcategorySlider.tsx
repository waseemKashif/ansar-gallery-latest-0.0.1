"use client"
import { CatalogProduct, CategoryData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { fetchHomepageCategories } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { useState } from "react";
import CatalogProductCard from "../../product/catalogProductCard";
import { useCategoryProducts } from "@/hooks/useCategoryProducts";
import ProductCardSkeleton from "../../product/productCardSkeleton";
const TailrotedcategorySlider = () => {
    const [activeCategory, setActiveCategory] = useState(0);
    const [categoryId, setCategoryId] = useState(4);
    const { data: categories, isLoading, error, refetch } = useQuery({
        queryKey: ["categories"],
        queryFn: () => fetchHomepageCategories(),
    })
    const { data, isLoading: isProductsLoading, error: productsError } = useCategoryProducts(categoryId);
    const isActiveCategory = (index: number) => activeCategory === index;
    const fetchCategoryData = (index: number, categoryId: number) => {
        setActiveCategory(index);
        setCategoryId(categoryId);
    }
    const refetchProducts = () => {
        refetch();
    }
    const LoadMoreProducts = () => {
        refetch();
    }
    return (
        <div className="w-full">
            {isLoading && (
                <div className=" flex flex-nowrap justify-start overflow-x-scroll lg:grid grid-cols-8 gap-2 w-full p-4 h-[300px]">
                </div>
            )}
            {error && (
                <div className="grid grid-cols-8 gap-2 w-full">
                    <button
                        onClick={refetchProducts}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            )}
            {!isLoading && !error && categories?.length === 0 && (
                <div className="flex flex-nowrap justify-start overflow-x-scroll lg:grid grid-cols-8  gap-2  scrollbar-hide md:overflow-x-hidden">
                    <p className="text-red-600 mb-4">No categories found</p>
                </div>
            )}
            <Carousel className="w-full">
                <CarouselContent>
                    {
                        categories && categories?.map((category: CategoryData, index: number) => (
                            <CarouselItem key={index} className="text-center bg-white text-black w-fit max-w-fit">
                                <Button title={category.name} className={`${isActiveCategory(index) ? "bg-black text-white" : "bg-white text-black"} rounded-full hover:bg-black hover:text-white transition-all`} onClick={() => fetchCategoryData(index, category.category_id)}>{category.name}</Button>
                            </CarouselItem>
                        ))
                    }
                </CarouselContent>
            </Carousel>

            {isProductsLoading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-4 my-8 lg:my-12">
                    {[...Array(10)].map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))}
                </div>
            )}
            {productsError && (
                <div className="grid grid-cols-8 gap-2 w-full">
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            )}
            {!isProductsLoading && !productsError && data?.items?.length === 0 && (
                <div className="flex flex-nowrap justify-start overflow-x-scroll lg:grid grid-cols-8  gap-2  scrollbar-hide md:overflow-x-hidden">
                    <p className="text-red-600 mb-4">No products found</p>
                </div>
            )}
            <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2  lg:gap-4 md:gap-2 gap-1 lg:my-4 my-2">
                {data?.items?.map((product: CatalogProduct) => (
                    <CatalogProductCard key={product.id} product={product} />
                ))}
            </div>
            <div className="flex justify-center">
                <Button className="mx-auto" onClick={() => LoadMoreProducts()}>Load More</Button>
            </div>
        </div>
    )
}
export default TailrotedcategorySlider