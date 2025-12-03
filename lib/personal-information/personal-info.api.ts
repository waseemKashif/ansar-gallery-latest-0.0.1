import { apiClient } from "@/lib/apiClient";

export interface UpdatePersonalInfoRequest {
    name: string;
    email: string;
    phone: string;

}

export interface UpdatePersonalInfoResponse {
    success: boolean;
    message: string;
}
const token = process.env.NEXT_PUBLIC_API_TOKEN;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const updatePersonalInfo = (request: UpdatePersonalInfoRequest): Promise<UpdatePersonalInfoResponse> => {
    return apiClient<UpdatePersonalInfoResponse>(`${API_BASE_URL}/update-personal-info`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });
};