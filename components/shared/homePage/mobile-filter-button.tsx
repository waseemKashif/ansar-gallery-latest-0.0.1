"use client";

import { FunnelPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useUIStore } from "@/store/useUIStore";

export default function MobileFilterButton() {
    const searchParams = useSearchParams();
    const headerFilterButtonVisible = useUIStore((state) => state.headerFilterButtonVisible);

    const filterCount = useMemo(() => {
        let count = 0;
        searchParams.forEach((value, key) => {
            // Exclude pagination, sort, limit, query, and locale related params if any
            if (['p', 'limit', 'page', 'sort', 'q', 'lang', 'categoryId'].includes(key)) return;

            if (key === 'price') {
                count += 1;
            } else {
                // Assume comma separated values count as multiple filters
                count += value.split(',').filter(Boolean).length;
            }
        });
        return count;
    }, [searchParams]);

    if (!headerFilterButtonVisible) {
        return null;
    }

    return (
        <button
            className="block lg:hidden w-fit px-2 relative"
            aria-label="filters"
            onClick={() => useUIStore.getState().setFilterOpen(true)}
        >
            <FunnelPlus className="h-6 w-6" />
            {filterCount > 0 && (
                <span className="absolute top-[10px] right-[-1px] w-5 h-5 bg-green-600 rounded-full z-10 text-white text-xs font-semibold flex items-center justify-center">
                    {filterCount}
                </span>
            )}
        </button>
    );
}
