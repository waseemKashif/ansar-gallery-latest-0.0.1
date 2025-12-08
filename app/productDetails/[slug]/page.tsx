"use client";
import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useProductStore } from "@/store/useProductStore";
import {
  fetchProductRecommendations,
} from "@/lib/api";
import AddToCart from "@/components/shared/product/add-to-cart";
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
import { CatalogProduct, Product } from "@/types";
import ProductCardSkeleton from "@/components/shared/product/productCardSkeleton";
import Heading from "@/components/heading";
import { Breadcrumbs } from "@/components/breadcurmbsComp";
import PageContainer from "@/components/pageContainer";
export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const sku = slug?.split("-").pop();

  const { selectedProduct, setSelectedProduct } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // const { data, isLoading, error, refetch } = useQuery({
  //   queryKey: ["product-recommendations", sku],
  //   queryFn: fetchProductRecommendations,
  //   retry: 1,
  // });


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

    if (selectedProduct && selectedProduct.sku === sku) {
      // Store has the right product
      setProduct(selectedProduct as Product);
      console.log("the selected product is", selectedProduct);
      setLoading(false);
    } else {
      // Fetch new product if slug does not match
      fetchProduct();
    }
  }, [sku]);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["product-recommendations", product?.id],
    queryFn: ({ queryKey }) => {
      const [, slug] = queryKey;
      return fetchProductRecommendations(product?.id.toString());
    },
    retry: 2,
  });
  console.log("the data is", data);
  console.log("the product is", product);
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
  if (!product) return notFound();

  const dropdownTotalStock = product.extension_attributes?.ah_is_in_stock == 1 || 0;
  const totalStock = product.extension_attributes?.ah_max_qty;
  if (loading) return <p>Loading product...</p>;
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
    <PageContainer className="">
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        // { label: product?.brand, href: `/brands/${product?.brand}` },
        { label: product?.name || "" },
      ]} />
      <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-4">
        <div className="lg:col-span-2">
          <ProductImageLTS
            images={product.media_gallery_entries
              ?.filter((attr) => typeof attr.file === "string")
              .map((attr) => attr.file as string || (placeholderImage as any))}
          // images={[product.image]}  
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
              <Badge
                asChild
                variant="outline"
                className=" px-2 py-1 text-base capitalize"
              >
                {/* <Link href={`/brands/${product.brand}`}>{product.brand}</Link> */}
                <Link href={`/brands/linked-brand`}>Not Found</Link>
              </Badge>{" "}
              <span aria-readonly hidden>
                {product.id ||
                  "Not Found"}
              </span>
            </div>
            <p>⭐⭐⭐⭐ No Reviews</p>
            <span className=" text-gray-500">SKU {product.sku}</span>
            <div>
              <span>QAR</span>

              <span className="text-2xl font-semibold">
                {typeof product.price === "number"
                  ? product.price.toFixed(2)
                  : Number(product.price).toFixed(2) || "0.00"}
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
              {/* {product.description} */}
              Not Found
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
            <Heading level={2} className=" font-semibold text-base md:text-2xl my-4 ">
              Brought Together By {product.name}{" "}
            </Heading>
            {data?.buywith?.items?.length > 0 ? (
              <RelatedBroughtTogether productList={data?.buywith?.items} />
            ) : (
              <p>No related items found</p>
            )}
          </div>
          <div>
            <Heading level={2} className=" font-semibold text-base md:text-2xl my-4 ">
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