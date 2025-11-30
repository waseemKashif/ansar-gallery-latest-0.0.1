import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { sendOtp, UserProfile, verifyOtp } from "@/lib/auth/auth.api";

interface UseAuthReturn {
    // State
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    resendTimer: number;
    canResend: boolean;

    // Actions
    sendOtpCode: (mobileNumber: string) => Promise<boolean>;
    verifyOtpCode: (mobileNumber: string, otp: string) => Promise<boolean>;
    resendOtpCode: (mobileNumber: string) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
    const {
        isAuthenticated,
        setAuth,
        clearAuth,
        setLoading,
        setError: setStoreError,
        error: storeError,
        isLoading: storeLoading,
    } = useAuthStore();

    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(true);

    // Timer countdown effect
    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [resendTimer]);

    /**
     * Send OTP to mobile number
     */
    const sendOtpCode = useCallback(
        async (mobileNumber: string): Promise<boolean> => {
            setLoading(true);
            setStoreError(null);

            try {
                const response = await sendOtp({
                    username: mobileNumber,
                    isNumber: 1,
                });

                if (response.success) {
                    if (response.time) {
                        setResendTimer(response.time);
                        setCanResend(false);
                    }
                    return true;
                } else {
                    // Handle OTP already sent case
                    if (response.is_timer && response.time) {
                        setResendTimer(response.time);
                        setCanResend(false);
                        setStoreError(response.message);
                    } else {
                        setStoreError(response.message || "Failed to send OTP");
                    }
                    return false;
                }
            } catch (error) {
                setStoreError("Network error. Please check your connection.");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setStoreError]
    );

    /**
     * Verify OTP code
     */
    const verifyOtpCode = useCallback(
        async (mobileNumber: string, otp: string): Promise<boolean> => {
            setLoading(true);
            setStoreError(null);

            try {
                const response = await verifyOtp({
                    username: mobileNumber,
                    otp: parseInt(otp),
                    isNumber: 1,
                });

                if (response.success && response.token) {
                    // Store auth data in Zustand store
                    setAuth(
                        response.token,
                        response.id || "",
                        response.profile || ({} as UserProfile)
                    );
                    return true;
                } else {
                    setStoreError(response.message || "Invalid OTP");
                    return false;
                }
            } catch (error) {
                setStoreError("Network error. Please check your connection.");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [setAuth, setLoading, setStoreError]
    );

    /**
     * Resend OTP code
     */
    const resendOtpCode = useCallback(
        async (mobileNumber: string): Promise<boolean> => {
            if (!canResend || storeLoading) return false;

            setLoading(true);
            setStoreError(null);

            try {
                const response = await sendOtp({
                    username: mobileNumber,
                    isNumber: 1,
                });

                if (response.success) {
                    if (response.time) {
                        setResendTimer(response.time);
                        setCanResend(false);
                    }
                    return true;
                } else {
                    if (response.is_timer && response.time) {
                        setResendTimer(response.time);
                        setCanResend(false);
                    }
                    setStoreError(response.message || "Failed to resend OTP");
                    return false;
                }
            } catch (error) {
                setStoreError("Failed to resend OTP. Please try again.");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [canResend, storeLoading, setLoading, setStoreError]
    );

    /**
     * Logout user
     */
    const logout = useCallback(() => {
        clearAuth();
    }, [clearAuth]);

    /**
     * Clear error message
     */
    const clearError = useCallback(() => {
        setStoreError(null);
    }, [setStoreError]);

    return {
        isAuthenticated,
        isLoading: storeLoading,
        error: storeError,
        resendTimer,
        canResend,
        sendOtpCode,
        verifyOtpCode,
        resendOtpCode,
        logout,
        clearError,
    };
};
