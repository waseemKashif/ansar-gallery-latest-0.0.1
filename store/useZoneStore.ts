import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ZoneState {
    zone: string | null;
    isLoading: boolean;
    setZone: (zone: string | null) => void;
    clearZone: () => void;
    setIsLoading: (isLoading: boolean) => void;
}

export const useZoneStore = create<ZoneState>()(
    persist(
        (set) => ({
            zone: null,
            isLoading: true,
            setZone: (zone) => set({ zone }),
            clearZone: () => set({ zone: null }),
            setIsLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: "user-zone-storage",
            partialize: (state) => ({ zone: state.zone }), // Only persist zone
            onRehydrateStorage: () => (state) => {
                state?.setIsLoading(false);
            }
        }
    )
);
