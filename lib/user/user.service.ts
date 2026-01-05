// User API service

import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/auth.store";
import type { OrderItem, OrderResponse, PersonalInfo } from "./user.types";
import { UserProfile } from "./user.types";
import { UserAddress } from "./user.types";
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const BASE_URL = "https://www.ansargallery.com/en/rest";
const BASE_URL_WITHOUT_locale = "https://www.ansargallery.com/";
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

export const updatePersonalInfoGuest = async (info: UserAddress, guestToken: string): Promise<void> => {
  try {
    return apiClient<void>(`${BASE_URL}/V1/test/set/guest-carts/${guestToken}/billing-address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        addressData: {
          street: info.street || "",
          telephone: info.telephone,
          postcode: info.postcode || "",
          city: info.city || "",
          firstname: info.firstname || "",
          lastname: info.lastname,
          email: info.email || "",
          company: "ansar gallery",
          prefix: "Mr",
          country_id: "QA",
          region_code: null,
          region: "Qatar",
          region_id: 0,
          quote_id: info.quoteId,
          custom_flat_number: null,
          custom_address_option: info.customAddressOption || "", // villa house office
          custom_building_name: "",
          custom_building_number: info.customBuildingNumber || "",
          custom_floor_number: info.customFloorNumber || "",
          custom_latitude: info.customLatitude || "",
          custom_longitude: info.customLongitude || "",
          custom_address_label: "", //custom
          default_shipping: true,
          default_billing: true,
          same_as_billing: 1,
          save_in_address_book: 1
        },
        useForShipping: true
      }),
    });
  } catch (error) {
    console.error("Error updating personal info:", error);
    throw error;
  }
};

/**
 * Get user orders
 */
export const getUserOrders = async (
  userId: string,
  currentPage: number = 1,
  pageSize: number = 30,
  locale: string = "en"
): Promise<OrderResponse> => {
  try {
    return apiClient<OrderResponse>(`${BASE_URL_WITHOUT_locale}/${locale}/rest/V1/all/order?customerId=${userId}&currentPage=${currentPage}&pageSize=${pageSize}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};
