// Hook for managing map location with localStorage persistence

import { useState, useEffect, useCallback } from "react";
import type { MapLocation } from "@/lib/user/user.types";

const STORAGE_KEY = "user_map_location";

/**
 * Get location from localStorage
 */
const getStoredLocation = (): MapLocation | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Save location to localStorage
 */
const saveLocationToStorage = (location: MapLocation): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
};

/**
 * Clear location from localStorage
 */
export const clearStoredLocation = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Hook to manage map location
 * - Stores in localStorage to avoid repeated API calls
 * - Provides methods to update and clear location
 */
export const useMapLocation = () => {
  const [location, setLocation] = useState<MapLocation | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setLocation(stored);
    }
    setIsLoading(false);
  }, []);

  /**
   * Save location (to state and localStorage)
   */
  const saveLocation = useCallback((newLocation: MapLocation) => {
    setLocation(newLocation);
    saveLocationToStorage(newLocation);
    setIsMapOpen(false);
  }, []);

  /**
   * Clear location
   */
  const clearLocation = useCallback(() => {
    setLocation(null);
    clearStoredLocation();
  }, []);

  /**
   * Open map picker
   */
  const openMap = useCallback(() => {
    setIsMapOpen(true);
  }, []);

  /**
   * Close map picker
   */
  const closeMap = useCallback(() => {
    setIsMapOpen(false);
  }, []);

  /**
   * Get current location using browser geolocation
   */
  const getCurrentLocation = useCallback((): Promise<MapLocation> => {
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
  }, []);

  /**
   * Get and save current location
   */
  const useCurrentLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentLocation = await getCurrentLocation();
      saveLocation(currentLocation);
      return currentLocation;
    } catch (error) {
      console.error("Error getting current location:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentLocation, saveLocation]);

  /**
   * Check if location is set
   */
  const hasLocation = location !== null && location.latitude !== "" && location.longitude !== "";

  return {
    location,
    setLocation,
    saveLocation,
    clearLocation,
    isMapOpen,
    openMap,
    closeMap,
    isLoading,
    hasLocation,
    getCurrentLocation,
    useCurrentLocation,
  };
};
