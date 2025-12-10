// Hook for managing map location with global state persistence (Zustand)

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MapLocation } from "@/lib/user/user.types";
import { saveMapLocationApi } from "./address.service";
import { useAuthStore } from "@/store/auth.store";
import { useZoneStore } from "@/store/useZoneStore";

const STORAGE_KEY = "user_map_location";

interface MapLocationState {
  location: MapLocation | null;
  isMapOpen: boolean;
  isLoading: boolean;
  zone: string | null;
  street: string | null;
  // Actions
  setLocation: (location: MapLocation | null) => void;
  saveLocation: (location: MapLocation) => Promise<void>;
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
      zone: null,
      street: null,
      setLocation: (location) => set({ location }),
      setZone: (zone) => set({ zone }),
      setStreet: (street) => set({ street }),
      saveLocation: async (location) => {
        set({ location, isMapOpen: false });

        // Get auth state to determine quoteId
        const { isAuthenticated, userId, guestProfile } = useAuthStore.getState();
        let quoteId = "";

        if (isAuthenticated && userId) {
          quoteId = userId;
        } else if (!isAuthenticated && guestProfile?.id) {
          quoteId = guestProfile.id;
        } else {
          console.warn("No quoteId (userId or guestProfile.id) found for saving map location");
        }
        // Get zone from global store
        const { zone } = useZoneStore.getState();
        let zoneNumber = 0;
        if (zone) {
          // Extract number from "Zone 55" etc.
          const match = zone.match(/\d+/);
          if (match) {
            zoneNumber = parseInt(match[0], 10);
          }
        }

        try {
          await saveMapLocationApi(location, quoteId, zoneNumber);
        } catch (error) {
          console.error("Error saving map location:", error);
        }
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
      partialize: (state) => ({ location: state.location, zone: state.zone, street: state.street }), // Only persist location
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
