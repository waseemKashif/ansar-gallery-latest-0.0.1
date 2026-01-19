import { useMutation } from "@tanstack/react-query";
import { createCheckoutSession } from "./placeorder.service";

export const useCreateCheckoutSession = () => {
    const mutation = useMutation({
        mutationFn: async ({ orderId, amount }: { orderId: number; amount: number }) => {
            return createCheckoutSession(orderId, amount);
        },
    });
    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
    };
};
