import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ImageCard from "@/components/shared/imageCard";
import Link from "next/link";
import AddToCart from "@/components/shared/product/add-to-cart";
import { ProductType } from "@/types/index";
import { CalendarDays } from "lucide-react";

const ProductCard = ({ product }: { product: ProductType }) => {
  return (
    <Card className=" w-full max-w-sm gap-y-1 py-1.5" key={product.slug}>
      <CardHeader className=" p-0  items-center  relative">
        <Link href={`/product/${product.slug}`}>
          <ImageCard
            images={product.images}
            alt={product.name}
            height={300}
            width={300}
          />
        </Link>
        <AddToCart productId={product.sku} variant="cardButton" productName={product.name}/>
      </CardHeader>
      <CardContent className="p-1 md:p-4">
        <div className=" text-xs w-fit bg-blue-500  text-white rounded-e-md px-1 py-[2px]">
          {product.brand}
        </div>
        <Link href={`/product/${product.slug}`}>
          <h2
            className="text-sm font-medium overflow-ellipsis line-clamp-2 h-11"
            title={product.name}
          >
            {product.name}
          </h2>
        </Link>
        <div className=" flex justify-start items-baseline gap-x-1">
          <span className=" text-gray-500 text-sm">QAR</span>
          <span className=" font-semibold  text-lg">
            {product.regularPrice}
          </span>
        </div>
        <div className=" flex justify-start items-center gap-x-2">
          <CalendarDays className=" h-4 w-4 text-gray-500" />
          {product.deliveryType === "EXP" ? (
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

export default ProductCard;
