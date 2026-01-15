// Cart API service - pure functions (no React hooks)

import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/useCartStore";
import { CatalogProduct, CartItem, CartItemType, CartApiResponse, GuestCartApiResponse } from "@/types";
import { useZoneStore } from "@/store/useZoneStore";
import { extractZoneNo } from "@/utils/extractZoneNo";
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const BASE_URL = "https://www.ansargallery.com/en/rest";
// get current zone number from local storage
// const { zone } = useZoneStore.getState();
// const ZONE_NUMBER = extractZoneNo(zone as string);

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
    isCustomer: boolean,
    deleteIds?: (string | number)[]
): Promise<CartApiResponse> => {
    const { zone } = useZoneStore.getState();
    const zoneNumber = Number(extractZoneNo(zone as string));

    return apiClient<CartApiResponse>(`${BASE_URL}/V3/carts/items/bulk`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
            fmc_Token: "",
            isTestCase: true,
            products,
            ...(deleteIds && deleteIds.length > 0 && { delete: deleteIds }),
            userStatus: {
                isCustomer,
                value: userValue,
            },
            zoneNumber: zoneNumber,
            "web_view": true
        }),
    });
};

// ============================================
// Cart Operations
// ============================================

/**
 * Fetch and sync cart for guest users
 */
/**
 * Fetch and sync cart for guest users
 */
export const fetchGuestCart = async (
    localProducts: { sku: string; qty: number }[],
    deleteIds?: (string | number)[]
): Promise<CartApiResponse> => {
    const guestToken = await getOrCreateGuestToken();
    const guestData = await getGuestCartData(guestToken);
    useAuthStore.getState().setGuestId(guestData.id);
    return callBulkCartApi(localProducts, guestData.id, false, deleteIds);
};

/**
 * Fetch and sync cart for logged-in users
 */
export const fetchCustomerCart = async (
    localProducts: { sku: string; qty: number }[],
    userId: string,
    deleteIds?: (string | number)[]
): Promise<CartApiResponse> => {
    return callBulkCartApi(localProducts, userId, true, deleteIds);
};

/**
 * Update guest cart with current items
 */
/**
 * Update guest cart with current items
 */
export const updateGuestCart = async (
    products: { sku: string; qty: number }[],
    deleteIds?: (string | number)[]
): Promise<CartApiResponse> => {
    const guestToken = await getOrCreateGuestToken();
    const guestData = await getGuestCartData(guestToken);
    return callBulkCartApi(products, guestData.id, false, deleteIds);
};

/**
 * Update customer cart with current items
 */
export const updateCustomerCart = async (
    products: { sku: string; qty: number }[],
    userId: string,
    deleteIds?: (string | number)[]
): Promise<CartApiResponse> => {
    return callBulkCartApi(products, userId, true, deleteIds);
};

/**
 * Remove all items from cart (Bulk Delete)
 */
// DELETED removeAllItemsFromCart


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
                delivery_type: item.delivery_type,
            } as CatalogProduct,
            quantity: item.qty,
        });
    });

    return Array.from(itemMap.values()).sort((a, b) => {
        const idA = Number(a.product.id) || 0;
        const idB = Number(b.product.id) || 0;
        return idB - idA; // Sort descending (LIFO)
    });
};

/**
 * Transform local cart items to API format
 */
export const transformLocalItemsToApi = (
    items: CartItemType[]
): { sku: string; qty: number; is_configure?: boolean }[] => {
    return items.map((item) => ({
        sku: item.product.sku,
        qty: item.quantity,
        ...(item.product.is_configure && { is_configure: true }),
    }));
};

/**
 * Helper to update local cart from API items
 * Used to merge server response into local state
 */
export const updateLocalCart = (
    apiItems: CartItem[],
    setItems: (items: CartItemType[]) => void,
    currentLocalItems: CartItemType[] = []
) => {
    const itemMap = new Map<string, CartItemType>();

    // FIRST: Add all current local items
    currentLocalItems.forEach((item) => {
        itemMap.set(item.product.sku, { ...item });
    });

    // THEN: Add/UPDATE with API items (server wins, overwrites local)
    apiItems.forEach((item) => {
        const sku = item.sku;

        // Always set server item - overwrites local if exists
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

    const mergedItems = Array.from(itemMap.values());
    setItems(mergedItems);
};


export const getItemsIdsFromCart = () => {
    const { items } = useCartStore.getState();
    return items.map((item) => item.product.id);
}

// export const removeSingleItemFromCart = async (itemID: string) => {
//     const { userId } = useAuthStore.getState();
//     if (userId) {
//         return removeAllItemsFromCart(userId, [itemID]);
//     } else {
//         const guestCartId = useAuthStore.getState().guestId;
//         return removeAllItemsFromCart(guestCartId, [itemID]);
//     }
// }

// export const clearServerSideCart = async () => {
//     // I want to sent user id if user is logged in else sent guest id
//     const { userId } = useAuthStore.getState();
//     if (userId) {
//         return removeAllItemsFromCart(userId, getItemsIdsFromCart());
//     } else {
//         const guestCartId = useAuthStore.getState().guestId;
//         return removeAllItemsFromCart(guestCartId, getItemsIdsFromCart());
//     }
// };