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
import AssortedAddToCart from "./assortedAddtoCartBtn";
import { cn } from "@/lib/utils";
const CatalogProductCard = ({ product, className }: { product: CatalogProduct, categoryPath?: string, className?: string }) => {
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

    if (product.is_configurable && product.configurable_data && product.configurable_data.length > 0 && !product.option_count) {
        const firstVariant = product.configurable_data[0];
        displayPrice = parseFloat(firstVariant.price);
        const variantSpecialPrice = firstVariant.special_price ? parseFloat(firstVariant.special_price) : null;
        if (variantSpecialPrice && variantSpecialPrice < displayPrice) {
            displaySpecialPrice = variantSpecialPrice;
        } else {
            displaySpecialPrice = null;
        }
    }
    // logic for assorted products
    // logic for assorted products
    const isAssortedProduct = product.is_configurable && product.option_count && product.option_count > 0 && product.configurable_data && product.configurable_data.length < 1;
    if (isAssortedProduct) {
        displayPrice = parseFloat(product.price as unknown as string);
        const variantSpecialPrice = product.special_price ? parseFloat(product.special_price as unknown as string) : null;
        if (variantSpecialPrice && variantSpecialPrice < displayPrice) {
            displaySpecialPrice = variantSpecialPrice;
        } else {
            displaySpecialPrice = null;
        }
    }
    return (
        <Card className={cn(" w-full max-w-sm gap-y-0 pb-1.5 pt-0  rounded-md lg:rounded-xl", className)} key={product.sku}>
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
                        className=" overflow-clip aspect-square max-h-[302px]"
                    />
                </LocaleLink>
                {
                    !product.is_configurable && product?.max_qty < 1 ? <OutOfStockLabel className="">{dict?.common.soldOut}</OutOfStockLabel> : (
                        product.is_configurable && !isAssortedProduct ? (
                            <ConfigurableAddToCart
                                product={product}
                                variant="cardButton"
                            />
                        ) : isAssortedProduct ? (
                            <AssortedAddToCart
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
                        <div className=" text-xs w-fit bg-gray-100  text-primary rounded-se-md px-1 py-[2px] absolute top-0 right-0">
                            {product.manufacturer}
                        </div>
                    )
                }
            </CardHeader>
            <CardContent className="p-1 md:px-2 pb-0 text-start relative h-full">
                <div className="flex flex-col gap-y-2 h-full justify-between" >
                    <LocaleLink href={productLink}>
                        <h2
                            className="text-sm font-medium overflow-ellipsis line-clamp-2 h-11"
                            title={product.name}
                        >
                            {product.name}
                        </h2>
                    </LocaleLink>


                    {displaySpecialPrice ? (
                        <div className="flex flex-col">
                            <div className="flex gap-x-1 items-baseline">

                                <SplitingPrice price={displaySpecialPrice} type="special" />
                            </div>
                            <div className="flex gap-x-1 items-baseline">
                                <span className="text-gray-500 text-sm">{dict?.common?.was}</span>
                                <span className="line-through text-gray-500 text-sm"><SplitingPrice price={displayPrice} className="text-gray-500 text-base font-medium" /></span>
                                <span className="text-green-700 font-semibold text-lg">{dict?.common?.save} {product.percentage}%</span>
                            </div>
                        </div>
                    ) : (
                        <div className=" flex justify-start items-baseline gap-x-1">
                            {/* <span className=" text-gray-500 text-sm">{dict?.common?.QAR}</span> */}
                            <SplitingPrice price={displayPrice} className="text-2xl" type="special" />
                        </div>
                    )}

                    {
                        product.delivery_slot && (
                            <div className=" flex justify-start items-center gap-x-1">
                                <CalendarDays className=" h-4 w-4 text-gray-500" />
                                <span className=" text-gray-500 text-sm line-clamp-1  text-overflow-ellipsis">
                                    {product.delivery_slot}
                                </span>
                            </div>
                        )
                    }
                    {/* <div className=" flex justify-start items-center gap-x-2">
                    <CalendarDays className=" h-4 w-4 text-gray-500" />
                    {product.type_id === "EXP" ? (
                        <span className=" text-gray-500 text-sm line-clamp-1  text-overflow-ellipsis">
                            As per selected Time slot
                        </span>
                    ) : (
                        <span className=" text-gray-500 text-sm">Tomorrow 7th Sept</span>
                    )}
                </div> */}
                </div>
            </CardContent>
        </Card>
    );
};

export default CatalogProductCard;
