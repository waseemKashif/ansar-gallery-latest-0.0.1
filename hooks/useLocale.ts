"use client";

// hooks/useLocale.ts

import { useParams } from "next/navigation";
import { type Locale, isRtlLocale } from "@/lib/i18n";

/**
 * Hook to get current locale in client components
 */
export const useLocale = () => {
    const params = useParams();
    const locale = (params?.lang as Locale) || "en";
    const isRtl = isRtlLocale(locale);
    const dir = isRtl ? "rtl" : "ltr";

    return {
        locale,
        isRtl,
        dir,
    };
};