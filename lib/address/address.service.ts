// Address API service

import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/auth.store";
import type { UserAddress } from "@/lib/user/user.types";

const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const BASE_URL = "https://www.ansargallery.com/en/rest";

/**
 * Get user addresses from profile for logged in
 */
export const getAddressesFromProfile = (): UserAddress[] => {
  const { userProfile, isAuthenticated } = useAuthStore.getState();

  if (!isAuthenticated || !userProfile || !userProfile.addresses) {
    return [];
  }

  return userProfile.addresses.map((addr) => ({
    // addressId:addr.id,
    id: addr.id,
    customer_id: addr.customer_id,
    email: addr?.email || "",
    countryId: addr.country_id,
    firstname: addr?.firstname || "",
    lastname: addr?.lastname || "",
    regionCode: addr?.region_code || "",
    region: addr?.region || "",
    regionId: addr?.region_id || 0,
    websiteId: addr?.website_id || 0,
    quoteId: addr?.quote_id || "",
    customFlatNumber: addr?.custom_flat_number || "",
    telephone: addr?.telephone || "",
    prefix: addr?.prefix || "",
    company: addr?.company || "",
    postcode: addr?.postcode || "",
    customAddressOption: addr?.custom_address_option || "",
    customBuildingName: addr?.custom_building_name || "",
    customBuildingNumber: addr?.custom_building_number || "",
    customFloorNumber: addr?.custom_floor_number || "",
    customLatitude: addr?.custom_latitude || "",
    customLongitude: addr?.custom_longitude || "",
    customAddressLabel: addr?.custom_address_label || "",
    defaultShipping: addr?.default_shipping || false,
    defaultBilling: addr?.default_billing || false,
    street: addr?.street || "",
    city: addr?.city || "",
  }));
};

/**
 * Get default shipping address from profile
 */
export const getDefaultAddressFromProfile = (): UserAddress | null => {
  const addresses = getAddressesFromProfile();
  return addresses.find((addr) => addr.isDefault) || addresses[0] || null;
};

/**
 * Add new address for logged-in user
 */
export const addUserAddress = async (address: UserAddress): Promise<void> => {
  const { userId } = useAuthStore.getState();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return apiClient<void>(`${BASE_URL}/V1/add/update/customers/customerid/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      customerData: {
        // address_id: 0,  USE THIS ID TO UPDATE ADDRESS, Do not use when want to add new address
        id: userId,
        customerId: userId,
        email: address.email || "",
        country_id: "QA",
        region_code: null,
        region: address.area,
        region_id: 0,
        website_id: 1,
        quote_id: "294690",
        custom_flat_number: address.flatNo || "",
        telephone: address.telephone || "",
        city: address.city || "",
        firstname: address.firstname || "",
        lastname: "",
        prefix: "Mr",
        company: address.company || "",
        street: address.street || "",
        postcode: address.postcode || "",
        custom_address_option: "",
        custom_building_name: address.customBuildingName || "",
        custom_building_number: address.customBuildingNumber || "",
        custom_floor_number: address.customFloorNumber || "",
        custom_latitude: address.customLatitude || "",
        custom_longitude: address.customLongitude || "",
        custom_address_label: address.customAddressLabel || "",
        default_shipping: true,
        default_billing: true
      }
    }),
  });
};

/**
 * Update existing address for logged-in user
 */
export const updateUserAddress = async (addressId: number, address: UserAddress): Promise<void> => {
  const { userId } = useAuthStore.getState();

  if (!userId) {
    throw new Error("User not authenticated");
  }
  console.log("update addressId", addressId)
  return apiClient<void>(`${BASE_URL}/V1/add/update/customers/customerid/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      customerData: {
        id: userId,
        customerId: userId,
        email: address.email || "",
        country_id: "QA",
        region_code: null,
        region: address.area,
        region_id: 0,
        website_id: 1,
        quote_id: "294690",
        custom_flat_number: address.flatNo || "",
        telephone: address.telephone || "",
        city: address.city || "",
        firstname: address.firstname || "",
        lastname: "",
        prefix: "",
        company: address.company || "",
        street: address.street || "",
        postcode: address.postcode || "",
        custom_address_option: "",
        custom_building_name: address.customBuildingName || "",
        custom_building_number: address.customBuildingNumber || "",
        custom_floor_number: address.customFloorNumber || "",
        custom_latitude: address.customLatitude || "",
        custom_longitude: address.customLongitude || "",
        custom_address_label: address.customAddressLabel || "",
        default_shipping: true,
        default_billing: true
      },
    }),
  });
};

/**
 * Delete address for logged-in user
 */
export const deleteUserAddress = async (addressId: number): Promise<void> => {
  const { userId } = useAuthStore.getState();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return apiClient<void>(`${BASE_URL}/V1/customers/me/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
  });
};
