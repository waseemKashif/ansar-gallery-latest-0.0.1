import { UserProfile } from "@/lib/auth/auth.api";

const AUTH_TOKEN_KEY = "authToken";
const USER_ID_KEY = "userId";
const USER_PROFILE_KEY = "userProfile";

/**
 * Store authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
    if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
};

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
    if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_TOKEN_KEY);
    }
};

/**
 * Store user ID in localStorage
 */
export const setUserId = (userId: string): void => {
    if (typeof window !== "undefined") {
        localStorage.setItem(USER_ID_KEY, userId);
    }
};

/**
 * Get user ID from localStorage
 */
export const getUserId = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem(USER_ID_KEY);
    }
    return null;
};

/**
 * Remove user ID from localStorage
 */
export const removeUserId = (): void => {
    if (typeof window !== "undefined") {
        localStorage.removeItem(USER_ID_KEY);
    }
};

/**
 * Store user profile in localStorage
 */
export const setUserProfile = (profile: UserProfile): void => {
    if (typeof window !== "undefined") {
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    }
};

/**
 * Get user profile from localStorage
 */
export const getUserProfile = (): UserProfile | null => {
    if (typeof window !== "undefined") {
        const profileStr = localStorage.getItem(USER_PROFILE_KEY);
        if (profileStr) {
            try {
                return JSON.parse(profileStr);
            } catch (error) {
                console.error("Error parsing user profile:", error);
                return null;
            }
        }
    }
    return null;
};

/**
 * Remove user profile from localStorage
 */
export const removeUserProfile = (): void => {
    if (typeof window !== "undefined") {
        localStorage.removeItem(USER_PROFILE_KEY);
    }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = (): void => {
    removeAuthToken();
    removeUserId();
    removeUserProfile();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!getAuthToken();
};

/**
 * Format timer from seconds to MM:SS
 */
export const formatTimer = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * Validate mobile number format
 */
export const isValidMobileNumber = (mobile: string): boolean => {
    // Basic validation - adjust regex as per your requirements
    const mobileRegex = /^\d{8,15}$/;
    return mobileRegex.test(mobile);
};
