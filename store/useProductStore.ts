// src/store/useProductStore.ts
import { create } from "zustand";
import { Product } from "@/types";
import { persist } from "zustand/middleware";
interface ProductStore {
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product) => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      selectedProduct: null,
      setSelectedProduct: (product) => set({ selectedProduct: product }),
    }),
    {
      name: "product-store", // Key in localStorage
    }
  )
);
