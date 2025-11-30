import { create } from "zustand";
import { Product, CatalogProduct } from "@/types";

interface ProductState {
  selectedProduct: Product | CatalogProduct | null;
  setSelectedProduct: (product: Product | CatalogProduct | null) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  selectedProduct: null,
  setSelectedProduct: (product: Product | CatalogProduct | null) => set({ selectedProduct: product }),
}));
