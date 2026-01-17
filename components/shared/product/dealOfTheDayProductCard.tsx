"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import Link from "next/link";
import AddToCart from "@/components/shared/product/add-to-cart";
import { CatalogProduct } from "@/types/index";
import { CalendarDays } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import placeholderImage from "@/public/images/placeholder.jpg";
import Image from "next/image";
import LocaleLink from "../LocaleLink";
import SplitingPrice from "./splitingPrice";
import { useDictionary } from "@/hooks/useDictionary";
import ConfigurableAddToCart from "./ConfigurableAddToCart";
import OutOfStockLabel from "./out-of-stock-label";
const DealOfTheDayProductCard = ({ product }: { product: CatalogProduct, categoryPath?: string }) => {
    const setSelectedProduct = useProductStore(
        (state) => state.setSelectedProduct
    );

    const storeProductInStore = () => {
        setSelectedProduct(product); // Store product in Zustand
    };
    function makeSlug(name: string, sku: string) {
        // Replace hyphens with underscores in SKU to ensure safe splitting later
        const safeSku = sku.replace(/-/g, "_");
        return `${name?.toLowerCase().replace(/[\s/]+/g, "-")}-${safeSku}`;
    }
    const { dict } = useDictionary();
    const productSlug = makeSlug(product.name, product.sku);
    const productLink = `/${productSlug}`;

    let displayPrice = product.price;
    let displaySpecialPrice = product.special_price;

    if (product.is_configurable && product.configurable_data && product.configurable_data.length > 0) {
        const firstVariant = product.configurable_data[0];
        displayPrice = parseFloat(firstVariant.price);
        const variantSpecialPrice = firstVariant.special_price ? parseFloat(firstVariant.special_price) : null;
        if (variantSpecialPrice && variantSpecialPrice < displayPrice) {
            displaySpecialPrice = variantSpecialPrice;
        } else {
            displaySpecialPrice = null;
        }
    }

    return (
        <Card className=" w-full max-w-sm gap-y-0 pb-0 pt-0  rounded-md lg:rounded-xl" key={product.sku}>
            <CardHeader className=" p-0 items-center  relative gap-0">
                <LocaleLink
                    href={productLink}
                    onClick={storeProductInStore}
                >
                    <Image
                        // src={product.image || placeholderImage}
                        src={product.image || placeholderImage}
                        alt={product.name}
                        height={400}
                        width={400}
                        className=" overflow-clip aspect-square"
                    />
                </LocaleLink>
                {
                    product.is_sold_out ? <OutOfStockLabel className="">Sold Out</OutOfStockLabel> : (
                        product.is_configurable ? (
                            <ConfigurableAddToCart
                                product={product}
                                variant="cardButton"
                            />
                        ) : (
                            <AddToCart
                                product={product}
                                variant="cardButton"
                            />
                        )
                    )
                }
                {
                    product.manufacturer && (
                        <div className=" text-xs w-fit bg-gray-100  text-primary rounded-md px-1 py-[2px] absolute top-[1px] right-[1px]">
                            {product.manufacturer}
                        </div>
                    )
                }
            </CardHeader>
            <CardContent className="p-1 lg:p-2 text-start relative ">
                <LocaleLink href={productLink}>
                    <h2
                        className="text-sm font-medium overflow-ellipsis line-clamp-2 h-11"
                        title={product.name}
                    >
                        {product.name}
                    </h2>
                </LocaleLink>
                {displaySpecialPrice ? (
                    <div className="flex gap-x-2 gap-y-0 items-baseline md:flex-nowrap flex-wrap">
                        <div className="flex items-baseline gap-x-1">
                            <span className=" text-gray-500 text-sm">{dict?.common?.QAR}</span>
                            <SplitingPrice price={displaySpecialPrice} color="text-red-500" />
                        </div>
                        <div className="flex  items-baseline">
                            <span className="line-through text-gray-500 text-sm"><SplitingPrice price={displayPrice} className="text-gray-500 text-base font-medium" /></span>

                        </div>
                    </div>
                ) : (
                    <div className=" flex justify-start items-baseline gap-x-1">
                        <span className=" text-gray-500 text-sm">{dict?.common?.QAR}</span>
                        <SplitingPrice price={displayPrice} className="text-xl" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DealOfTheDayProductCard;
