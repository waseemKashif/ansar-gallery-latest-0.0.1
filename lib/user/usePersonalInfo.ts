// Hook for managing personal information

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { getPersonalInfoFromProfile, updatePersonalInfo } from "./user.service";
import type { PersonalInfo } from "./user.types";

const STORAGE_KEY = "checkout_personal_info";

/**
 * Get personal info from localStorage
 */
const getStoredPersonalInfo = (): PersonalInfo | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Save personal info to localStorage
 */
const savePersonalInfoToStorage = (info: PersonalInfo): void => {
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
  const { isAuthenticated, userProfile } = useAuthStore();
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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

  /**
   * Save personal info
   * - Logged-in: calls API + updates local state
   * - Guest: saves to localStorage
   */
  const savePersonalInfo = useCallback(async (info: PersonalInfo) => {
    setIsSaving(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Call API to update user info
        await updatePersonalInfo(info);
      }
      
      // Always save to localStorage (for checkout flow)
      savePersonalInfoToStorage(info);
      setPersonalInfo(info);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save personal info";
      setError(errorMessage);
      console.error("Error saving personal info:", err);
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
      personalInfo.firstName.trim() !== "" &&
      personalInfo.lastName.trim() !== "" &&
      personalInfo.phone.trim() !== ""
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
