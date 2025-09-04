
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { getAllProducts } from "@/lib/actions/product";

import ImageCard from "@/components/shared/imageCard";
import Link from "next/link";

const CatalogPage =async ()=>{
  const allProducts = await getAllProducts();
return (
  <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2  gap-4 p-4 lg:p-10 mx-auto">
    {allProducts.map((product) => (
      <Card className=" w-full max-w-sm" key={product.slug}>
        <CardHeader className=" p-0  items-center ">
          <Link href={`/product/${product.slug}`}>
            <ImageCard
              images={product.images}
              alt={product.name}
              height={300}
              width={300}
            />
          </Link>
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
        </CardContent>
      </Card>
    ))}
  </div>
);
}

export default CatalogPage