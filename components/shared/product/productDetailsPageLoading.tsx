import { Card, CardContent } from "@/components/ui/card";
import { CircleCheckBig, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
const ProductDetailsPageLoading = () => {
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
};

export default ProductDetailsPageLoading;