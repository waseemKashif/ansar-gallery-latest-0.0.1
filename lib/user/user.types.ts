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
  id: number;
  email?: string;
  customerId?: number;
  countryId?: string;
  firstname?: string;
  lastname?: string;
  regionCode?: string;
  region?: string;
  regionId?: number;
  websiteId?: number;
  quoteId?: string;
  customFlatNumber?: string;
  telephone?: string;
  prefix?: string;
  company?: string;
  postcode?: string;
  customAddressOption?: string;
  customBuildingName?: string;
  customBuildingNumber?: string;
  customFloorNumber?: string;
  customLatitude?: string;
  customLongitude?: string;
  customAddressLabel?: string;
  defaultShipping?: boolean;
  defaultBilling?: boolean;
  street?: string;
  building?: string;
  floor?: string;
  flatNo?: string;
  city?: string;
  area?: string;
  landmark?: string;
  latitude?: string;
  longitude?: string;
  isDefault?: boolean;
  formattedAddress?: string;

}

// map location types, need to check with backend team api compatibility
export interface MapLocation {
  latitude: string;
  longitude: string;
  address?: string;
  formattedAddress?: string;
}
