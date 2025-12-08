// Hook for managing personal information

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { getPersonalInfoFromProfile, updatePersonalInfo, updatePersonalInfoGuest } from "./user.service";
import type { UserAddress, UserProfile } from "@/lib/auth/auth.api";
const STORAGE_KEY = "checkout_personal_info";
const guestToken = useAuthStore.getState().guestToken;
/**
 * Get personal info from localStorage
 */
const getStoredPersonalInfo = (): UserProfile | null => {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return null;
  }
};

/**
 * Save personal info to localStorage
 */
const savePersonalInfoToStorage = (info: UserProfile): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
};

/**
 * Clear personal info from localStorage
 */
export const clearStoredPersonalInfo = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Hook to manage personal information
 * - For logged-in users: fetches from profile, can update via API
 * - For guests: stores in localStorage
 */
export const usePersonalInfo = () => {
  const { isAuthenticated, userProfile, updateProfile } = useAuthStore();

  const [personalInfo, setPersonalInfo] = useState<UserProfile>({
    firstname: "",
    lastname: "",
    email: "",
    phone_number: "",
    id: "",
    group_id: "",
    default_billing: "",
    default_shipping: "",
    created_at: "",
    updated_at: "",
    created_in: "",
    store_id: "",
    website_id: "",
    addresses: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize personal info
  useEffect(() => {
    setIsLoading(true);

    if (isAuthenticated && userProfile) {
      // Logged-in user: get from profile
      const profileInfo = getPersonalInfoFromProfile();
      if (profileInfo) {
        setPersonalInfo(profileInfo);
      }
    } else {
      // Guest user: get from localStorage
      const storedInfo = getStoredPersonalInfo();
      if (storedInfo) {
        setPersonalInfo(storedInfo);
      }
    }

    setIsLoading(false);
  }, [isAuthenticated, userProfile]);

  /*
   * Save personal info
   * - Logged-in: calls API + updates local state
   * - Guest: saves to localStorage
   */
  const savePersonalInfo = useCallback(async (info: UserAddress | UserProfile) => {
    setIsSaving(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Update personal info via API
        await updatePersonalInfo(info as UserProfile);
        console.log("Personal info updated successfully");
        // need to update the local storage with the new info
        updateProfile(info as UserProfile);
        savePersonalInfoToStorage(info as UserProfile);
        setPersonalInfo(info as UserProfile);
      } else {
        // Guest user: save to localStorage and update the guest info in the API
        savePersonalInfoToStorage(info as UserProfile);
        setPersonalInfo(info as UserProfile);


        updatePersonalInfoGuest(info as UserAddress, guestToken);
        console.log(info, "Guest user: saving to localStorage");
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save personal info";
      setError(errorMessage);
      console.log("error in updating user infromation")
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated]);

  /**
   * Validation check
   */
  const isValid = useCallback(() => {
    return (
      personalInfo?.firstname?.trim() !== "" &&
      personalInfo?.lastname?.trim() !== "" &&
      personalInfo?.phone_number?.trim() !== "" &&
      personalInfo?.email?.trim() !== ""
    );
  }, [personalInfo]);

  return {
    personalInfo,
    setPersonalInfo,
    savePersonalInfo,
    isLoading,
    isSaving,
    error,
    isValid,
    isAuthenticated,
  };
};

// 123
