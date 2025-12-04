// Address API service

import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/auth.store";
import type { UserAddress } from "@/lib/user/user.types";

const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const BASE_URL = "https://www.ansargallery.com/en/rest";

/**
 * Get user addresses from profile
 */
export const getAddressesFromProfile = (): UserAddress[] => {
  const { userProfile, isAuthenticated } = useAuthStore.getState();

  if (!isAuthenticated || !userProfile || !userProfile.addresses) {
    return [];
  }

  return userProfile.addresses.map((addr) => ({
    id: addr.id,
    street: addr.street || "",
    building: addr.custom_building_name || "",
    floor: addr.custom_floor_number || "",
    flatNo: addr.custom_flat_number || "",
    city: addr.city || "",
    area: addr.region || "",
    landmark: "",
    latitude: addr.custom_latitude || "",
    longitude: addr.custom_longitude || "",
    isDefault: addr.default_shipping || false,
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

  return apiClient<void>(`${BASE_URL}/V1/customers/me/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      address: {
        street: [address.street],
        city: address.city,
        region: address.area,
        custom_building_name: address.building,
        custom_building_number: address.building,
        custom_floor_number: address.floor,
        custom_flat_number: address.flatNo,
        custom_latitude: address.latitude,
        custom_longitude: address.longitude,
        default_shipping: address.isDefault || false,
        // Add other required fields as per your API
      },
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

  return apiClient<void>(`${BASE_URL}/V1/customers/me/addresses/${addressId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      address: {
        id: addressId,
        street: [address.street],
        city: address.city,
        region: address.area,
        custom_building_name: address.building,
        custom_building_number: address.building,
        custom_floor_number: address.floor,
        custom_flat_number: address.flatNo,
        custom_latitude: address.latitude,
        custom_longitude: address.longitude,
        default_shipping: address.isDefault || false,
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
