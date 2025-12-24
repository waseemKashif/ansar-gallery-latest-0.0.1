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
/**
 * Fetch user addresses (V1 API)
 */
export const fetchUserAddresses = async (customerId: string | number): Promise<UserAddress[]> => {
  if (!customerId) return [];

  // Note: The V1 API usually returns a list of addresses.
  // We map them to our internal UserAddress type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await apiClient<any[]>(`${BASE_URL}/V1/customer/addresses/customerid/${customerId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  // Map API response to UserAddress
  // IMPORTANT: Adjust mapping based on actual API response structure if needed.
  // Assuming a standard Magento-like address structure or the one seen in payload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Array.isArray(response) ? response.map((addr: any) => ({
    id: addr.id,
    customer_id: addr.customer_id,
    email: addr.email || "",
    countryId: addr.country_id,
    firstname: addr.firstname || "",
    lastname: addr.lastname || "",
    telephone: addr.telephone || "",
    street: Array.isArray(addr.street) ? addr.street[0] : addr.street, // Magetno often sends street as array
    city: addr.city || "",
    postcode: addr.postcode || "",
    region: addr.region ? (typeof addr.region === 'string' ? addr.region : addr.region.region) : "",
    regionId: addr.region_id,
    area: addr.region ? (typeof addr.region === 'string' ? addr.region : addr.region.region) : "", // Mapping region to area for now
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customAddressOption: (addr.custom_attributes?.find((a: any) => a.attribute_code === 'custom_address_option')?.value || addr.custom_address_option || "").charAt(0).toUpperCase() + (addr.custom_attributes?.find((a: any) => a.attribute_code === 'custom_address_option')?.value || addr.custom_address_option || "").slice(1).toLowerCase(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customBuildingName: addr.custom_attributes?.find((a: any) => a.attribute_code === 'custom_building_name')?.value || addr.custom_building_name || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customBuildingNumber: addr.custom_attributes?.find((a: any) => a.attribute_code === 'custom_building_number')?.value || addr.custom_building_number || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customFloorNumber: addr.custom_attributes?.find((a: any) => a.attribute_code === 'custom_floor_number')?.value || addr.custom_floor_number || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customFlatNumber: addr.custom_attributes?.find((a: any) => a.attribute_code === 'custom_flat_number')?.value || addr.custom_flat_number || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customLatitude: addr.custom_attributes?.find((a: any) => a.attribute_code === 'custom_latitude')?.value || addr.custom_latitude || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customLongitude: addr.custom_attributes?.find((a: any) => a.attribute_code === 'custom_longitude')?.value || addr.custom_longitude || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customAddressLabel: addr.custom_attributes?.find((a: any) => a.attribute_code === 'custom_address_label')?.value || addr.custom_address_label || "",
    defaultShipping: addr.default_shipping || false,
    defaultBilling: addr.default_billing || false,
    company: addr.company || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    flatNo: addr.custom_attributes?.find((a: any) => a.attribute_code === 'custom_flat_number')?.value || addr.custom_flat_number || "",
  })) : [];
};

/**
 * Add new address (V2 API)
 */
export const addUserAddress = async (address: UserAddress): Promise<void> => {
  const { userId, userProfile } = useAuthStore.getState();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return apiClient<void>(`${BASE_URL}/V2/add/update/customers/customerid/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      customerData: {
        // id: userId, // For create, we might not need to send ID or send as string if API explicitly requires customer ID here
        customerId: userId,
        email: address.email || userProfile?.email || "",
        country_id: "QA", // Hardcoded as per request/example
        region: address.area || "Qatar",
        region_code: null, // As per example
        region_id: 0,
        website_id: 1,
        quote_id: "294690",
        telephone: address.telephone || "",
        city: address.city || "Doha", // Defaulting to Doha if empty, based on example context
        firstname: address.firstname || "",
        lastname: address.lastname || ".", // Lastname logic: user said "rest can be empty", ensuring at least a char if required
        prefix: "Mr",
        company: address.company || "Ansar gallery",
        street: address.street || "",
        postcode: address.postcode || 0, // Example showed 56
        custom_address_option: address.customAddressOption || "Home",
        custom_building_name: address.customBuildingName || "",
        custom_building_number: address.customBuildingNumber || "",
        custom_floor_number: address.customFloorNumber || "",
        custom_flat_number: address.flatNo || "",
        custom_latitude: address.customLatitude ? Number(address.customLatitude) : 0,
        custom_longitude: address.customLongitude ? Number(address.customLongitude) : 0,
        custom_address_label: address.customAddressLabel || "",
        default_shipping: true, // Always true as requested
        default_billing: true
      }
    }),
  });
};

/**
 * Update existing address for logged-in user
 */
/**
 * Update existing address (V2 API)
 */
export const updateUserAddress = async (addressId: number, address: UserAddress): Promise<void> => {
  const { userId, userProfile } = useAuthStore.getState();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return apiClient<void>(`${BASE_URL}/V2/add/update/customers/customerid/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      customerData: {
        address_id: addressId, // V2 update likely requires address_id
        customerId: userId,
        email: address.email || userProfile?.email || "",
        country_id: "QA",
        region: address.area || "Qatar",
        region_code: null,
        region_id: 0,
        website_id: 1,
        quote_id: "294690",
        telephone: address.telephone || "",
        city: address.city || "Doha",
        firstname: address.firstname || "",
        lastname: address.lastname || ".",
        prefix: "Mr",
        company: address.company || "Ansar gallery",
        street: address.street || "",
        postcode: address.postcode || 0,
        custom_address_option: address.customAddressOption || "Home",
        custom_building_name: address.customBuildingName || "",
        custom_building_number: address.customBuildingNumber || "",
        custom_floor_number: address.customFloorNumber || "",
        custom_flat_number: address.flatNo || "",
        custom_latitude: address.customLatitude ? Number(address.customLatitude) : 0,
        custom_longitude: address.customLongitude ? Number(address.customLongitude) : 0,
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
