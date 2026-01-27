// usePlaceOrder.ts
import { useMutation } from "@tanstack/react-query";
import {
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

