// Hook for managing user address

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  fetchUserAddresses,
  addUserAddress,
  updateUserAddress,
} from "./address.service";
import type { UserAddress } from "@/lib/user/user.types";

const STORAGE_KEY = "checkout_address_info";

/**
 * Get address from localStorage
 */
// getStoredAddress removed as guest logic is deprecated

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

export const emptyAddress: UserAddress = {
  street: "",
  customBuildingName: "",
  customBuildingNumber: "",
  customFloorNumber: "",
  customFlatNumber: "",
  customLatitude: "",
  customLongitude: "",
  customAddressLabel: "",
  customAddressOption: "",
  city: "",
  company: "",
  countryId: "QA",
  customer_id: 0,
  defaultBilling: false,
  defaultShipping: false,
  email: "",
  firstname: "",
  lastname: "",
  id: 0,
  // prefix: "", // removed as not in type explicitly or optional
  telephone: "",
  postcode: "",
  area: "",
  flatNo: "",
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
  const loadAddresses = useCallback(async () => {
    setIsLoading(true);

    if (isAuthenticated && userProfile?.id) {
      try {
        const addresses = await fetchUserAddresses(userProfile.id);
        // Sort addresses: default shipping first
        addresses.sort((a, b) => (b.defaultShipping ? 1 : 0) - (a.defaultShipping ? 1 : 0));
        setSavedAddresses(addresses);

        // Try to find address in local storage
        let selectedAddress: UserAddress | undefined;
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              // Verify the stored address matches one of the user's addresses
              // This prevents using stale or invalid addresses
              if (parsed && parsed.id) {
                selectedAddress = addresses.find((a) => a.id === parsed.id);
              }
            } catch (e) {
              console.error("Failed to parse stored address", e);
            }
          }
        }

        // Fallback to default shipping or first address if no valid stored address found
        if (!selectedAddress) {
          selectedAddress =
            addresses.find((a) => a.defaultShipping) || addresses[0];
        }

        if (selectedAddress) {
          setAddress(selectedAddress);
          // Ensure storage is synced if we fell back to default
          saveAddressToStorage(selectedAddress);
        }
      } catch (error) {
        console.error("Failed to load addresses", error);
      }
    } else {
      // GUEST LOGIC REMOVED as per request.
      // We can optionally clear address or leave as empty.
      setAddress(emptyAddress);
    }
    setIsLoading(false);
  }, [isAuthenticated, userProfile?.id]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

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
          // Refresh list
          await loadAddresses();
        }

        // Remove localStorage logic for creating "guest" orders if not needed, 
        // OR keep it for persisting the *selected* address during session
        saveAddressToStorage(newAddress);
        setAddress(newAddress);

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to save address";
        setError(errorMessage);
        console.log("Error saving address:", err);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [isAuthenticated, loadAddresses]
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
      setAddress((prev) => {
        const updatedAddress = { ...prev, customLatitude: latitude, customLongitude: longitude };
        saveAddressToStorage(updatedAddress);
        return updatedAddress;
      });
    },
    []
  );

  /**
   * Validation check
   */
  const isValid = useCallback(() => {
    return (
      (address?.street?.trim() || "") !== "" &&
      (address?.customBuildingName?.trim() || "") !== "" &&
      (address?.city?.trim() || "") !== ""
    );
  }, [address]);

  /**
   * Check if location is set
   */
  const hasLocation = useCallback(() => {
    return (address.customLatitude || "") !== "" && (address.customLongitude || "") !== "";
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
