"use client";

// app/skuList/page.tsx
import { useQuery } from "@tanstack/react-query";
import { fetchProductRecommendations } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart } from "lucide-react";

export default function SkuListPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["product-recommendations"],
    queryFn: fetchProductRecommendations,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SKU data...</p>
        </div>
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Product SKU List
        </h1>
        <p className="text-gray-600">Buy With and Related Product SKUs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Buy With Items */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl">Buy With Items</CardTitle>
            </div>
            <CardDescription>
              Products recommended to buy together
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.buywith.items.length > 0 ? (
              <div className="space-y-3">
                {data.buywith.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                  >
                    <div>
                      <Badge variant="outline" className="font-mono text-sm">
                        {item.sku}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1 truncate max-w-[200px]">
                        {item.name}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No buy with items found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Related Items */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              <CardTitle className="text-xl">Related Items</CardTitle>
            </div>
            <CardDescription>
              Products related to your selection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.related.items.length > 0 ? (
              <div className="space-y-3">
                {data.related.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                  >
                    <div>
                      <Badge variant="outline" className="font-mono text-sm">
                        {item.sku}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1 truncate max-w-[200px]">
                        {item.name}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No related items found
              </p>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Summary */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Total SKUs: {data.buywith.items.length + data.related.items.length}(
          {data.buywith.items.length} buy with, {data.related.items.length}{" "}
          related)
        </p>
      </div>
    </div>
  );
}
