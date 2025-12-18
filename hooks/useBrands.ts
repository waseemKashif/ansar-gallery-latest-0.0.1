import { useQuery } from "@tanstack/react-query";
import { fetchBrands } from "@/lib/api";
import { BrandsResponse } from "@/types";

export const useBrands = (zone?: string | null) => {
  return useQuery<BrandsResponse>({
    queryKey: ["brands", zone],
    queryFn: () => fetchBrands(zone),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

