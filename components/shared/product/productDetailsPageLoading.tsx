
import PageContainer from "@/components/pageContainer";
import ProductCardSkeleton from "./productCardSkeleton";
const Skeleton = ({ className }: { className?: string }) => (
    <div
        className={`animate-pulse rounded-md bg-gray-200 ${className}`}
    />
);
const ProductDetailsPageLoading = () => {
    return (
        <PageContainer>
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT: Image Gallery */}
                    <div className="flex gap-4">
                        {/* Thumbnails */}
                        <div className="hidden sm:flex flex-col gap-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-16 rounded-lg" />
                            ))}
                        </div>

                        {/* Main Image */}
                        <Skeleton className="w-full aspect-square rounded-xl" />
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="space-y-5">
                        {/* Title */}
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-3/4" />
                        </div>

                        {/* Price Section */}
                        <div className="flex items-end gap-3">
                            <Skeleton className="h-7 w-24" />
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-24" />
                        </div>

                        {/* SKU + Rating */}
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-4 w-28" />
                        </div>

                        {/* Stock Badge */}
                        <Skeleton className="h-6 w-24 rounded-full" />

                        {/* Add to Cart */}
                        <Skeleton className="h-12 w-full rounded-lg" />

                        {/* Delivery / Payment / Returns */}
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex gap-3 items-center">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            ))}
                        </div>

                        {/* Specifications */}
                        <div className="pt-4 space-y-3">
                            <Skeleton className="h-5 w-40" />
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-4 w-full" />
                            ))}
                            <Skeleton className="h-4 w-32 mt-2" />
                        </div>
                    </div>
                </div>
            </div>
            {/* related products skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 my-8 lg:my-12">
                {[...Array(6)].map((_, index) => (
                    <ProductCardSkeleton key={index} />
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 my-8 lg:my-12">
                {[...Array(6)].map((_, index) => (
                    <ProductCardSkeleton key={index} />
                ))}
            </div>
        </PageContainer>
    );
};

export default ProductDetailsPageLoading;