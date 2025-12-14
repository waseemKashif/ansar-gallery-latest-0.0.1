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
import { useInfiniteCategoryProducts, CategoryProductResponse } from "@/hooks/useCategoryProducts";
import ProductCardSkeleton from "../../product/productCardSkeleton";
import { ArrowDown, Loader2 } from "lucide-react";
import Heading from "@/components/heading";
const TailrotedcategorySlider = () => {
    const [activeCategory, setActiveCategory] = useState(0);
    const [categoryId, setCategoryId] = useState(4);
    const limit = 20;
    const { data: categories, isLoading, error, refetch } = useQuery({
        queryKey: ["categories"],
        queryFn: () => fetchHomepageCategories(),
    })
    const {
        data,
        isLoading: isProductsLoading,
        error: productsError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteCategoryProducts(categoryId, limit);
    const isActiveCategory = (index: number) => activeCategory === index;
    const fetchCategoryData = (index: number, categoryId: number) => {
        setActiveCategory(index);
        setCategoryId(categoryId);
    }
    const refetchProducts = () => {
        refetch();
    }
    const LoadMoreProducts = () => {
        fetchNextPage();
    }
    return (
        <div className="w-full">
            <Heading title="Discover a Curated Selection Just for You" level={2} className="">Discover a Curated Selection Just for You</Heading>
            {isLoading && (
                <div className=" flex flex-nowrap gap-2 w-full overflow-hidden px-2 my-2">
                    {/* shinner instead of spinner*/}
                    {[...Array(10)].map((_, index) => (
                        <div key={index} className="flex items-center justify-center w-[200px] h-[36px] bg-gray-200 rounded-full animate-pulse">

                        </div>
                    ))}
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
            {!isLoading && !error && categories && (
                <Carousel className="w-full border-b border-gray-200 p-2">
                    <CarouselContent>

                        <CarouselItem key={0} className="text-center bg-white text-black w-fit max-w-fit">
                            <Button title={"New Arrivals"} className={`${isActiveCategory(13) ? "bg-black text-white" : "bg-white text-black"} rounded-full hover:bg-black hover:text-white transition-all`} onClick={() => fetchCategoryData(13, 0)}>{"New Arrivals"}</Button>
                        </CarouselItem>
                        {categories && categories?.map((category: CategoryData, index: number) => (
                            <CarouselItem key={index} className="text-center bg-white text-black w-fit max-w-fit">
                                <Button title={category.name} className={`${isActiveCategory(index) ? "bg-black text-white" : "bg-white text-black"} rounded-full hover:bg-black hover:text-white transition-all`} onClick={() => fetchCategoryData(index, category.category_id)}>{category.name}</Button>
                            </CarouselItem>
                        ))
                        }
                    </CarouselContent>
                </Carousel>
            )}
            {isProductsLoading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-4 my-4">
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
            {!isProductsLoading && !productsError && (!data?.pages || data.pages[0]?.items?.length === 0) && (
                <div className="flex flex-nowrap justify-start overflow-x-scroll lg:grid grid-cols-8  gap-2  scrollbar-hide md:overflow-x-hidden">
                    <p className="text-red-600 mb-4">No products found</p>
                </div>
            )}
            <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2  lg:gap-4 md:gap-2 gap-1 my-2 lg:px-2">
                {data?.pages?.flatMap((page: CategoryProductResponse) => page.items || []).map((product: CatalogProduct) => (
                    <CatalogProductCard key={product.sku} product={product} />
                ))}
            </div>
            {hasNextPage && (
                <div className="flex justify-center flex-col items-center gap-2">
                    <Button
                        className="mx-auto rounded-full"
                        onClick={() => LoadMoreProducts()}
                        disabled={isFetchingNextPage}
                    >
                        <ArrowDown className="w-4 h-4" />
                        {isFetchingNextPage ? "Loading..." : "Load More"}
                    </Button>
                </div>
            )}
        </div>
    )
}
export default TailrotedcategorySlider