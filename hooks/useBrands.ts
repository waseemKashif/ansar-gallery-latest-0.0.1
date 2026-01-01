import { useQuery } from "@tanstack/react-query";
import { fetchBrands } from "@/lib/api";
import { BrandsResponse } from "@/types";
import { useDictionary } from "./useDictionary";
export const useBrands = (zone?: string | null) => {
  const { locale } = useDictionary();
  return useQuery<BrandsResponse>({
    queryKey: ["brands", zone],
    queryFn: () => fetchBrands(zone, locale),
    staleTime: 1000 * 60 * 60,
  });
};

