import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CatalogProduct, CheckoutData, ProductDetailPageType } from "@/types";
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
  addToCart: (product: CatalogProduct, quantity?: number, options?: { openCart?: boolean }) => void;
  removeFromCart: (sku: string, options?: any[]) => void;
  updateQuantity: (sku: string, quantity: number, options?: any[]) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  subTotal: () => number;
  removeSingleCount: (sku: string, options?: any[]) => void;
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
  quoteId: string | null;
  setQuoteId: (id: string | null) => void;
  cartError: string | null;
  setCartError: (error: string | null) => void;
  isCartErrorOpen: boolean;
  setCartErrorOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // ... (existing addToCart) ...
      addToCart: (product, quantity = 1, options = { openCart: true }) => {
        if (options.openCart && typeof window !== "undefined" && window.innerWidth >= 1024) {
          useUIStore.getState().setCartOpen(true);
        }
        const items = get().items;
        const existing = items.find((i) => {
          if (i.product.sku !== product.sku) return false;

          const iOptions = i.product.selected_assorted_options;
          const pOptions = product.selected_assorted_options;

          if (!pOptions) {
            // If payload has no options, strict match with item having no options
            // This ensures we don't accidentally match an assorted variant with a base call
            return !iOptions;
          }

          if (!iOptions) return false; // Payload has options, item doesn't
          if (iOptions.length !== pOptions.length) return false;

          return iOptions.every(io =>
            pOptions.some(po =>
              String(po.option_id) === String(io.option_id) &&
              String(po.option_type_id) === String(io.option_type_id)
            )
          );
        });

        if (existing) {
          set({
            items: items.map((i) =>
              (
                i.product.sku === product.sku &&
                // Deep comparison for assorted options
                ((!i.product.selected_assorted_options && !product.selected_assorted_options) ||
                  (i.product.selected_assorted_options && product.selected_assorted_options &&
                    i.product.selected_assorted_options.length === product.selected_assorted_options.length &&
                    i.product.selected_assorted_options.every(io =>
                      product.selected_assorted_options?.some(po =>
                        String(po.option_id) === String(io.option_id) &&
                        String(po.option_type_id) === String(io.option_type_id)
                      )
                    )
                  )
                )
              )
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({ items: [{ product: product as CatalogProduct, quantity }, ...items] });
        }
      },
      // ... (rest of store) ...
      removeSingleCount: (sku, options) => {
        const items = get().items;
        const existing = items.find((i) => {
          if (i.product.sku !== sku) return false;

          // Check options if provided
          if (options) {
            const iOptions = i.product.selected_assorted_options;
            if (!iOptions) return false;
            // Basic length check
            if (iOptions.length !== options.length) return false;
            // Deep compare
            return iOptions.every(io =>
              options.some(po =>
                String(po.option_id) === String(io.option_id) &&
                String(po.option_type_id) === String(io.option_type_id)
              )
            );
          } else {
            // If no options passed, looking for item with no options (or maybe just first SKU match?)
            // Ideally strict: if options not passed, match item with NO selected_assorted_options
            return !i.product.selected_assorted_options;
          }
        });

        if (existing && existing.quantity > 1) {
          set({
            items: items.map((i) =>
              i === existing ? { ...i, quantity: i.quantity - 1 } : i
            ),
          });
        } else if (existing && existing.quantity === 1) {
          set({
            items: items.filter((i) => i !== existing),
          });
        }
      },
      removeFromCart: (sku, options) =>
        set({
          items: get().items.filter((i) => {
            if (i.product.sku !== sku) return true; // Keep different SKUs

            // If same SKU, check if options match to REMOVE it
            if (options) {
              const iOptions = i.product.selected_assorted_options;
              if (!iOptions) return true; // Item has no options, keep it (mismatch)
              if (iOptions.length !== options.length) return true; // Keep

              const match = iOptions.every(io =>
                options.some(po =>
                  String(po.option_id) === String(io.option_id) &&
                  String(po.option_type_id) === String(io.option_type_id)
                )
              );
              return !match; // If match, remove (return false)
            } else {
              // No options passed, remove items with matching SKU and NO options
              // (Backward compat: remove base product)
              return !!i.product.selected_assorted_options;
            }
          }),
        }),

      updateQuantity: (sku, quantity, options) =>
        set({
          items: get().items.map((i) => {
            if (i.product.sku !== sku) return i;

            let match = false;
            if (options) {
              const iOptions = i.product.selected_assorted_options;
              if (iOptions && iOptions.length === options.length) {
                match = iOptions.every(io =>
                  options.some(po =>
                    String(po.option_id) === String(io.option_id) &&
                    String(po.option_type_id) === String(io.option_type_id)
                  )
                );
              }
            } else {
              // If no options, match items with no options
              match = !i.product.selected_assorted_options;
            }

            return match ? { ...i, quantity } : i;
          }),
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
      // Quote ID from Bulk API
      quoteId: null,
      setQuoteId: (id) => set({ quoteId: id }),

      // Global Cart Error
      cartError: null,
      setCartError: (error) => set({ cartError: error }),
      isCartErrorOpen: false,
      setCartErrorOpen: (isOpen) => set({ isCartErrorOpen: isOpen }),
    }),
    {
      name: "cart-store", // persists in localStorage
      partialize: (state) => ({
        items: state.items,
        expressErrorItems: state.expressErrorItems,
        lastOrderId: state.lastOrderId,
        quoteId: state.quoteId,
      }),
    }
  )
);
