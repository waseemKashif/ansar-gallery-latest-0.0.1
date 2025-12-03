// Cart React hooks

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/useCartStore";
import {
    fetchGuestCart,
    fetchCustomerCart,
    updateGuestCart,
    updateCustomerCart,
    transformApiItemsToLocal,
    transformLocalItemsToApi,
    clearServerSideCart,
    removeSingleItemFromCart,
} from "./cart.service";
import type { CartItem, CartItemType } from "@/types";

/**
 * Hook to update cart on server
 * Handles both guest and logged-in users
 */
export const useUpdateCart = () => {
    const { userId } = useAuthStore();
    const { items } = useCartStore();

    const mutation = useMutation({
        mutationFn: async () => {
            const products = transformLocalItemsToApi(items);

            if (userId) {
                return updateCustomerCart(products, userId);
            } else {
                return updateGuestCart(products);
            }
        },
    });

    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
    };
};

export const useRemoveAllItemsFromCart = () => {
    const mutation = useMutation({
        mutationFn: async () => {
            return clearServerSideCart();
        },
    });
    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
    };
};

// remove single item from server 

// Change the hook to accept itemID in mutateAsync, not in the hook itself
export const useRemoveSingleItemFromCart = () => {
    const mutation = useMutation({
        mutationFn: async (itemID: string) => {  // itemID passed here
            return removeSingleItemFromCart(itemID);
        },
    });
    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
    };
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

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const localProducts = transformLocalItemsToApi(items);
            let response;

            if (userId) {
                response = await fetchCustomerCart(localProducts, userId);
            } else {
                response = await fetchGuestCart(localProducts);
            }

            // Update local store with server data
            if (response.items && response.items.length > 0) {
                const transformedItems = transformApiItemsToLocal(response.items);
                setItems(transformedItems);
                setCartItems(response.items);
            } else {
                setItems([]);
                setCartItems([]);
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "An unexpected error occurred";
            console.error("Error fetching cart:", err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [userId, setItems]);

    // Fetch cart on mount and when userId or totalItems changes
    useEffect(() => {
        fetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, setItems]);

    return {
        cartItems,
        loading,
        error,
        totalItems,
        refetch: fetchCart,
    };
};

/**
 * Hook for cart operations with automatic server sync
 */
export const useCartActions = () => {
    const { addToCart, removeFromCart, removeSingleCount, clearCart, updateQuantity } =
        useCartStore();
    const { mutateAsync: syncCart, isPending: isSyncing } = useUpdateCart();

    const addItem = useCallback(
        async (product: CartItemType["product"], quantity = 1) => {
            addToCart(product, quantity);
            // Optionally sync immediately (uncomment if needed)
            // await syncCart();
        },
        [addToCart]
    );

    const removeItem = useCallback(
        async (sku: string) => {
            removeFromCart(sku);
        },
        [removeFromCart]
    );

    const decrementItem = useCallback(
        async (sku: string) => {
            removeSingleCount(sku);
        },
        [removeSingleCount]
    );

    const updateItemQuantity = useCallback(
        async (sku: string, quantity: number) => {
            updateQuantity(sku, quantity);
        },
        [updateQuantity]
    );

    const clearAllItems = useCallback(async () => {
        clearCart();
        await syncCart();
    }, [clearCart, syncCart]);

    return {
        addItem,
        removeItem,
        decrementItem,
        updateItemQuantity,
        clearAllItems,
        syncCart,
        isSyncing,
    };
};