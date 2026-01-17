import { create } from 'zustand';

interface UIState {
    isCartOpen: boolean;
    setCartOpen: (isOpen: boolean) => void;
    isFilterOpen: boolean;
    setFilterOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isCartOpen: false,
    setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
    isFilterOpen: false,
    setFilterOpen: (isOpen) => set({ isFilterOpen: isOpen }),
}));
