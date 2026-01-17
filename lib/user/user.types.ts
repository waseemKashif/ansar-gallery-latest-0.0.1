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
  customer_id?: number; // kept as snake_case to match some usages, or generic
  countryId?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  telephone?: string;
  street?: string | string[];
  city?: string;
  postcode?: string;
  company?: string;
  region?: string;
  regionCode?: string;
  area?: string;
  regionId?: number;
  websiteId?: number;
  quoteId?: string;
  prefix?: string;
  // Custom attributes (camelCase for frontend)
  customAddressOption?: string;
  customBuildingName?: string;
  customBuildingNumber?: string;
  customFlatNumber?: string; // or flatNo
  flatNo?: string;
  customFloorNumber?: string;
  customLatitude?: string;
  customLongitude?: string;
  customAddressLabel?: string;

  // Status
  defaultBilling?: boolean;
  defaultShipping?: boolean;
  isDefault?: boolean;

  // Keep snake_case optionally if needed for direct mapping compatibility temporarily
  custom_address_option?: string;
  country_id?: string;
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

export interface OrderItem {
  sub_order_id: string;
  order_id: string;
  order_status: string;
  ordered_date: string;
  order_price: number;
  order_product_images: string[];
  is_returnable: boolean;
}

export interface OrderResponse {
  status: string;
  message: string;
  data: OrderItem[];
}

export interface OrderDetailAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface OrderDetailItem {
  item_id: string;
  sku: string;
  item_name: string;
  ordered_quantity: number;
  delivered_quantity: number;
  ordered_price: number;
  delivered_price: number;
  image: string;
  status: string;
  is_returnable: boolean;
}

export interface OrderDetailData {
  sub_order_id: string;
  order_no: string;
  order_status: string;
  delivered_date: string;
  address: OrderDetailAddress;
  items: OrderDetailItem[];
  sub_total: number;
  delivery_charges: number;
  total: number;
  is_returnable: boolean;
  real_order_price: number;
}

export interface SingleOrderResponse {
  status: boolean;
  message: string;
  data: OrderDetailData;
}

export interface CurrentOrderItem {
  name: string;
  price: number;
  discounted_price: number;
  qty: number;
  img_url: string;
}

export interface DeliveryTime {
  delivery_from: string;
  delivery_to: string;
  timerange: string;
}

export interface CurrentOrder {
  increment_id: string;
  subgroup_identifier: string;
  order_status: string;
  status_key: number;
  order_label: string;
  sub_title: string;
  sub_total: number;
  grand_total: number;
  total_discount: number;
  payment_method: string;
  shipping_address: string;
  delivery_charges: number;
  delivery_time: DeliveryTime;
  driver_type: string | null;
  driver_id: string | null;
  driver_lat: string | null;
  driver_long: string | null;
  driver_name: string;
  driver_number: string;
  tracker_id: string;
  items: CurrentOrderItem[];
}

export type CurrentOrdersResponse = CurrentOrder[];
