import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function ProductCardSkeleton() {
  return (
    <Card className="w-full max-w-md gap-y-1 pb-1.5 pt-0">
      {/* Image placeholder */}
      <CardHeader className="p-2 items-center relative overflow-hidden">
        <div className="w-full  bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md h-56" />
        {/* <div className="absolute bottom-2 right-2 w-20  bg-gray-300 dark:bg-gray-600 animate-pulse rounded-md h-60" /> */}
      </CardHeader>

      <CardContent className="p-1 md:p-4 space-y-3">
        {/* Brand / tag */}
        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />

        {/* Product name */}
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-x-2">
          <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          <div className="w-12 h-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        </div>

        {/* Delivery info */}
        <div className="flex items-center gap-x-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
          <div className="w-28 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
