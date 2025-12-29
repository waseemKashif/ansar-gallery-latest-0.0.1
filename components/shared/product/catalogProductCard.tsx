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
import { Currency } from "@/lib/constants";
const CatalogProductCard = ({ product }: { product: CatalogProduct, categoryPath?: string }) => {
    const setSelectedProduct = useProductStore(
        (state) => state.setSelectedProduct
    );
    const storeProductInStore = () => {
        setSelectedProduct(product); // Store product in Zustand
    };
    function makeSlug(name: string, sku: string) {
        return `${name.toLowerCase().replace(/[\s/]+/g, "-")}-${sku}`;
    }

    const productSlug = makeSlug(product.name, product.sku);
    const productLink = `/${productSlug}`;

    return (
        <Card className=" w-full max-w-sm gap-y-1 pb-1.5 pt-0  rounded-md lg:rounded-xl" key={product.sku}>
            <CardHeader className=" p-0 items-center  relative">
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
                <AddToCart
                    product={product}
                    variant="cardButton"
                />
            </CardHeader>
            <CardContent className="p-1 md:p-3 text-start relative">
                {
                    product.manufacturer && (
                        <div className=" text-xs w-fit bg-blue-500  text-white rounded-e-md px-1 py-[2px] absolute top-[-14px] left-1">
                            {product.manufacturer}
                        </div>
                    )
                }
                <LocaleLink href={productLink}>
                    <h2
                        className="text-sm font-medium overflow-ellipsis line-clamp-2 h-11"
                        title={product.name}
                    >
                        {product.name}
                    </h2>
                </LocaleLink>
                {product?.special_price ? (
                    <div className="flex flex-col">
                        <div className="flex gap-x-1 items-baseline">

                            <SplitingPrice price={product.special_price} type="special" />
                        </div>
                        <div className="flex gap-x-1 items-baseline">
                            <span className="text-gray-500 text-sm">Was</span>
                            <span className="line-through text-gray-500 text-sm"><SplitingPrice price={product.price} className="text-gray-500 text-base font-medium" /></span>
                            <span className="text-green-700 font-semibold text-lg">save {product.percentage}%</span>
                        </div>
                    </div>
                ) : (
                    <div className=" flex justify-start items-baseline gap-x-1">
                        <span className=" text-gray-500 text-sm">{Currency}</span>
                        <SplitingPrice price={product.price} className="text-2xl" />
                    </div>
                )}
                <div className=" flex justify-start items-center gap-x-2">
                    <CalendarDays className=" h-4 w-4 text-gray-500" />
                    {product.type_id === "EXP" ? (
                        <span className=" text-gray-500 text-sm line-clamp-1  text-overflow-ellipsis">
                            As per selected Time slot
                        </span>
                    ) : (
                        <span className=" text-gray-500 text-sm">Tomorrow 7th Sept</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CatalogProductCard;
