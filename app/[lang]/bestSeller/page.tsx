"use client";
import { Card, CardContent } from "@/components/ui/card";
import { fetchBestSellerProducts } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ProductCardLts from "@/components/shared/product/productCard-lts";
import { useZoneStore } from "@/store/useZoneStore";
const BestSellerPage = () => {
  const { zone } = useZoneStore();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["best-seller-products", zone],
    queryFn: () => fetchBestSellerProducts(zone),
    retry: 1,
  });
  if (isLoading) {
    return (
      <div className="mx-auto p-4 lg:p-10 ">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].length > 0 ? (
          <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2  gap-4 ">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <span className="inline-block bg-gray-200 rounded w-44 h-64 lg:w-64 lg:h-96 animate-pulse" key={item}></span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No items found
          </p>
        )}
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading data</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 lg:p-10 ">
      {data.items.length > 0 ? (
        <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2  gap-4 ">
          {data.items.map((item) => (
            <ProductCardLts key={item.sku} product={item} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No buy with items found
        </p>
      )}
    </div>
  );
};

export default BestSellerPage;
