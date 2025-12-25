
import { useQuery } from "@tanstack/react-query";
// import { useProductStore } from "@/store/useProductStore"; // Removed as per request
import {
    fetchProductDetailsApi,
} from "@/lib/api";
import ProductImageLTS from "@/components/shared/product/product-image-lts";
import placeholderImage from "@/public/images/placeholder.jpg";
import RelatedBroughtTogether from "@/components/related-brought-together";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CircleCheckBig } from "lucide-react";
import Link from "next/link";
// import { ProductDetailPageType, CatalogProduct } from "@/types"; // Unused
import Heading from "@/components/heading";
import { Breadcrumbs } from "@/components/breadcurmbsComp";
import PageContainer from "@/components/pageContainer";
import { useLocale } from "@/hooks/useLocale";
import { useAllCategoriesWithSubCategories } from "@/hooks/useAllCategoriesWithSubCategories";
import { CategoriesWithSubCategories } from "@/types";
import { slugify } from "@/lib/utils";
import ProductDetailsPageLoading from "./productDetailsPageLoading";

interface ProductDetailViewProps {
    productSlug: string;
    breadcrumbs?: { label: string; href: string }[];
}
import { useDictionary } from "@/hooks/useDictionary";

export default function ProductDetailView({ productSlug, breadcrumbs: parentBreadcrumbs }: ProductDetailViewProps) {
    const sku = productSlug?.split("-").pop();
    const { locale } = useLocale();
    const { dict } = useDictionary();
    const { data: allCategories } = useAllCategoriesWithSubCategories();

    const { data: product, isLoading: loading } = useQuery({
        queryKey: ["product-details", sku, locale],
        queryFn: () => fetchProductDetailsApi(sku!, locale),
        enabled: !!sku,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
    console.log("the all product info", product);
    if (loading)
        return (
            <ProductDetailsPageLoading />
        );

    if (!product) {
        return (
            <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
                <main className="flex flex-col md:flex-row gap-[32px] row-start-2 items-center sm:items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Not Found</CardTitle>
                            <CardDescription>
                                The product you are looking for does not exist.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </main>
            </div>
        );
    }

    // New Data Structure Logic
    const dropdownTotalStock = product.ah_is_in_stock === 1;
    const totalStock = product.ah_max_qty;

    // Breadcrumb reconstruction logic
    const categoryLinks = product.category_links;

    // Recursive Finder for category path
    const findCategoryPath = (
        categories: CategoriesWithSubCategories[],
        targetId: string | number
    ): CategoriesWithSubCategories[] | undefined => {
        for (const cat of categories) {
            if (String(cat.id) === String(targetId)) {
                return [cat];
            }
            if (cat.section) {
                const subChain = findCategoryPath(cat.section, targetId);
                if (subChain) {
                    return [cat, ...subChain];
                }
            }
        }
        return undefined;
    }

    let calculatedBreadcrumbs = parentBreadcrumbs || [{ label: "Home", href: "/" }];

    if (product && allCategories && categoryLinks && categoryLinks.length > 0) {
        let bestChain: CategoriesWithSubCategories[] | undefined;

        for (const link of categoryLinks) {
            const chain = findCategoryPath(allCategories, link.category_id);
            if (chain) {
                if (!bestChain || chain.length > bestChain.length) {
                    bestChain = chain;
                }
            }
        }

        if (bestChain) {
            const newBreadcrumbs = [{ label: "Home", href: "/" }];
            let currentPath = "";
            bestChain.forEach((cat) => {
                const s = slugify(cat.title);
                currentPath += `/${s}`;
                newBreadcrumbs.push({ label: cat.title, href: currentPath });
            });
            newBreadcrumbs.push({ label: product.name, href: "" });
            calculatedBreadcrumbs = newBreadcrumbs;
        } else {
            const hasProduct = calculatedBreadcrumbs.some(b => b.label === product.name);
            if (!hasProduct) {
                calculatedBreadcrumbs = [...calculatedBreadcrumbs, { label: product.name, href: "" }];
            }
        }
    } else if (product && (!parentBreadcrumbs || parentBreadcrumbs.length <= 1)) {
        calculatedBreadcrumbs = [
            { label: "Home", href: "/" },
            { label: product.name, href: "" }
        ];
    }

    const finalBreadcrumbs = calculatedBreadcrumbs;

    const brand = product.manufacturer;
    // const description = null; // Description is not in the new interface explicitly, might strictly use specifications?

    return (
        <PageContainer>
            <Breadcrumbs items={finalBreadcrumbs} />
            <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-4">
                <div className="lg:col-span-2">
                    <ProductImageLTS
                        images={
                            product.images && product.images.length > 0
                                ? product.images
                                    .filter((img) => typeof img.file === "string")
                                    .map((img) => img.file || (placeholderImage as any))
                                : [placeholderImage as any]
                        }
                    />
                </div>
                <div className="lg:col-span-2 p-5">
                    {/* details of product */}
                    <div className="flex flex-col gap-4">
                        <h1 className="h3-bold text-3xl line-clamp-2 overflow-ellipsis">
                            {product.name}
                        </h1>
                        <div>
                            Brand:{" "}
                            {brand ? (
                                <Badge
                                    asChild
                                    variant="outline"
                                    className=" px-2 py-1 text-base capitalize"
                                >
                                    <Link href={`/brands/${brand}`}>{String(brand)}</Link>
                                </Badge>
                            ) : (
                                <span className="text-gray-500">N/A</span>
                            )}
                            <span aria-readonly hidden>
                                {product.id}
                            </span>
                        </div>
                        <p>⭐⭐⭐⭐ No Reviews</p>
                        <span className=" text-gray-500">SKU {product.sku}</span>
                        <div className=" flex gap-2">
                            <span>shipping charges</span>
                            <span className=" text-green-700 text-base font-semibold">
                                free Delivery
                            </span>
                        </div>

                        {product?.special_price ? (
                            <div className="flex gap-x-1 items-baseline">
                                <span className=" text-gray-500 text-sm">QAR</span>
                                <span className="text-2xl font-semibold">
                                    {typeof product.special_price === "number"
                                        ? product.special_price.toFixed(2)
                                        : Number(product.special_price).toFixed(2) || "0.00"}
                                </span>
                                <span className="text-2xl font-semibold line-through">
                                    {typeof product.price === "number"
                                        ? product.price.toFixed(2)
                                        : Number(product.price).toFixed(2) || "0.00"}
                                </span>
                            </div>
                        ) : (
                            <div className="flex gap-x-1 items-baseline">
                                <span className=" text-gray-500 text-sm">QAR</span>
                                <span className="text-2xl font-semibold">
                                    {typeof product.price === "number"
                                        ? product.price.toFixed(2)
                                        : Number(product.price).toFixed(2) || "0.00"}
                                </span>
                            </div>
                        )}

                        {/* Specifications Loop */}
                        {product.specifications && product.specifications.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-semibold text-lg mb-2">Specifications:</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {product.specifications
                                        .map((spec, index) => (
                                            <div key={index} className="flex gap-2 text-sm">
                                                <span className="font-medium capitalize min-w-[150px]">{spec.label}:</span>
                                                <span className="text-gray-600">{spec.value}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
                <div className=" md:col-span-2 lg:col-span-1">
                    <Card className="bg-[#fafafa] w-full max-w-[600px] p-4">
                        <CardContent className="flex flex-col gap-y-4 p-0">
                            <div className=" flex justify-between items-baseline">
                                <div className=" text-gray-500">Price</div>
                                <div>
                                    <span className=" text-gray-500 pr-2">QAR</span>
                                    <span className=" font-semibold text-2xl">
                                        {typeof product.price === "number"
                                            ? product.price.toFixed(2)
                                            : Number(product.price).toFixed(2) || "0.00"}
                                    </span>
                                </div>
                            </div>
                            {dropdownTotalStock ? (
                                <div className=" flex justify-between items-baseline">
                                    <div className=" text-gray-500">Availablity</div>
                                    <span className=" text-green-700 font-semibold">
                                        {" "}
                                        In Stock
                                    </span>
                                </div>
                            ) : (
                                <div className=" flex justify-between items-baseline">
                                    <div className=" text-gray-500">Stock</div>
                                    <span className=" text-red-600">Out Of Stock</span>
                                </div>
                            )}
                            <div className=" flex justify-between items-baseline">
                                <span className=" text-gray-500">Quantity</span>
                                <Select>
                                    <SelectTrigger className="w-[80px]">
                                        <SelectValue placeholder="1" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: totalStock ?? 0 }, (_, index) => (
                                            <SelectItem value={(index + 1).toString()} key={index}>
                                                {index + 1}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {dropdownTotalStock && (
                                <div className=" flex-center">
                                    {/* <AddToCart product={product} /> */}
                                </div>
                            )}
                            <div className=" flex justify-between items-baseline capitalize">
                                <span className=" text-gray-500">delivery</span>
                                <div className=" flex items-end flex-col  text-green-700">
                                    <span className="  font-semibold">Tomorrow 5 September</span>{" "}
                                    <span>Free delivery</span>
                                </div>
                            </div>
                            <div className="text-gray-500 flex justify-between items-baseline">
                                <span>Payment</span>
                                <span className=" text-blue-600">Secure transaction</span>
                            </div>
                            <div className=" text-gray-500 flex justify-between items-baseline">
                                <span>Returns</span>
                                <span className=" text-blue-600 flex items-center">
                                    <CircleCheckBig className="w-5 h-5" /> Free Returns
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/* Related products */}
            <div className="lg:mx-4 ">
                <div>
                    <Heading level={2} className=" font-semibold text-base md:text-2xl my-4 " title={`Brought Together By ${product.name}`}>
                        {dict && dict?.common?.broughtTogetherBy || "Brought Together By"} {product.name}{" "}
                    </Heading>
                    {product.bought_together && product.bought_together.length > 0 ? (
                        <RelatedBroughtTogether productList={product.bought_together} />
                    ) : (
                        <p>No related items found</p>
                    )}
                </div>
                <div>
                    <Heading level={2} className=" font-semibold text-base md:text-2xl my-4 " title="Related Products">
                        {dict && dict?.common?.relatedProducts || "Related Products"}
                    </Heading>
                    {product.related_products && product.related_products.length > 0 ? (
                        <RelatedBroughtTogether productList={product.related_products} />
                    ) : (
                        <p>No related items found</p>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
