import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { UserProfile } from "@/lib/auth/auth.api";
import {
    setAuthToken as setAuthTokenUtil,
    removeAuthToken,
    setUserId as setUserIdUtil,
    removeUserId,
    setUserProfile as setUserProfileUtil,
    removeUserProfile,
    getAuthToken,
    getUserId,
    getUserProfile,
} from "@/lib/auth/auth.utils";

interface AuthState {
    // State
    isAuthenticated: boolean;
    token: string | null;
    userId: string | null;
    userProfile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    guestToken: string | null;
    guestId: string | null;

    // Actions
    setAuth: (token: string, userId: string, profile: UserProfile) => void;
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    initializeAuth: () => void;
    updateProfile: (profile: UserProfile) => void;
    setGuestToken: (token: string) => void;
    setGuestId: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                isAuthenticated: false,
                token: null,
                userId: null,
                userProfile: null,
                isLoading: false,
                error: null,
                guestToken: null,
                guestId: null,

                // Set authentication data
                setAuth: (token, userId, profile) => {
                    setAuthTokenUtil(token);
                    setUserIdUtil(userId);
                    setUserProfileUtil(profile);

                    set({
                        isAuthenticated: true,
                        token,
                        userId,
                        userProfile: profile,
                        error: null,
                    });
                },

                // Clear authentication data
                clearAuth: () => {
                    removeAuthToken();
                    removeUserId();
                    removeUserProfile();

                    set({
                        isAuthenticated: false,
                        token: null,
                        userId: null,
                        userProfile: null,
                        error: null,
                    });
                },
                setGuestToken: (token) => {
                    set({ guestToken: token });
                },
                // Set loading state
                setLoading: (loading) => {
                    set({ isLoading: loading });
                },
                setGuestId: (id) => {
                    set({ guestId: id });
                },

                // Set error state
                setError: (error) => {
                    set({ error });
                },

                // Initialize auth from localStorage
                initializeAuth: () => {
                    const token = getAuthToken();
                    const userId = getUserId();
                    const profile = getUserProfile();

                    if (token && userId && profile) {
                        set({
                            isAuthenticated: true,
                            token,
                            userId,
                            userProfile: profile,
                        });
                    }
                },

                // Update user profile
                updateProfile: (profile) => {
                    setUserProfileUtil(profile);
                    set({ userProfile: profile });
                },
            }),
            {
                name: "auth-storage",
                partialize: (state) => ({
                    isAuthenticated: state.isAuthenticated,
                    token: state.token,
                    userId: state.userId,
                    userProfile: state.userProfile,
                    guestToken: state.guestToken,
                }),
            }
        )
    )
);
