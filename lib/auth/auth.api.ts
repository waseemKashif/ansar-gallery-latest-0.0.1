import { apiClient } from "../apiClient";
import { UserAddress, UserProfile } from "../user/user.types";
export interface SendOtpRequest {
    username: string;
    isNumber: number;
}

export interface SendOtpResponse {
    success: boolean;
    message: string;
    time?: number;
    is_timer?: boolean;
}

export interface VerifyOtpRequest {
    username: string;
    otp: number;
    isNumber: number;
}

export interface VerifyOtpResponse {
    success: boolean;
    message: string;
    token?: string;
    profile_complete?: boolean;
    address_available?: boolean;
    address?: UserAddress;
    id?: string;
    profile?: UserProfile;
}
const API_BASE_URL = "https://www.ansargallery.com/en/rest/V1/customer";
const token = process.env.NEXT_PUBLIC_API_TOKEN;
/**
 * Send OTP to user's mobile number
 */
export const sendOtp = (request: SendOtpRequest): Promise<SendOtpResponse> => {
    return apiClient<SendOtpResponse>(`${API_BASE_URL}/sent-create-otp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });
};

export const verifyOtp = (request: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    return apiClient<VerifyOtpResponse>(`${API_BASE_URL}/otp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });
};

// export const verifyOtp = async (
//     request: VerifyOtpRequest
// ): Promise<VerifyOtpResponse> => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/otp`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify(request),
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data: VerifyOtpResponse = await response.json();
//         return data;
//     } catch (error) {
//         console.error("Verify OTP Error:", error);
//         throw error;
//     }
// };