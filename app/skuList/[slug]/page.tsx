"use client";

import Link from "next/link";
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

function makeSlug(name: string, sku: string) {
  return `${name.toLowerCase().replace(/[\s/]+/g, "-")}-${sku}`;
}

export default function SkuListPage({ params, locale }: { params: { slug: string }, locale: string }) {
  const slug = params.slug;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["product-recommendations", slug, locale],
    queryFn: ({ queryKey }) => {
      const [, slug] = queryKey;
      return fetchProductRecommendations(slug.toString(), locale);
    },
    retry: 2,
  });
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;
  if (!data) return <p>No data available</p>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Product SKU List</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Buy With Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <CardTitle>Buy With Items</CardTitle>
            </div>
            <CardDescription>
              Products recommended to buy together
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.buywith.items.length > 0 ? (
              <div className="space-y-3">
                {data.buywith.items.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/sku/${makeSlug(item.name, item.sku)}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100">
                      <div>
                        <Badge variant="outline" className="font-mono text-sm">
                          {item.sku}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1 truncate max-w-[200px]">
                          {item.name}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        #{index + 1}
                      </span>
                    </div>
                  </Link>
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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              <CardTitle>Related Items</CardTitle>
            </div>
            <CardDescription>
              Products related to your selection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.related.items.length > 0 ? (
              <div className="space-y-3">
                {data.related.items.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/sku/${makeSlug(item.name, item.sku)}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100">
                      <div>
                        <Badge variant="outline" className="font-mono text-sm">
                          {item.sku}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1 truncate max-w-[200px]">
                          {item.name}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        #{index + 1}
                      </span>
                    </div>
                  </Link>
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
    </div>
  );
}
