import { useQuery } from "@tanstack/react-query";
import { getSingleOrder } from "@/lib/user/user.service";
import { SingleOrderResponse } from "@/lib/user/user.types";

export const useOrderDetails = (userId?: string, orderId?: string | null, locale: string = "en") => {
    return useQuery<SingleOrderResponse, Error>({
        queryKey: ["singleOrder", userId, orderId, locale],
        queryFn: () => {
            if (!userId || !orderId) {
                throw new Error("Missing required parameters");
            }
            return getSingleOrder(userId, orderId, locale);
        },
        enabled: !!userId && !!orderId,
        retry: 1,
    });
};
