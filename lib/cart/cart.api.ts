import { useState, useEffect } from 'react';
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/useCartStore";
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
    image: string;
    sales_price: string | null;
    special_price: string | null;
    extension_attributes: any;
    toDate: string | null;
    fromDate: string | null;
    currentDate: string;
    error: string | null;
}

export interface CartApiResponse {
    success: boolean;
    message: string;
    quote_id: string;
    items: CartItem[];
}
const token = process.env.NEXT_PUBLIC_API_TOKEN;
export const useCartProducts = () => {
    const { userId } = useAuthStore();
    const { setItems } = useCartStore();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCart = async () => {
            if (!userId) {
                console.log("user ud uis", userId)
                setCartItems([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await apiClient<CartApiResponse>(
                    "https://www.ansargallery.com/en/rest/V2/carts/items/bulk",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            fmc_Token: "",
                            isTestCase: true,
                            products: [],
                            userStatus: {
                                isCustomer: true,
                                value: userId,
                            },
                            zoneNumber: "42",
                        }),
                    }
                );

                if (response.items.length > 0) {
                    setCartItems(response.items);
                    const mappedItems: CartItemType[] = response.items.map((item) => ({
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
                    }));
                    setItems(mappedItems);
                } else {
                    setError(response.message || "Failed to fetch cart items.");
                    setCartItems([]);
                    setItems([]);
                }
            } catch (err: any) {
                console.error("Error fetching cart products:", err);
                setError(err.message || "An unexpected error occurred while fetching cart products.");
                setCartItems([]);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [userId, setItems]);

    return { cartItems, loading, error };
};
