"use client";

import { useEffect, useRef } from "react";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useZoneStore } from "@/store/useZoneStore";
import { useLocale } from "@/hooks/useLocale";

export const CategoryPrefetchProvider = () => {
    const { zone, isLoading: isZoneLoading } = useZoneStore();
    const { locale } = useLocale();
    const fetchCategories = useCategoryStore((state) => state.fetchCategories);

    // Use a ref to track if we've already triggered a fetch for the current combination
    // to avoid double triggering in strict mode or rapid updates, though the store handles valid cache.
    // Actually, the store's check is sufficient, so we can just call it safely.

    useEffect(() => {
        // Only attempt fetch if zone is loaded (or if we decide null zone is valid to fetch)
        // Assuming we want to wait for zone hydration (if persisted).
        if (!isZoneLoading) {
            fetchCategories(zone, locale);
        }
    }, [zone, locale, isZoneLoading, fetchCategories]);

    return null; // This component handles logic only, renders nothing
};
