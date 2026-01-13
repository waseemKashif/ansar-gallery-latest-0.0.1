import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CatalogProduct, CheckoutData } from "@/types";
import { CartItemType } from "@/types";
import { useUIStore } from "./useUIStore";
import { UserAddress, MapLocation } from "@/lib/user/user.types";

export interface LastOrderData {
  checkoutData: CheckoutData;
  address: UserAddress;
  location: MapLocation;
  paymentMethod: string;
  orderId?: string;
}

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
  expressErrorItems: CartItemType[];
  isExpressErrorSheetOpen: boolean;
  setExpressErrorItems: (items: CartItemType[]) => void;
  openExpressErrorSheet: () => void;
  closeExpressErrorSheet: () => void;
  lastOrderId: string | null;
  setLastOrderId: (id: string | null) => void;
  lastOrderData: LastOrderData | null;
  setLastOrderData: (data: LastOrderData | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // ... (existing addToCart) ...
      addToCart: (product, quantity = 1) => {
        if (typeof window !== "undefined" && window.innerWidth >= 1024) {
          useUIStore.getState().setCartOpen(true);
        }
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
      // ... (rest of store) ...
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

      // Express Error Handling
      expressErrorItems: [],
      isExpressErrorSheetOpen: false,
      setExpressErrorItems: (items) => set({ expressErrorItems: items }),
      openExpressErrorSheet: () => set({ isExpressErrorSheetOpen: true }),
      closeExpressErrorSheet: () => set({ isExpressErrorSheetOpen: false }),

      // Last Order Handling
      lastOrderId: null,
      setLastOrderId: (id) => set({ lastOrderId: id }),
      lastOrderData: null,
      setLastOrderData: (data) => set({ lastOrderData: data }),
    }),
    {
      name: "cart-store", // persists in localStorage
      partialize: (state) => ({
        items: state.items,
        expressErrorItems: state.expressErrorItems,
        lastOrderId: state.lastOrderId,
        lastOrderId: state.lastOrderId,
      }),
    }
  )
);
