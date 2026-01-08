import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CatalogProduct } from "@/types";
import { CartItemType } from "@/types";

interface CartState {
  items: CartItemType[];
  addToCart: (product: CatalogProduct, quantity?: number) => void;
  removeFromCart: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  subTotal: () => number;
  removeSingleCount: (sku: string) => void;
  setItems: (items: CartItemType[]) => void;
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
      removeSingleCount: (sku) => {
        const items = get().items;
        const existing = items.find((i) => i.product.sku === sku);
        if (existing && existing.quantity > 1) {
          set({
            items: items.map((i) =>
              i.product.sku === sku ? { ...i, quantity: i.quantity - 1 } : i
            ),
          });
        } else if (existing && existing.quantity === 1) {
          set({
            items: items.filter((i) => i.product.sku !== sku),
          });
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
          (sum, i) => sum + i.quantity * (Number(i.product?.special_price || i.product?.price) || 0),
          0
        ),

      subTotal: () =>
        get().items.reduce(
          (sum, i) => sum + i.quantity * (Number(i.product?.price) || 0),
          0
        ),
      setItems: (incomingItems) => {
        // Strictly use server response to ensure correct item_ids and no ghost items
        set({ items: incomingItems });
      },
    }),
    {
      name: "cart-store", // persists in localStorage
    }
  )
);
