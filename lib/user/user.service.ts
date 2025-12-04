// User API service

import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/auth.store";
import type { PersonalInfo } from "./user.types";
import { UserProfile } from "@/lib/auth/auth.api";
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const BASE_URL = "https://www.ansargallery.com/en/rest";

/**
 * Update user personal information
 */
export const updatePersonalInfo = async (info: UserProfile): Promise<void> => {
  const { userId } = useAuthStore.getState();

  if (!userId) {
    throw new Error("User not authenticated");
  }
  try {
    return apiClient<void>(`${BASE_URL}/V1/customers/update/profile/customerid/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        customer: {
          custom_attributes: [
            {
              attribute_code: "phone_number",
              value: info.phone_number
            }
          ],
          email: info.email,
          firstname: info.firstname,
          lastname: info.lastname,
          id: userId,
          store_id: 1,
          website_id: 1
        }
      }),
    });
  } catch (error) {
    console.error("Error updating personal info:", error);
    throw error;
  }
};

/**
 * Get user personal information from profile
 */
export const getPersonalInfoFromProfile = (): UserProfile | null => {
  const { userProfile, isAuthenticated } = useAuthStore.getState();

  if (!isAuthenticated || !userProfile) {
    return null;
  }

  return {
    firstname: userProfile.firstname || "",
    lastname: userProfile.lastname || "",
    email: userProfile.email || "",
    phone_number: userProfile.phone_number || "",
    id: userProfile.id || "",
    group_id: userProfile.group_id || "",
    default_billing: userProfile.default_billing || "",
    default_shipping: userProfile.default_shipping || "",
    created_at: userProfile.created_at || "",
    updated_at: userProfile.updated_at || "",
    created_in: userProfile.created_in || "",
    store_id: userProfile.store_id || "",
    website_id: userProfile.website_id || "",
    addresses: userProfile.addresses || [],
  };
};

// 123