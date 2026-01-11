"use client";

import { useState, useCallback } from "react";
import { sendOtp, verifyOtp } from "@/lib/auth/auth.api";

interface UsePhoneVerificationReturn {
    isSendingOtp: boolean;
    isVerifyingOtp: boolean;
    error: string | null;
    successMessage: string | null;
    sendVerificationOtp: (mobileNumber: string) => Promise<boolean>;
    verifyVerificationOtp: (mobileNumber: string, otp: string) => Promise<boolean>;
    clearStates: () => void;
}

export const usePhoneVerification = (): UsePhoneVerificationReturn => {
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const clearStates = useCallback(() => {
        setError(null);
        setSuccessMessage(null);
    }, []);

    const sendVerificationOtp = useCallback(async (mobileNumber: string): Promise<boolean> => {
        setIsSendingOtp(true);
        setError(null);
        setSuccessMessage(null);
        try {
            // Assuming 974 prefix for Qatar as per existing logic in auth
            const phoneToSend = mobileNumber.startsWith("974") ? mobileNumber : `974${mobileNumber}`;
            const response = await sendOtp({
                username: phoneToSend,
                isNumber: 1,
            });

            if (response.success) {
                setSuccessMessage(response.message || "OTP Sent Successfully");
                return true;
            } else {
                setError(response.message || "Failed to send OTP");
                return false;
            }
        } catch (_err) {
            setError("Network error sending OTP");
            return false;
        } finally {
            setIsSendingOtp(false);
        }
    }, []);

    const verifyVerificationOtp = useCallback(async (mobileNumber: string, otp: string): Promise<boolean> => {
        setIsVerifyingOtp(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const phoneToSend = mobileNumber.startsWith("974") ? mobileNumber : `974${mobileNumber}`;
            const response = await verifyOtp({
                username: phoneToSend,
                otp: parseInt(otp),
                isNumber: 1,
            });

            // For pure verification, checking success.
            // Note: The API returns a token but we ignore it to avoid login side-effects in this context
            if (response.success) {
                setSuccessMessage("Phone verified successfully!");
                return true;
            } else {
                setError(response.message || "Invalid OTP");
                return false;
            }
        } catch (_err) {
            setError("Network error verifying OTP");
            return false;
        } finally {
            setIsVerifyingOtp(false);
        }
    }, []);

    return {
        isSendingOtp,
        isVerifyingOtp,
        error,
        successMessage,
        sendVerificationOtp,
        verifyVerificationOtp,
        clearStates,
    };
};
