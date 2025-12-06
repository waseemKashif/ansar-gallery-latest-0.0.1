// Hook for managing map location with global state persistence (Zustand)

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MapLocation } from "@/lib/user/user.types";

const STORAGE_KEY = "user_map_location";

interface MapLocationState {
  location: MapLocation | null;
  isMapOpen: boolean;
  isLoading: boolean;

  // Actions
  setLocation: (location: MapLocation | null) => void;
  saveLocation: (location: MapLocation) => void;
  clearLocation: () => void;
  openMap: () => void;
  closeMap: () => void;
  setIsLoading: (loading: boolean) => void;
}

const useMapLocationStore = create<MapLocationState>()(
  persist(
    (set) => ({
      location: null,
      isMapOpen: false,
      isLoading: true,

      setLocation: (location) => set({ location }),

      saveLocation: (location) => {
        set({ location, isMapOpen: false });
      },

      clearLocation: () => set({ location: null }),

      openMap: () => set({ isMapOpen: true }),

      closeMap: () => set({ isMapOpen: false }),

      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => {
        // Handle SSR
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => { },
          removeItem: () => { },
        }
      }),
      partialize: (state) => ({ location: state.location }), // Only persist location
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false);
      }
    }
  )
);

/**
 * Hook to manage map location
 * Now uses global Zustand store for synchronization across components
 */
export const useMapLocation = () => {
  const store = useMapLocationStore();

  /**
   * Get current location using browser geolocation
   */
  const getCurrentLocation = async (): Promise<MapLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: MapLocation = {
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          };
          resolve(newLocation);
        },
        (error) => {
          reject(new Error(`Failed to get location: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  /**
   * Get and save current location
   */
  const useCurrentLocation = async () => {
    try {
      store.setIsLoading(true);
      const currentLocation = await getCurrentLocation();
      store.saveLocation(currentLocation);
      return currentLocation;
    } catch (error) {
      console.error("Error getting current location:", error);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  };

  /**
   * Check if location is set
   */
  const hasLocation = store.location !== null && store.location.latitude !== "" && store.location.longitude !== "";

  return {
    ...store,
    hasLocation,
    getCurrentLocation,
    useCurrentLocation,
  };
};

export const clearStoredLocation = () => {
  useMapLocationStore.getState().clearLocation();
};
