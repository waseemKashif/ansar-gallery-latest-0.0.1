// User related types, need to check with backend team api compatibility
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;

}

// user address types need to check with backend team api compatibility
export interface UserAddress {
  // addressId?: number;
  city: string;
  company: string;
  countryId?: string;
  customAddressLabel?: string;
  customAddressOption?: string;
  customBuildingName?: string;
  customBuildingNumber?: string;
  customFlatNumber?: string;
  customFloorNumber?: string;
  customLatitude?: string;
  customLongitude?: string;
  customer_id?: number;
  defaultBilling?: boolean;
  defaultShipping?: boolean;
  email?: string;
  firstname: string;
  id?: number;
  lastname: string;
  postcode?: string;
  prefix?: string;
  quoteId?: string;
  region?: string;
  regionCode?: string;
  regionId?: number;
  street?: string;
  telephone: string;
  websiteId?: number;

}
// map location types, need to check with backend team api compatibility
export interface MapLocation {
  latitude: string;
  longitude: string;
  address?: string;
  formattedAddress?: string;
}
