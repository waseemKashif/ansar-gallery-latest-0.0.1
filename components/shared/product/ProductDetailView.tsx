"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProductStore } from "@/store/useProductStore";
import {
    fetchProductRecommendations,
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
import { Product, CatalogProduct } from "@/types";
import ProductCardSkeleton from "@/components/shared/product/productCardSkeleton";
import Heading from "@/components/heading";
import { Breadcrumbs } from "@/components/breadcurmbsComp";
import PageContainer from "@/components/pageContainer";

interface ProductDetailViewProps {
    productSlug: string;
    breadcrumbs?: { label: string; href: string }[];
}

export default function ProductDetailView({ productSlug, breadcrumbs: parentBreadcrumbs }: ProductDetailViewProps) {
    const sku = productSlug?.split("-").pop();

    const { selectedProduct, setSelectedProduct } = useProductStore();
    const [product, setProduct] = useState<Product | CatalogProduct | null>(null);
    const [loading, setLoading] = useState(true);

    async function fetchProduct() {
        if (!sku) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/product/${sku}`);
            if (!res.ok) throw new Error("Failed to fetch product");
            const data = await res.json();
            setProduct(data as Product);
            setSelectedProduct(data as Product);
            console.log("the data is", data);
        } catch (err) {
            setLoading(false);
            console.error("Error fetching product:", err);
        } finally {
            setLoading(false);
        }
    }

    // ✅ Run on URL (slug) change
    useEffect(() => {
        if (!sku) return;

        // Check if the stored product matches SKU AND has detailed attributes (like custom_attributes)
        // CatalogProduct usually is lighter, so we need to fetch full details if they are missing.
        if (selectedProduct && selectedProduct.sku === sku && "custom_attributes" in selectedProduct && selectedProduct.custom_attributes) {
            // Store has the right product detailed product
            setProduct(selectedProduct as Product);
            console.log("the selected product is", selectedProduct);
            setLoading(false);
        } else {
            // Fetch new product if slug does not match OR if stored product is missing details
            fetchProduct();
        }
    }, [sku, selectedProduct]);

    const { data, isLoading } = useQuery({
        queryKey: ["product-recommendations", product?.id],
        queryFn: ({ queryKey }) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [, slug] = queryKey;
            return fetchProductRecommendations(product?.id.toString());
        },
        retry: 2,
        enabled: !!product?.id
    });

    if (loading)
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-4 max-w-[1600px] mx-auto md:p-8 p-2">
                {/* images column 2 of 5 columns */}

                <div className="lg:col-span-2">
                    <span className="inline-block bg-gray-200 rounded w-[500px] h-auto animate-pulse"></span>
                </div>

                <div className="lg:col-span-2 p-5">
                    {/* details of product */}
                    <div className="flex flex-col gap-4">
                        <h1 className="h3-bold text-3xl line-clamp-2 overflow-ellipsis">
                            <span className="inline-block bg-gray-200 rounded w-40 h-8 animate-pulse"></span>
                        </h1>
                        <div>
                            Brand:{" "}
                            <Badge
                                asChild
                                variant="outline"
                                className=" px-2 py-1 text-base capitalize"
                            >
                                {/* <Link href={`/brands/${product.brand}`}>{product.brand}</Link> */}
                                <Link href={`/brands/linked-brand`}>
                                    {" "}
                                    <span className="inline-block bg-gray-200 rounded w-40 h-8 animate-pulse"></span>
                                </Link>
                            </Badge>{" "}
                            <span aria-readonly hidden>
                                <span className="inline-block bg-gray-200 rounded w-40 h-8 animate-pulse"></span>
                            </span>
                        </div>
                        <p>⭐⭐⭐⭐ No Reviews</p>
                        <span className=" text-gray-500">
                            SKU{" "}
                            <span className="inline-block bg-gray-200 rounded w-40 h-8 animate-pulse"></span>
                        </span>
                        <div>
                            <span>QAR</span>

                            <span className="inline-block bg-gray-200 rounded w-40 h-8 animate-pulse"></span>
                        </div>
                        <div className=" flex gap-2">
                            <span>shipping charges</span>
                            <span className=" text-green-700 text-base font-semibold">
                                free Delivery
                            </span>
                        </div>
                        <h3>
                            {" "}
                            Description:
                            {/* {product.description} */}
                            <span className="inline-block bg-gray-200 rounded w-40 h-8 animate-pulse"></span>
                        </h3>
                    </div>
                </div>
                <div className=" md:col-span-2 lg:col-span-1">
                    <Card className="bg-[#fafafa] w-full max-w-[600px] p-4">
                        <CardContent className="flex flex-col gap-y-4 p-0">
                            <div className=" flex justify-between items-baseline">
                                <div className=" text-gray-500">Price</div>
                                <div>
                                    <span className=" text-gray-500 pr-2">QAR</span>
                                    <span className="inline-block bg-gray-200 rounded w-40 h-8 animate-pulse"></span>
                                </div>
                            </div>

                            <div className=" flex justify-between items-baseline">
                                <div className=" text-gray-500">Availablity</div>
                                <span className=" text-green-700 font-semibold">
                                    {" "}
                                    <span className="inline-block bg-gray-200 rounded w-40 h-8 animate-pulse"></span>
                                </span>
                            </div>

                            <div className=" flex justify-between items-baseline">
                                <span className=" text-gray-500">Quantity</span>
                                <span className="inline-block bg-gray-200 rounded w-40 h-8 animate-pulse"></span>
                            </div>

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

    // Safely check for extension attributes
    const dropdownTotalStock = product && "extension_attributes" in product && product.extension_attributes?.ah_is_in_stock == 1 || false;
    const totalStock = product && "extension_attributes" in product ? product.extension_attributes?.ah_max_qty : 0;

    const finalBreadcrumbs = parentBreadcrumbs ? [...parentBreadcrumbs, { label: product.name }] : [
        { label: "Home", href: "/" },
        { label: product.name }
    ];

    // Helper to get attribute value
    function getAttribute(code: string) {
        if (!product) return null;
        // 'custom_attributes' exists on Product, but not always on CatalogProduct (check types)
        if ("custom_attributes" in product && product.custom_attributes) {
            const attr = product.custom_attributes.find((a) => a.attribute_code === code);
            return attr ? attr.value : null;
        }
        return null;
    }

    const description = getAttribute("description") || getAttribute("short_description") || ("description" in product ? product.description : null);
    const brand = getAttribute("brand") || getAttribute("manufacturer");
    console.log(product, "the product is")
    console.log("ProductDetailView Debug:", {
        sku,
        hasProduct: !!product,
        customAttributes: "custom_attributes" in product ? product.custom_attributes : "N/A",
        brand,
        descriptionPreview: description ? String(description).slice(0, 20) : "N/A"
    });

    return (
        <PageContainer className="">
            <Breadcrumbs items={finalBreadcrumbs} />
            <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-4">
                <div className="lg:col-span-2">
                    <ProductImageLTS
                        images={
                            ("media_gallery_entries" in product && product.media_gallery_entries)
                                ? (product as Product).media_gallery_entries
                                    ?.filter((attr) => typeof attr.file === "string")
                                    .map((attr) => attr.file as string || (placeholderImage as any))
                                : ("image" in product && product.image ? [product.image] : [placeholderImage as any])
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
                        {/* old type of product here. special price is in custom attributes*/}
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
                        <span>waseem</span>
                        <div>
                            {/* @ts-ignore */}
                            {description && (
                                <div className="prose max-w-none">
                                    <h3 className="font-semibold text-lg">Description:</h3>
                                    <div dangerouslySetInnerHTML={{ __html: String(description) }} />
                                </div>
                            )}
                        </div>

                        {/* Specifications Loop */}
                        {"custom_attributes" in product && product.custom_attributes && product.custom_attributes.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-semibold text-lg mb-2">Specifications:</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {(product as Product).custom_attributes // Safe due to guard
                                        .filter(attr => !['description', 'short_description', 'image', 'small_image', 'thumbnail', 'category_ids'].includes(attr.attribute_code))
                                        .map((attr) => (
                                            <div key={attr.attribute_code} className="flex gap-2 text-sm">
                                                <span className="font-medium capitalize min-w-[150px]">{attr.attribute_code.replace(/_/g, " ")}:</span>
                                                <span className="text-gray-600">{Array.isArray(attr.value) ? attr.value.join(", ") : attr.value}</span>
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
            {!data || isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 my-8 lg:my-12">
                    {[...Array(6)].map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <div className="lg:mx-4 ">
                    <div>
                        <Heading level={2} className=" font-semibold text-base md:text-2xl my-4 " title={`Brought Together By ${product.name}`}>
                            Brought Together By {product.name}{" "}
                        </Heading>
                        {data?.buywith?.items?.length > 0 ? (
                            <RelatedBroughtTogether productList={data?.buywith?.items} />
                        ) : (
                            <p>No related items found</p>
                        )}
                    </div>
                    <div>
                        <Heading level={2} className=" font-semibold text-base md:text-2xl my-4 " title="Related Products">
                            Related Products
                        </Heading>
                        {data?.related?.items?.length > 0 ? (
                            <RelatedBroughtTogether productList={data?.related?.items} />
                        ) : (
                            <p>No related items found</p>
                        )}
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
