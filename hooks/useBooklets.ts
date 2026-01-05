import { useQuery } from "@tanstack/react-query";
import { fetchBooklets } from "@/lib/api";
import { BookletsResponse } from "@/types/index";
import { useLocale } from "@/hooks/useLocale";

export const useBooklets = () => {
    const { locale } = useLocale();
    return useQuery<BookletsResponse>({
        queryKey: ["booklets", locale],
        queryFn: () => fetchBooklets(locale),
        staleTime: 1000 * 60 * 60,
    });
};