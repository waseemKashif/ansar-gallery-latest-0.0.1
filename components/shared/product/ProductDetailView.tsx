
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
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { ShoppingCart, Plus, Minus, Trash, CircleSlash, Box, Truck, CreditCard, Star, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCartActions } from "@/lib/cart/cart.api";
import { CatalogProduct } from "@/types"; // Unused
import Heading from "@/components/heading";
import { Breadcrumbs } from "@/components/breadcurmbsComp";
import PageContainer from "@/components/pageContainer";
import { useLocale } from "@/hooks/useLocale";
import { useAllCategoriesWithSubCategories } from "@/hooks/useAllCategoriesWithSubCategories";
import { CategoriesWithSubCategories } from "@/types";
import { slugify } from "@/lib/utils";
import ProductDetailsPageLoading from "./productDetailsPageLoading";
import { StaticImageData } from "next/image";
interface ProductDetailViewProps {
    productSlug: string;
    breadcrumbs?: { label: string; href: string }[];
}
import { useDictionary } from "@/hooks/useDictionary";
import SplitingPrice from "./splitingPrice";

// Collapsible Specifications Section Component
interface SpecificationsSectionProps {
    specifications: { label: string; value: string }[];
    shortDescription?: string;
}

function SpecificationsSection({ specifications, shortDescription }: SpecificationsSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            const height = contentRef.current.scrollHeight;
            setContentHeight(height);
            setShowButton(height > 114);
        }
    }, [specifications, shortDescription]);

    return (
        <div className="md:p-5 bg-white lg:rounded-lg px-2">
            <h3 className="font-semibold text-lg mb-2">Specifications:</h3>
            <div
                ref={contentRef}
                className="relative overflow-hidden transition-[max-height] duration-300 ease-in-out"
                style={{ maxHeight: isExpanded ? `${contentHeight}px` : '114px' }}
            >
                <div className="grid grid-cols-1 gap-2">
                    {specifications.map((spec, index) => (
                        <div key={index} className="flex gap-2 text-sm">
                            <span className="font-medium capitalize min-w-[150px]">{spec.label}:</span>
                            <span className="text-gray-600">{spec.value}</span>
                        </div>
                    ))}
                </div>
                {shortDescription && (
                    <div className="mt-4">
                        <h3 className="font-semibold text-lg mb-2">Description:</h3>
                        <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: shortDescription }} />
                    </div>
                )}
                {/* Gradient fade effect when collapsed */}
                {!isExpanded && showButton && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
            </div>
            {showButton && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full pt-2 text-blue-600 hover:text-blue-700 font-medium text-sm  border-gray-100 p-2"
                >
                    <span>{isExpanded ? 'Show Less' : 'See Full Details'}</span>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 transition-transform" />
                    ) : (
                        <ChevronDown className="w-5 h-5 transition-transform" />
                    )}
                </button>
            )}
        </div>
    );
}


export default function ProductDetailView({ productSlug, breadcrumbs: parentBreadcrumbs }: ProductDetailViewProps) {
    const rawSku = productSlug?.split("-").pop();
    const sku = rawSku?.replace(/_/g, "-");
    const { locale } = useLocale();
    const { dict } = useDictionary();
    const { data: allCategories } = useAllCategoriesWithSubCategories();

    const { data: product, isLoading: loading } = useQuery({
        queryKey: ["product-details", sku, locale],
        queryFn: () => fetchProductDetailsApi(sku!, locale),
        enabled: !!sku,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Configurable Product Logic
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    // eslint-disable-next-line
    const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
    const { addToCart, items, removeSingleCount } = useCartStore();

    const defaultVariant = product?.configured_data && product.configured_data.length > 0 ? product.configured_data[0] : null;
    const displayVariant = selectedVariant || defaultVariant;

    // Calculate cart state
    const targetSku = displayVariant ? displayVariant.sku : product?.sku;
    const cartItem = items.find(i => i.product.sku === targetSku);
    const cartQty = cartItem ? cartItem.quantity : 0;
    const maxQty = displayVariant ? (displayVariant.max_qty ?? 0) : (product?.ah_max_qty ?? 100);

    const { addConfigurableItem } = useCartActions();

    const handleAdd = () => {
        if (!product) return;

        if (cartQty >= maxQty) {
            toast.error("Max quantity reached");
            return;
        }

        let imageUrl = placeholderImage as string | StaticImageData;
        if (displayVariant && displayVariant.images && displayVariant.images.length > 0) {
            imageUrl = displayVariant.images[0].url || (displayVariant.images[0] as any).file;
        } else if (product.images && product.images.length > 0) {
            imageUrl = (product.images[0] as any).url || (product.images[0] as any).file;
        }

        if (typeof imageUrl !== 'string' && (imageUrl as any).src) {
            imageUrl = (imageUrl as any).src;
        }

        const cartProduct: CatalogProduct = {
            ...product,
            id: targetSku!,
            sku: targetSku!,
            price: currentPrice, // Use calculated price
            special_price: currentSpecialPrice,
            image: imageUrl as string,
            thumbnail: imageUrl as string,
            is_configure: !!displayVariant, // Flag if using variant
            is_configurable: !!displayVariant, // Explicitly set for local consistency if needed
            name: product.name,
            configured_data: undefined,
            configurable_data: undefined
        } as CatalogProduct;

        if (displayVariant) {
            // Optimized path for configurable items: No side cart, instant feedback
            addConfigurableItem(cartProduct, 1).catch(err => {
                console.error("Failed to sync cart", err);
                toast.error("Failed to sync with server");
            });
            toast.success("Added to cart");
        } else {
            console.log("cartProduct", cartProduct);
            // Standard path for simple products
            addToCart(cartProduct, 1);
            if (cartQty === 0) toast.success("Added to cart");
        }
    };

    const handleRemove = () => {
        if (!targetSku) return;
        removeSingleCount(targetSku);
    };

    const attributes = useMemo(() => {
        if (!product || !product.is_configured || !product.configured_data) return {};

        const variants = product.configured_data;
        const attrs: Record<string, { label: string, values: Set<string> }> = {};

        variants.forEach((variant) => {
            variant.config_attributes.forEach((attr) => {
                if (!attrs[attr.code]) {
                    attrs[attr.code] = { label: attr.label, values: new Set() };
                }
                attrs[attr.code].values.add(attr.value);
            });
        });

        const processedAttrs: Record<string, { label: string, values: string[] }> = {};
        Object.keys(attrs).forEach(key => {
            processedAttrs[key] = {
                label: attrs[key].label,
                values: Array.from(attrs[key].values)
            };
        });

        return processedAttrs;
    }, [product]);

    // Find matching variant
    useEffect(() => {
        if (!product?.configured_data || Object.keys(selectedAttributes).length === 0) return;

        const variants = product.configured_data;
        const match = variants.find((variant) => {
            return variant.config_attributes.every((attr) => {
                return selectedAttributes[attr.code] ? selectedAttributes[attr.code] === attr.value : true;
            });
        });

        if (match && Object.keys(selectedAttributes).length === Object.keys(attributes).length) {
            setSelectedVariant(match);
        }
    }, [selectedAttributes, product, attributes]);

    // Default selection
    useEffect(() => {
        if (product && product.is_configured && Object.keys(selectedAttributes).length === 0 && Object.keys(attributes).length > 0) {
            const defaults: Record<string, string> = {};
            Object.keys(attributes).forEach(key => {
                defaults[key] = attributes[key].values[0];
            });
            setSelectedAttributes(defaults);
        }
    }, [product, attributes, selectedAttributes]);

    // Helper to check if an option is available given current selections
    const isOptionAvailable = (attributeCode: string, attributeOptionValue: string) => {
        const sourceData = product?.configured_data;
        if (!sourceData) return true;

        return sourceData.some((variant) => {
            const variantAttributes = variant.config_attributes;
            // Check if variant has the target option
            const hasTarget = variantAttributes.some(
                (attr) => attr.code === attributeCode && attr.value === attributeOptionValue
            );
            if (!hasTarget) return false;

            // Check compatibility with other selected options
            return Object.entries(selectedAttributes).every(([selectedCode, selectedValue]) => {
                if (selectedCode === attributeCode) return true; // Skip the attribute we're testing
                return variantAttributes.some(
                    (attr) => attr.code === selectedCode && attr.value === selectedValue
                );
            });
        });
    };

    const handleAttributeSelect = (code: string, value: string) => {
        setSelectedAttributes(prev => ({ ...prev, [code]: value }));
    };

    // Derived Values for Display
    // Derived Values for Display
    const currentPrice = displayVariant ? Number(displayVariant.price) : (product ? Number(product.price) : 0);

    let currentSpecialPrice: number | null = null;
    let currentPercentage: string | null = null;

    if (displayVariant) {
        currentSpecialPrice = displayVariant.special_price ? Number(displayVariant.special_price) : null;
        currentPercentage = displayVariant.percentage || null;
    } else {
        currentSpecialPrice = product?.special_price ? Number(product.special_price) : null;
        currentPercentage = product?.percentage_value || null;
    }

    // Logic to determine images to show
    const displayImages = useMemo(() => {
        if (!product) return [placeholderImage];

        const imagesToUse = product.images;
        if (displayVariant && displayVariant.images && displayVariant.images.length > 0) {
            return displayVariant.images.map(img => img.url || placeholderImage);
        }

        // Fallback to main product images
        if (imagesToUse && imagesToUse.length > 0) {
            return imagesToUse
                .filter((img) => typeof img.file === "string")
                .map((img) => img.file || placeholderImage);
        }

        return [placeholderImage];
    }, [product, displayVariant]);

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
    console.log("product details page. api response", product);
    return (
        <PageContainer className="px-0! md:px-4!">
            <div className="px-2 ">
                <Breadcrumbs items={finalBreadcrumbs} />

            </div>
            <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2 lg:gap-4 md:mt-4">
                <div className="lg:col-span-3 px-2 md:px-0 lg:sticky lg:top-28 lg:h-fit">
                    <ProductImageLTS
                        images={displayImages as (string | StaticImageData)[]}
                    />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-1.5 lg:gap-4 md:gap-2 bg-transparent">
                    {/* details of product */}
                    <div className="flex flex-col gap-4 bg-white md:rounded-lg md:p-5 px-2 ">
                        <h1 className="h3-bold text-3xl line-clamp-2 overflow-ellipsis" title={product.name}>
                            {product.name}
                        </h1>
                        <div className=" flex gap-2 justify-between flex-wrap">
                            {/* hidden brand */}
                            {/* <div>
                                Brand:{" "}
                                {product.manufacturer ? (
                                    <Badge
                                        asChild
                                        variant="outline"
                                        className=" px-2 py-1 text-base capitalize"
                                    >
                                        <Link href={`/brand/${product.manufacturer}`}>{product.manufacturer}</Link>
                                    </Badge>
                                ) : (
                                    <span className="text-gray-500">N/A</span>
                                )}
                                <span aria-readonly hidden>
                                    {product.id}
                                </span>
                            </div> */}
                            {currentSpecialPrice ? (
                                <div className="flex flex-col gap-1 shrink-0 md:shrink-1 w-full md:w-auto">
                                    <div className="flex gap-1 items-baseline flex-col">
                                        {/* <span className=" text-gray-500 text-sm">QAR</span> */}
                                        <div className="flex items-baseline gap-x-1">
                                            <span className="text-2xl font-semibold">
                                                <SplitingPrice price={currentSpecialPrice} type="special" className="text-3xl leading-7" color="text-red-500" />
                                            </span>
                                            {
                                                product.uom_erp && (
                                                    <span className="text-sm font-medium leading-none">/{product.uom}</span>
                                                )
                                            }
                                        </div>
                                        <div className="flex items-baseline gap-x-2">
                                            <span className="text-xl font-semibold line-through text-gray-400 ml-2">
                                                <SplitingPrice price={currentPrice} />
                                            </span>
                                            {currentPercentage && (
                                                <span className="text-green-700 font-semibold text-lg">
                                                    save {currentPercentage}{product.is_configurable && "%"}
                                                </span>
                                            )}
                                        </div>

                                    </div>

                                </div>
                            ) : (
                                <div className="flex gap-x-1 items-baseline shrink-0 md:shrink-1 w-full md:w-auto">
                                    {/* <span className=" text-gray-500 text-sm">QAR</span> */}
                                    <SplitingPrice price={currentPrice} type="special" className="text-3xl leading-7" />

                                    {
                                        product.uom && (
                                            <span className="text-sm font-medium leading-none">/{product.uom}</span>
                                        )
                                    }
                                </div>
                            )}
                            <div className=" flex flex-col items-baseline text-gray-500">
                                <span >SKU: {displayVariant ? displayVariant.sku : product.sku}</span>
                                <span className="flex items-center gap-1"> <Star className="inline w-4 h-4" /> <Star className="inline w-4 h-4" /> <Star className="inline w-4 h-4" /> <Star className="inline w-4 h-4" />  No Reviews</span>
                            </div>

                            {maxQty > 0 ? (
                                <div className=" flex justify-between items-baseline">
                                    <span className=" text-white font-semibold bg-green-700 px-2.5 py-1 rounded">
                                        {" "}
                                        In Stock
                                    </span>
                                </div>
                            ) : (
                                <div className=" flex justify-between items-baseline">
                                    <span className=" text-red-600 bg-red-100 px-2.5 py-1 rounded">Sold Out</span>
                                </div>
                            )}

                        </div>

                    </div>
                    {/* configured options here */}
                    {/* Attribute Selectors */}
                    {Object.keys(attributes).length > 0 && (
                        <div className="space-y-4 pb-4 md:p-5 md:bg-white md:rounded-lg px-2">
                            {Object.keys(attributes).map((code) => (
                                <div key={code} className="space-y-2">
                                    <Label className="capitalize font-semibold">{attributes[code].label}</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {attributes[code].values.map((value) => {
                                            const isSelected = selectedAttributes[code] === value;
                                            const isAvailable = isOptionAvailable(code, value);

                                            // Find image for this option
                                            let optionImage: string | null = null;
                                            const sourceData = product.configured_data;
                                            if (sourceData) {
                                                const matchingVariant = sourceData.find(variant =>
                                                    variant.config_attributes.some(attr => attr.code === code && attr.value === value)
                                                );
                                                if (matchingVariant && matchingVariant.images && matchingVariant.images.length > 0) {
                                                    optionImage = matchingVariant.images[0].url;
                                                }
                                            }

                                            return (
                                                <div
                                                    key={value}
                                                    className={`flex flex-col items-center gap-1 p-1 rounded-md border-2 transition-all ${isSelected
                                                        ? "border-primary bg-primary/5"
                                                        : "border-transparent hover:border-gray-200"
                                                        } ${!isAvailable
                                                            ? "opacity-50 cursor-not-allowed grayscale bg-gray-50"
                                                            : "cursor-pointer"
                                                        }`}
                                                    onClick={() => {
                                                        if (isAvailable) {
                                                            handleAttributeSelect(code, value);
                                                        }
                                                    }}
                                                >
                                                    {optionImage && code === "color" ? (
                                                        <div className="relative w-24 h-24 bg-white rounded-md overflow-hidden border border-gray-100">
                                                            <img
                                                                src={optionImage}
                                                                alt={value}
                                                                className="w-full h-full object-contain"
                                                                style={{ maxHeight: '200px', maxWidth: '200px' }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        code === "color" ? (
                                                            <div
                                                                className="w-8 h-8 rounded-full border border-gray-200"
                                                                style={{ backgroundColor: value.toLowerCase() }}
                                                            />
                                                        ) : null
                                                    )}
                                                    <span className={`text-xs text-center px-2 py-0.5 rounded ${isSelected ? "font-semibold text-primary" : "text-gray-600"
                                                        } ${!optionImage && code !== "color" ? "border border-gray-200" : ""}`}>
                                                        {value}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* add to cart button with quantity */}
                    <div className="md:p-5 md:col-span-1 bg-white md:rounded-lg px-2" >
                        <div className="flex flex-col gap-4">
                            {cartQty > 0 ? (
                                <div className="flex items-center gap-4 w-full justify-between">

                                    <div className="flex items-center gap-4 w-full">
                                        <div className="flex items-center  bg-white w-full">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleRemove}
                                                className="h-10 w-22 hover:bg-primary/90 bg-primary text-white rounded-none hover:text-white"
                                            >
                                                {cartQty === 1 ? <Trash className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                                            </Button>
                                            <span className="h-10 border border-gray-500 text-center font-semibold text-lg w-full items-center leading-9">{cartQty}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleAdd}
                                                className="h-10 w-22 hover:bg-primary/90 bg-primary text-white rounded-none hover:text-white"
                                                disabled={cartQty >= maxQty}
                                            >
                                                {cartQty >= maxQty ? <CircleSlash className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                maxQty > 0 ? (
                                    <div className="flex w-full box-border">
                                        {/* quantity drop down here */}
                                        <Button
                                            className=" w-full text-base py-3 bg-primary hover:bg-primary/80 text-white "
                                            size="lg"
                                            onClick={handleAdd}
                                        >
                                            <ShoppingCart className="mr-2 h-5 w-5" />
                                            Add to Cart
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        className="w-full text-base py-3 bg-gray-300 text-gray-500 cursor-not-allowed"
                                        size="lg"
                                        disabled
                                    >
                                        Sold Out
                                    </Button>
                                )
                            )}
                        </div>

                    </div>
                    {/* delivery information */}
                    <div className="md:p-5  gap-x-3 bg-white md:rounded-lg flex flex-col px-2">
                        <div className=" grid grid-cols-1 lg:grid-cols-2 gap-x-3">
                            <div className="flex gap-x-3 items-center">
                                <span className="flex items-center gap-x-3 font-semibold capitalize"> <Truck className="w-5 h-5" /> delivery</span>
                                <span className="text-sm break-words inline-flex justify-start">{product.delivery_slot}</span>

                            </div>
                            <div className=" text-black flex gap-x-3 items-center">
                                <span className="flex items-center gap-x-3 font-semibold capitalize"> <Box className="w-5 h-5" /> Returns</span>
                                <span className=" text-gray-600 text-sm">
                                    Within 15 days of order. (T&C apply)
                                </span>
                            </div>
                        </div>
                        <div className="text-black capitalize flex md:items-center items-start gap-x-3">
                            <span className="flex items-start lg:items-center gap-x-3 font-semibold whitespace-nowrap"><CreditCard className="w-5 h-5" /> Secure payments</span>
                            <span className="text-sm text-gray-600">We accept credit or debit cards, cash on delivery and card on delivery</span>
                        </div>

                    </div>
                    {/* specifications */}
                    {product.specifications && product.specifications.length > 0 && (
                        <SpecificationsSection
                            specifications={product.specifications}
                            shortDescription={product.short_description}
                        />
                    )}

                </div>
            </div>
            {/* Related products */}
            <div className="lg:mx-4 my-4 px-2">
                <div>
                    <Heading level={2} className=" font-semibold text-base md:text-2xl my-4 " title={`Brought Together By ${product.name}`}>
                        {dict && dict?.common?.boughtTogetherBy || "Bought Together By"} {product.name}{" "}
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
