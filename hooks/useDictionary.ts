"use client";

// hooks/useDictionary.ts

import { useEffect, useState } from "react";
import { useLocale } from "./useLocale";
import { getDictionary, type Dictionary } from "@/lib/i18n";

/**
 * Hook to load dictionary in client components
 * Note: For server components, use getDictionary directly
 */
export const useDictionary = () => {
    const { locale } = useLocale();
    const [dictionary, setDictionary] = useState<Dictionary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getDictionary(locale)
            .then(setDictionary)
            .finally(() => setIsLoading(false));
    }, [locale]);

    return {
        dict: dictionary,
        isLoading,
        locale,
    };
};