import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/useCartStore";
import { CartItemType, CatalogProduct, CartItem, CartApiResponse, GuestCartApiResponse } from "@/types";
import { isAuthenticated } from "../auth/auth.utils";

const token = process.env.NEXT_PUBLIC_API_TOKEN;
const BASE_URL = "https://www.ansargallery.com/en/rest";

// Singleton promise to prevent multiple simultaneous guest token requests
let guestTokenPromise: Promise<string> | null = null;

/**
 * Get or create a guest token
 * This function ensures only one token creation request happens at a time
 */
export const getGuestToken = async (): Promise<string> => {
    const { guestToken, setGuestToken } = useAuthStore.getState();

    // Return existing token if available
    if (guestToken) return guestToken;

    // Return in-flight request if one exists
    if (guestTokenPromise) return guestTokenPromise;

    guestTokenPromise = (async () => {
        try {
            const response = await apiClient<GuestCartApiResponse>(
                `${BASE_URL}/V1/guest-carts`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const newGuestToken = response.id || (typeof response === 'string' ? response : null);

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
export const getGuestData = async (guestToken: string): Promise<GuestCartApiResponse> => {
    try {
        const response = await apiClient<GuestCartApiResponse>(
            `${BASE_URL}/V1/guest-carts/${guestToken}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (!response) {
            throw new Error("No guest data received from API");
        }
        setGuestProfile(response);
        return response;
    } catch (error) {
        console.error("Error getting guest data:", error);
        throw error;
    }
};

/**
 * Call bulk API with products for guest user
 */
export const callGuestBulkApi = async (
    products: { sku: string; qty: number }[],
    guestCartId: string
): Promise<CartApiResponse> => {
    return apiClient<CartApiResponse>(
        `${BASE_URL}/V2/carts/items/bulk`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                fmc_Token: "",
                isTestCase: true,
                products: products,
                userStatus: {
                    isCustomer: false,
                    value: guestCartId,
                },
                zoneNumber: "42",
            }),
        }
    );
};

/**
 * Remove all items from cart
 */
export const removeAllItemsFromCart = async (id?: string | null, productIds?: (string | number)[]): Promise<void> => {
    let isCustomer = false;
    if (isAuthenticated()) {
        isCustomer = true;
    }
    try {
        await apiClient<void>(
            `${BASE_URL}/V1/carts/items/bulk-delete`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    cartId: id,
                    is_customer: isCustomer,
                    itemIds: productIds
                }),
            }
        );
    } catch (error) {
        console.error("Error removing all items from cart:", error);
        throw error;
    }
};

/**
 * Helper to update local cart from API items
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

/**
 * Fetch and sync cart for guest users
 */
export const fetchGuestCart = async (
    localProducts: { sku: string; qty: number }[],
    setItems: (items: CartItemType[]) => void
): Promise<CartItem[]> => {
    const currentItems = useCartStore.getState().items;
    try {
        // Step 1: Get guest token
        const guestToken = await getGuestToken();

        // Step 2: Get guest data to retrieve cart ID
        const guestData = await getGuestData(guestToken);
        const guestCartId = guestData.id;

        // Step 3: Call bulk API with local products (or empty array if none)
        // This syncs local items to server and fetches current state in one call
        const response = await callGuestBulkApi(localProducts, guestCartId);
        useAuthStore.getState().setGuestId(guestCartId);
        // Step 4: Update local cart with server data
        if (response.items && response.items.length > 0) {
            updateLocalCart(response.items, setItems, currentItems);
            return response.items;
        } else {
            // Server returned empty, clear local cart
            // setItems([]);
            return [];
        }
    } catch (error) {
        console.error("Error in fetchGuestCart:", error);
        throw error;
    }
};

/**
 * Update guest cart with current items
 */
export const updateGuestCart = async (
    products: { sku: string; qty: number }[]
): Promise<CartApiResponse> => {
    const guestToken = await getGuestToken();
    const guestData = await getGuestData(guestToken);
    const guestCartId = guestData.id;

    return callGuestBulkApi(products, guestCartId);
};

function setGuestProfile(response: GuestCartApiResponse) {
    useAuthStore.getState().setGuestProfile(response);
}

