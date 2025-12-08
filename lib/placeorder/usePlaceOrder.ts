// usePlaceOrder.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    getGuestCheckoutData,
    getLoggedInCheckoutData,
    placeOrder
} from "./placeorder.service";
import type { PlaceOrderRequest } from "@/types/index";

export const usePlaceOrder = () => {
    const mutation = useMutation({
        mutationFn: async (body: PlaceOrderRequest) => {
            return placeOrder(body);
        },
    });

    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
    };
};

// Add options parameter with enabled flag
// get guest checkout data
export const useGetGuestCheckoutData = (
    quoteId: string,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ["getGuestCheckoutData", quoteId],
        queryFn: () => getGuestCheckoutData(quoteId),
        enabled: options?.enabled ?? !!quoteId, // Default: enabled when quoteId exists
    });
};

// get logged in checkout data
export const useGetLoggedInCheckoutData = (
    userId: string,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ["getLoggedInCheckoutData", userId],
        queryFn: () => getLoggedInCheckoutData(userId),
        enabled: options?.enabled ?? !!userId, // Default: enabled when userId exists
    });
};