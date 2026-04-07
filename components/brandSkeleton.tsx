"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function BrandPageSkeleton() {
    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Banner */}
            <div className="relative w-full h-[160px] sm:h-[200px] lg:h-[220px] rounded-xl overflow-hidden">
                <Skeleton className="h-full w-full" />
                {/* Brand logo */}
                <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2">
                    <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-full" />
                </div>
            </div>

            {/* Brand title */}
            <Skeleton className="h-7 sm:h-8 w-28 sm:w-32" />

            {/* Description */}
            <div className="space-y-2 max-w-4xl">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12 sm:w-5/6" />
                <Skeleton className="h-4 w-9/12 sm:w-4/6" />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-full sm:w-40 rounded-md" />
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="border rounded-xl p-3 space-y-3"
                    >
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-3/6" />
                        <div className="flex items-center justify-between pt-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-8 w-14 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
