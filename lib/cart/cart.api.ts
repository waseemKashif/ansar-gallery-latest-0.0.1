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
    removeSingleItemFromCart,
    removeAllItemsFromCart
} from './cart.service';

/**
 * Update cart hook - handles both guest and logged-in users
 */
export const useUpdateCart = () => {
    const { setItems } = useCartStore();

    const { mutateAsync, isPending, isError, error } = useMutation({
        mutationFn: async (itemsOverride?: any[]) => {
            let products;

            if (itemsOverride) {
                products = itemsOverride;
            } else {
                // Use getState() to ensure we get the absolute latest items even if a re-render hasn't propagated
                const currentItems = useCartStore.getState().items;
                products = transformLocalItemsToApi(currentItems);
            }

            // Get fresh userId from store directly to support immediate calls after login
            const currentUserId = useAuthStore.getState().userId;

            if (currentUserId) {
                // Logged-in user: use userId
                return updateCustomerCart(products, currentUserId);
            } else {
                // Guest user: use guest cart API
                return updateGuestCart(products);
            }
        },
        onSuccess: (data) => {
            const { setExpressErrorItems, openExpressErrorSheet, closeExpressErrorSheet } = useCartStore.getState();

            // Handle Express Error Response (success: false)
            if (data && data.success === false && data.items) {
                const expressErrorItemsList = data.items.filter(item => item.error === "Express");

                if (expressErrorItemsList.length > 0) {
                    const localErrorItems = transformApiItemsToLocal(expressErrorItemsList);

                    setExpressErrorItems(localErrorItems);
                    openExpressErrorSheet();
                } else {
                    // Success false but no express errors? (maybe other errors)
                    // For now, assume if no express errors, we clear that specific state
                    setExpressErrorItems([]);
                    closeExpressErrorSheet();
                }
            } else {
                // Success is true (or at least not strictly false with express items)
                // Clear any previous express errors as the cart is now valid for this zone
                setExpressErrorItems([]);
                closeExpressErrorSheet();
            }

            // Always sync items if present, so cart reflects server state
            if (data && data.items) {
                const transformItems = transformApiItemsToLocal(data.items);
                setItems(transformItems);
            }
        }
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

export const useRemoveItemsFromCart = () => {
    const { userId, guestId } = useAuthStore();

    // We need to pass the ID to removeAllItemsFromCart
    // If logged in, pass userId. If guest, pass guestId.
    const cartId = userId || guestId;

    const mutation = useMutation({
        mutationFn: async (itemIds: (string | number)[]) => {
            return removeAllItemsFromCart(cartId, itemIds);
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
            // Prepare local items for sync using getState to ensure freshness
            const currentItems = useCartStore.getState().items;
            const localProducts = transformLocalItemsToApi(currentItems);
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
    }, [userId, setItems]);

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
        await syncCart([]);
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