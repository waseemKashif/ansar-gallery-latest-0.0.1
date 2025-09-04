import { getProductById } from "@/lib/actions/product";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
//
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";
import Link from "next/link";
import { CircleCheckBig } from "lucide-react";

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props?.params;
  const product = await getProductById(slug);
  const dropdownTotalStock = product?.stock;
  if(product){

  }
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
  return (
    <section className="p-4 lg:p-10 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-4">
        {/* images column 2 of 5 columns */}
        <div className="lg:col-span-2">
          <ProductImages images={product.images} />
        </div>
        <div className="lg:col-span-2 p-5">
          {/* details of product */}
          <div className="flex flex-col gap-4">
            <h1 className="h3-bold text-3xl line-clamp-2 overflow-ellipsis">
              {product.name}
            </h1>
            <div>
              Brand:{" "}
              <Badge
                asChild
                variant="outline"
                className=" px-2 py-1 text-base capitalize"
              >
                <Link href={`/brands/${product.brand}`}>{product.brand}</Link>
              </Badge>{" "}
              <span aria-readonly hidden>
                {product.category}
              </span>
            </div>
            <p>⭐⭐⭐⭐ No Reviews</p>
            <span className=" text-gray-500">SKU {product.sku}</span>
            <div>
              <span>QAR</span>
              <span className=" text-2xl font-semibold">
                {" "}
                {product.regularPrice}
              </span>
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
              {product.description}
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
                  <span className=" font-semibold text-2xl">
                    {product.regularPrice}
                  </span>
                </div>
              </div>
              {product.stock > 0 ? (
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
                    {Array.from({ length: dropdownTotalStock ?? 0 }, (_, index) => (
                      <SelectItem value={(index + 1).toString()} key={index}>
                        {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {product.stock > 0 && (
                <div className=" flex-center">
                  <AddToCart />
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
      <div>
        <h2>Brought Together By {product.name} </h2>
        <h2>Related Products</h2>
      </div>
    </section>
  );
};
export default ProductDetailsPage;
