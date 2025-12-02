// Cart module barrel export

// Types
export type {
    CartItem,
    CartItemType,
    CartApiResponse,
    GuestCartApiResponse,
} from "@/types";

// Service functions (for direct API calls if needed)
export {
    getOrCreateGuestToken,
    getGuestCartData,
    fetchGuestCart,
    fetchCustomerCart,
    updateGuestCart,
    updateCustomerCart,
    transformApiItemsToLocal,
    transformLocalItemsToApi,
} from "./cart.service";

// React hooks (main exports for components)
export { useUpdateCart, useCartProducts, useCartActions } from "./cart.hooks";