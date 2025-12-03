// User API service

import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/auth.store";
import type { PersonalInfo } from "./user.types";

const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const BASE_URL = "https://www.ansargallery.com/en/rest";

/**
 * Update user personal information
 */
export const updatePersonalInfo = async (info: PersonalInfo): Promise<void> => {
  const { userId } = useAuthStore.getState();
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  return apiClient<void>(`${BASE_URL}/V1/customers/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      customer: {
        firstname: info.firstName,
        lastname: info.lastName,
        email: info.email,
        // Add other fields as per your API
      },
    }),
  });
};

/**
 * Get user personal information from profile
 */
export const getPersonalInfoFromProfile = (): PersonalInfo | null => {
  const { userProfile, isAuthenticated } = useAuthStore.getState();

  if (!isAuthenticated || !userProfile) {
    return null;
  }

  return {
    firstName: userProfile.firstname || "",
    lastName: userProfile.lastname || "",
    email: userProfile.email || "",
    phone: userProfile.phone_number || "",
  };
};
