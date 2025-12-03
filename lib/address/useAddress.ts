// Hook for managing user address

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  getAddressesFromProfile,
  getDefaultAddressFromProfile,
  addUserAddress,
  updateUserAddress,
} from "./address.service";
import type { UserAddress } from "@/lib/user/user.types";

const STORAGE_KEY = "checkout_address_info";

/**
 * Get address from localStorage
 */
const getStoredAddress = (): UserAddress | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Save address to localStorage
 */
const saveAddressToStorage = (address: UserAddress): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(address));
};

/**
 * Clear address from localStorage
 */
export const clearStoredAddress = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

const emptyAddress: UserAddress = {
  street: "",
  building: "",
  floor: "",
  flatNo: "",
  city: "",
  area: "",
  landmark: "",
  latitude: "",
  longitude: "",
  isDefault: false,
};

/**
 * Hook to manage user address
 * - For logged-in users: fetches from profile, can update via API
 * - For guests: stores in localStorage
 */
export const useAddress = () => {
  const { isAuthenticated, userProfile } = useAuthStore();

  const [address, setAddress] = useState<UserAddress>(emptyAddress);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize address
  useEffect(() => {
    setIsLoading(true);

    if (isAuthenticated && userProfile) {
      // Logged-in user: get from profile
      const addresses = getAddressesFromProfile();
      setSavedAddresses(addresses);

      const defaultAddr = getDefaultAddressFromProfile();
      if (defaultAddr) {
        setAddress(defaultAddr);
      }
    } else {
      // Guest user: get from localStorage
      const storedAddress = getStoredAddress();
      if (storedAddress) {
        setAddress(storedAddress);
      }
    }

    setIsLoading(false);
  }, [isAuthenticated, userProfile]);

  /**
   * Save address
   * - Logged-in: calls API + updates local state
   * - Guest: saves to localStorage
   */
  const saveAddress = useCallback(
    async (newAddress: UserAddress) => {
      setIsSaving(true);
      setError(null);

      try {
        if (isAuthenticated) {
          // Call API to add/update address
          if (newAddress.id) {
            await updateUserAddress(newAddress.id, newAddress);
          } else {
            await addUserAddress(newAddress);
          }
        }

        // Always save to localStorage (for checkout flow)
        saveAddressToStorage(newAddress);
        setAddress(newAddress);

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to save address";
        setError(errorMessage);
        console.error("Error saving address:", err);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * Select a saved address
   */
  const selectAddress = useCallback((selectedAddress: UserAddress) => {
    setAddress(selectedAddress);
    saveAddressToStorage(selectedAddress);
  }, []);

  /**
   * Update map location
   */
  const updateLocation = useCallback(
    (latitude: string, longitude: string) => {
      const updatedAddress = { ...address, latitude, longitude };
      setAddress(updatedAddress);
      saveAddressToStorage(updatedAddress);
    },
    [address]
  );

  /**
   * Validation check
   */
  const isValid = useCallback(() => {
    return (
      address.street.trim() !== "" &&
      address.building.trim() !== "" &&
      address.city.trim() !== ""
    );
  }, [address]);

  /**
   * Check if location is set
   */
  const hasLocation = useCallback(() => {
    return address.latitude !== "" && address.longitude !== "";
  }, [address]);

  return {
    address,
    setAddress,
    savedAddresses,
    saveAddress,
    selectAddress,
    updateLocation,
    isLoading,
    isSaving,
    error,
    isValid,
    hasLocation,
    isAuthenticated,
  };
};
