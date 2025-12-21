import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ImageCardLts from "./imageCard-lts";
import Link from "next/link";
import AddToCart from "@/components/shared/product/add-to-cart";
import { CatalogProduct, Product } from "@/types/index";
import { CalendarDays } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import LocaleLink from "../LocaleLink";
const ProductCardLts = ({ product }: { product: CatalogProduct | Product }) => {
  const setSelectedProduct = useProductStore(
    (state) => state.setSelectedProduct
  );
  const storeProductInStore = () => {
    setSelectedProduct(product); // Store product in Zustand
  };
  function makeSlug(name: string, sku: string) {
    return `${name.toLowerCase().replace(/[\s/]+/g, "-")}-${sku}`;
  }

  return (
    <Card className=" w-full max-w-sm gap-y-1 pb-1.5 pt-0" key={product.sku}>
      <CardHeader className=" p-0  items-center  relative">
        <LocaleLink
          href={`/productDetails/${makeSlug(product.name, product.sku)}`}
          onClick={storeProductInStore}
        >
          <ImageCardLts
            images={[(product as CatalogProduct).image || "/images/placeholder.png"]}
            alt={product.name}
            height={400}
            width={400}
            className=" overflow-clip"
          />
        </LocaleLink>
        <AddToCart
          product={product as CatalogProduct}
          variant="cardButton"
        />
      </CardHeader>
      <CardContent className="p-1 md:p-4">
        <div className=" text-xs w-fit bg-blue-500  text-white rounded-e-md px-1 py-[2px]">
          {/* {product.brand} */}
          Not found
        </div>
        <LocaleLink href={`/product/${product.name}-${product.sku}`}>
          <h2
            className="text-sm font-medium overflow-ellipsis line-clamp-2 h-11"
            title={product.name}
          >
            {product.name}
          </h2>
        </LocaleLink>
        <div className=" flex justify-start items-baseline gap-x-1">
          <span className=" text-gray-500 text-sm">QAR</span>
          <span className="font-semibold text-lg">
            {product?.special_price ? (
              <div className="flex gap-x-1">
                <span>{product.special_price.toFixed(2)}</span>
                <span className="line-through">{typeof product.price === "number"
                  ? product.price.toFixed(2)
                  : Number(product.price).toFixed(2) || "0.00"}</span>
              </div>
            ) : (
              typeof product.price === "number"
                ? product.price.toFixed(2)
                : Number(product.price).toFixed(2) || "0.00"
            )}
          </span>
        </div>
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

export default ProductCardLts;
