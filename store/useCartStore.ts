import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.product.sku === product.sku);

        if (existing) {
          set({
            items: items.map((i) =>
              i.product.sku === product.sku
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, quantity }] });
        }
      },

      removeFromCart: (sku) =>
        set({
          items: get().items.filter((i) => i.product.sku !== sku),
        }),

      updateQuantity: (sku, quantity) =>
        set({
          items: get().items.map((i) =>
            i.product.sku === sku ? { ...i, quantity } : i
          ),
        }),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + i.quantity * (Number(i.product.price) || 0),
          0
        ),
    }),
    {
      name: "cart-store", // persists in localStorage
    }
  )
);
