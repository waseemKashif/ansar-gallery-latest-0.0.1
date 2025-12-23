// User related types, need to check with backend team api compatibility
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;

}

// user address types need to check with backend team api compatibility
export interface UserAddress {
  id?: number;
  city?: string;
  company?: string;
  country_id?: string;
  email?: string;
  custom_address_label?: string;
  custom_address_option?: string;
  custom_building_name?: string;
  custom_building_number?: string;
  custom_flat_number?: string;
  custom_floor_number?: string;
  custom_latitude?: string;
  custom_longitude?: string;
  customer_id?: number;
  default_billing?: boolean;
  default_shipping?: boolean;
  firstname?: string;
  lastname?: string;
  postcode?: string;
  prefix?: string;
  quote_id?: string;
  region?: string;
  region_code?: string;
  region_id?: number;
  street?: string;
  telephone?: string;

}
// map location types, need to check with backend team api compatibility
export interface MapLocation {
  latitude: string;
  longitude: string;
  address?: string;
  formattedAddress?: string;
}


export interface UserProfile {
  id: string;
  group_id: string;
  default_billing: string | null;
  default_shipping: string | null;
  created_at: string;
  updated_at: string;
  created_in: string;
  email: string;
  phone_number: string;
  firstname: string;
  lastname: string;
  store_id: string;
  website_id: string;
  addresses: UserAddress[];
}
