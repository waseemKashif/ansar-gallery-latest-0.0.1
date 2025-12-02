// Cart API service - pure functions (no React hooks)

import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/useCartStore";
import { CatalogProduct, CartItem, CartItemType, CartApiResponse, GuestCartApiResponse } from "@/types";
import { removeAllItemsFromCart } from "./guestCart";

const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const BASE_URL = "https://www.ansargallery.com/en/rest";
const ZONE_NUMBER = "42";

// ============================================
// Guest Token Management (Singleton Pattern)
// ============================================

let guestTokenPromise: Promise<string> | null = null;

/**
 * Get or create a guest token
 * Ensures only one token creation request happens at a time
 */
export const getOrCreateGuestToken = async (): Promise<string> => {
    const { guestToken, setGuestToken } = useAuthStore.getState();

    // Return existing token if available
    if (guestToken) return guestToken;

    // Return in-flight request if one exists (prevents duplicate requests)
    if (guestTokenPromise) return guestTokenPromise;

    guestTokenPromise = (async () => {
        try {
            const response = await apiClient<GuestCartApiResponse>(
                `${BASE_URL}/V1/guest-carts`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${TOKEN}`,
                    },
                }
            );

            const newGuestToken =
                response.id || (typeof response === "string" ? response : null);

            if (!newGuestToken) {
                throw new Error("No guest token received from API");
            }

            setGuestToken(newGuestToken);
            return newGuestToken;
        } catch (error) {
            console.error("Error creating guest token:", error);
            throw error;
        } finally {
            guestTokenPromise = null;
        }
    })();

    return guestTokenPromise;
};

/**
 * Get guest cart data including the cart ID
 */
export const getGuestCartData = async (
    guestToken: string
): Promise<GuestCartApiResponse> => {
    return apiClient<GuestCartApiResponse>(
        `${BASE_URL}/V1/guest-carts/${guestToken}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`,
            },
        }
    );
};

// ============================================
// Bulk Cart API Calls
// ============================================

/**
 * Call bulk API to sync cart items
 * Works for both guest and customer users
 */
export const callBulkCartApi = async (
    products: { sku: string; qty: number }[],
    userValue: string,
    isCustomer: boolean
): Promise<CartApiResponse> => {
    return apiClient<CartApiResponse>(`${BASE_URL}/V2/carts/items/bulk`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
            fmc_Token: "",
            isTestCase: true,
            products,
            userStatus: {
                isCustomer,
                value: userValue,
            },
            zoneNumber: ZONE_NUMBER,
        }),
    });
};

// ============================================
// Cart Operations
// ============================================

/**
 * Fetch and sync cart for guest users
 */
export const fetchGuestCart = async (
    localProducts: { sku: string; qty: number }[]
): Promise<CartApiResponse> => {
    const guestToken = await getOrCreateGuestToken();
    const guestData = await getGuestCartData(guestToken);
    return callBulkCartApi(localProducts, guestData.id, false);
};

/**
 * Fetch and sync cart for logged-in users
 */
export const fetchCustomerCart = async (
    localProducts: { sku: string; qty: number }[],
    userId: string
): Promise<CartApiResponse> => {
    return callBulkCartApi(localProducts, userId, true);
};

/**
 * Update guest cart with current items
 */
export const updateGuestCart = async (
    products: { sku: string; qty: number }[]
): Promise<CartApiResponse> => {
    const guestToken = await getOrCreateGuestToken();
    const guestData = await getGuestCartData(guestToken);
    return callBulkCartApi(products, guestData.id, false);
};

/**
 * Update customer cart with current items
 */
export const updateCustomerCart = async (
    products: { sku: string; qty: number }[],
    userId: string
): Promise<CartApiResponse> => {
    return callBulkCartApi(products, userId, true);
};

// ============================================
// Data Transformation Helpers
// ============================================

/**
 * Transform API cart items to local cart format
 */
export const transformApiItemsToLocal = (apiItems: CartItem[]): CartItemType[] => {
    const itemMap = new Map<string, CartItemType>();

    apiItems.forEach((item) => {
        const sku = item.sku;

        if (itemMap.has(sku)) {
            console.warn("Duplicate SKU found in cart:", sku);
            return;
        }

        itemMap.set(sku, {
            product: {
                id: item.item_id,
                sku: item.sku,
                name: item.name,
                price: parseFloat(item.price),
                image: item.image,
                special_price: item.sales_price ? parseFloat(item.sales_price) : null,
                type_id: item.product_type,
                weight: item.weight,
                uom: item.uom,
                min_qty: item.min_qty,
                max_qty: item.max_qty,
                qty: item.available_qty,
                is_saleable: true,
                is_sold_out: false,
                manufacturer: "",
                left_qty: item.available_qty,
                is_configurable: false,
                percentage: null,
                configurable_data: [],
                thumbnail: item.image,
            } as CatalogProduct,
            quantity: item.qty,
        });
    });

    return Array.from(itemMap.values());
};

/**
 * Transform local cart items to API format
 */
export const transformLocalItemsToApi = (
    items: CartItemType[]
): { sku: string; qty: number }[] => {
    return items.map((item) => ({
        sku: item.product.sku,
        qty: item.quantity,
    }));
};

export const getItemsIdsFromCart = () => {
    const { items } = useCartStore.getState();
    return items.map((item) => item.product.id);
}
export const removeSingleItemFromCart = async (itemID: string) => {
    const { userId } = useAuthStore.getState();
    if (userId) {
        return removeAllItemsFromCart(userId, [itemID]);
    } else {
        const guestCartId = useAuthStore.getState().guestId;
        return removeAllItemsFromCart(guestCartId, [itemID]);
    }
}
export const clearServerSideCart = async () => {
    // I want to sent user id if user is logged in else sent guest id
    const { userId } = useAuthStore.getState();
    if (userId) {
        return removeAllItemsFromCart(userId, getItemsIdsFromCart());
    } else {
        const guestCartId = useAuthStore.getState().guestId;
        return removeAllItemsFromCart(guestCartId, getItemsIdsFromCart());
    }
};