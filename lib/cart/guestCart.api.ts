import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/auth.store";
import { CartItemType, CatalogProduct } from "@/types";

export interface CartItem {
    item_id: string;
    sku: string;
    quote_id: string;
    name: string;
    product_type: string;
    weight: string;
    uom: string;
    qty: number;
    min_qty: number;
    max_qty: number;
    available_qty: number;
    price: string;
    image?: string;
    sales_price?: string | null;
    special_price?: string | null;
    extension_attributes?: any;
    toDate?: string | null;
    fromDate?: string | null;
    currentDate?: string;
    error?: string | null;
}

export interface CartApiResponse {
    success: boolean;
    message: string;
    quote_id: string;
    items: CartItem[];
}

export interface GuestCartApiResponse {
    success: boolean;
    message: string;
    id: string;
    items?: CartItem[];
    quote_id?: string;
    created_at?: string;
    updated_at?: string;
    is_active?: boolean;
    is_virtual?: boolean;
}

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
 * Helper to update local cart from API items
 */
export const updateLocalCart = (apiItems: CartItem[], setItems: (items: CartItemType[]) => void) => {
    const itemMap = new Map<string, CartItemType>();

    apiItems.forEach((item) => {
        const sku = item.sku;

        if (itemMap.has(sku)) {
            // Merge quantities if duplicate SKUs exist
            console.log("Duplicate SKU found:", sku);
            return;
            // const existingItem = itemMap.get(sku)!;
            // existingItem.quantity += item.qty;
        } else {
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
        }
    });

    const deduplicatedItems = Array.from(itemMap.values());
    setItems(deduplicatedItems);
};

/**
 * Fetch and sync cart for guest users
 */
export const fetchGuestCart = async (
    localProducts: { sku: string; qty: number }[],
    setItems: (items: CartItemType[]) => void
): Promise<CartItem[]> => {
    try {
        // Step 1: Get guest token
        const guestToken = await getGuestToken();

        // Step 2: Get guest data to retrieve cart ID
        const guestData = await getGuestData(guestToken);
        const guestCartId = guestData.id;

        // Step 3: Call bulk API with local products (or empty array if none)
        // This syncs local items to server and fetches current state in one call
        const response = await callGuestBulkApi(localProducts, guestCartId);

        // Step 4: Update local cart with server data
        if (response.items && response.items.length > 0) {
            updateLocalCart(response.items, setItems);
            return response.items;
        } else {
            // Server returned empty, clear local cart
            setItems([]);
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