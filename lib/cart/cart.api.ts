import { useState, useEffect } from 'react';
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/useCartStore";
import { CartItemType } from "@/types";
import { useMutation } from '@tanstack/react-query';
import {
    fetchGuestCart,
    updateGuestCart,
    updateLocalCart,
    CartItem,
    CartApiResponse
} from './guestCart.api';

const token = process.env.NEXT_PUBLIC_API_TOKEN;
const BASE_URL = "https://www.ansargallery.com/en/rest";

/**
 * Call bulk API with products for logged-in user
 */
const callCustomerBulkApi = async (
    products: { sku: string; qty: number }[],
    userId: string
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
                    isCustomer: true,
                    value: userId,
                },
                zoneNumber: "42",
            }),
        }
    );
};

/**
 * Fetch and sync cart for logged-in users
 */
const fetchCustomerCart = async (
    userId: string,
    localProducts: { sku: string; qty: number }[],
    setItems: (items: CartItemType[]) => void
): Promise<CartItem[]> => {
    try {
        // Sync local products and fetch current state in one call
        const response = await callCustomerBulkApi(localProducts, userId);

        if (response.items && response.items.length > 0) {
            updateLocalCart(response.items, setItems);
            return response.items;
        } else {
            // Server returned empty cart
            setItems([]);
            return [];
        }
    } catch (error) {
        console.error("Error in fetchCustomerCart:", error);
        throw error;
    }
};

/**
 * Update cart hook - handles both guest and logged-in users
 */
export const useUpdateCart = () => {
    const { userId } = useAuthStore();
    const { items } = useCartStore();

    const { mutateAsync, isPending, isError, error } = useMutation({
        mutationFn: async () => {
            const products = items.map(item => ({
                sku: item.product.sku,
                qty: item.quantity
            }));

            if (userId) {
                // Logged-in user: use userId
                return callCustomerBulkApi(products, userId);
            } else {
                // Guest user: use guest cart API
                return updateGuestCart(products);
            }
        },
    });

    return { mutateAsync, isPending, isError, error };
};

/**
 * Main hook to fetch and manage cart products
 * Automatically handles both guest and logged-in users
 */
export const useCartProducts = () => {
    const { userId } = useAuthStore();
    const { setItems, items, totalItems } = useCartStore();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCart = async () => {
            setLoading(true);
            setError(null);

            try {
                // Prepare local items for sync
                const localProducts = items.map(item => ({
                    sku: item.product.sku,
                    qty: item.quantity
                }));

                let fetchedItems: CartItem[];

                if (userId) {
                    // Logged-in user flow
                    fetchedItems = await fetchCustomerCart(userId, localProducts, setItems);
                } else {
                    // Guest user flow
                    fetchedItems = await fetchGuestCart(localProducts, setItems);
                }

                setCartItems(fetchedItems);
            } catch (err: any) {
                console.error("Error fetching cart:", err);
                setError(err.message || "An unexpected error occurred while fetching cart.");
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, totalItems]);

    return { cartItems, loading, error, totalItems };
};

// Re-export types for convenience
export type { CartItem, CartApiResponse } from './guestCart.api';