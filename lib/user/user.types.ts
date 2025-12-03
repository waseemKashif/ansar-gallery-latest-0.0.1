// User related types

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
}

export interface UserAddress {
  id?: number;
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
}

export interface MapLocation {
  latitude: string;
  longitude: string;
  address?: string;
  formattedAddress?: string;
}
