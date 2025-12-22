import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/useCartStore";
import { CartItem, CartItemType } from "@/types";
import { useMutation } from '@tanstack/react-query';
import { getUserId } from "@/lib/auth/auth.utils";
import {
    fetchGuestCart,
    fetchCustomerCart,
    updateGuestCart,
    updateCustomerCart,
    transformLocalItemsToApi,
    transformApiItemsToLocal,
    clearServerSideCart,
    removeSingleItemFromCart
} from './cart.service';

/**
 * Update cart hook - handles both guest and logged-in users
 */
export const useUpdateCart = () => {
    const { userId } = useAuthStore();
    const { items } = useCartStore();

    const { mutateAsync, isPending, isError, error } = useMutation({
        mutationFn: async () => {
            const products = transformLocalItemsToApi(items);

            if (userId) {
                // Logged-in user: use userId
                return updateCustomerCart(products, userId);
            } else {
                // Guest user: use guest cart API
                return updateGuestCart(products);
            }
        },
    });

    return { mutateAsync, isPending, isError, error };
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

export const useRemoveSingleItemFromCart = () => {
    const mutation = useMutation({
        mutationFn: async (itemID: string) => {
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
    const [loading, setLoading] = useState<boolean>(true); // Start loading true
    const [error, setError] = useState<string | null>(null);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Prepare local items for sync
            const localProducts = transformLocalItemsToApi(items);
            let fetchedItems: CartItem[] = [];

            // CRITICAL CHECK:
            // If we have a userId in store, we are definitely logged in -> Fetch Customer Cart
            // If we DON'T have a userId in store, but we HAVE one in localStorage -> Wait (Auth Hydration pending)
            // If we DON'T have distinct userId anywhere -> Guest Mode

            const storageUserId = getUserId();

            if (userId) {
                // 1. Fully Authenticated
                // console.log("Fetching Customer Cart (Authenticated)");
                const response = await fetchCustomerCart(localProducts, userId);
                fetchedItems = response.items || [];
            } else if (!userId && storageUserId) {
                // 2. Hydration Pending (Auth exists in storage but not yet in store)
                // Do NOT fetch guest cart here. Just return or wait.
                // console.log("Waiting for Auth Hydration...");
                setLoading(true); // Keep loading
                return;
            } else {
                // 3. Guest User (No auth in store OR storage)
                // console.log("Fetching Guest Cart");
                const response = await fetchGuestCart(localProducts);
                fetchedItems = response.items || [];
            }

            // If we reached here, we have a valid response (or empty array)
            if (fetchedItems.length > 0) {
                const transformItems = transformApiItemsToLocal(fetchedItems);
                setItems(transformItems);
                setCartItems(fetchedItems);
            } else {
                setItems([]);
                setCartItems([]);
            }

        } catch (err: any) {
            console.error("Error fetching cart:", err);
            setError(err.message || "An unexpected error occurred while fetching cart.");
        } finally {
            setLoading(false);
        }
    }, [userId, setItems, items]);

    useEffect(() => {
        fetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, setItems]);
    // removed 'items' from dependency array to prevent infinite loops if fetch updates items
    // But 'fetchCart' depends on 'items' for local sync.
    // Ideally, we only want to sync on Mount or User Change, NOT on every item change unless specifically requested.
    // The previous implementation had basic useEffect on userId.

    return { cartItems, loading, error, totalItems, refetch: fetchCart };
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