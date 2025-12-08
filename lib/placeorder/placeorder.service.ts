import { apiClient } from "@/lib/apiClient";
import type { PlaceOrderRequest } from "@/types/index";
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const BASEURL = process.env.NEXT_PUBLIC_API_URL;
export const placeOrder = async (body: PlaceOrderRequest): Promise<void> => {

    if (!TOKEN || !BASEURL) {
        throw new Error("User not authenticated");
    }
    console.log("update addressId", body)
    return apiClient<void>(`${BASEURL}/placeorder`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(body),
    });
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getGuestCheckoutData = async (quoteId: string): Promise<any> => {
    if (!TOKEN || !BASEURL) {
        throw new Error("User not authenticated");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return apiClient<any>(`${BASEURL}/checkout-delivery/${quoteId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        },
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getLoggedInCheckoutData = async (userId: string): Promise<any> => {
    if (!TOKEN || !BASEURL) {
        return { error: "User not authenticated", message: "something went wrong please refresh the page or contact support" }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return apiClient<any>(`${BASEURL}/checkout-delivery/customerid/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        },
    });
};