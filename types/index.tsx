import { StaticImageData } from "next/image";

export type ProductType = {
  sku: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  images: string[];
  regularPrice: string; // You may want to change this to `number` depending on how price is handled
  brand?: string;
  rating?: number;
  numReviews?: number;
  stock?: number;
  isFeatured?: boolean;
  banner?: unknown; // Adjust type as necessary
  deliveryType: string; // Expand this if there are other types
};
export interface CartItemType {
  product: CatalogProduct;
  quantity: number;
}
// new types can be added here as needed
// types/product.ts


export interface ProductRecommendationResponse {
  buywith: {
    items: Product[];
  };
  related: {
    items: Product[];
  };
}
export interface BestSellerProductType {
  items: Product[];
}
export interface ProductResponse {
  items: Product[];
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  special_price?: number;
  attribute_set_id: number;
  price: number;
  status: number;
  visibility: number;
  type_id: string;
  created_at: string;
  updated_at: string;
  weight: number;
  extension_attributes: ExtensionAttributes;
  product_links: string[];
  options: string[];
  media_gallery_entries: MediaGalleryEntry[];
  tier_prices: string[];
  custom_attributes: CustomAttribute[];
}

export interface ExtensionAttributes {
  website_ids: number[];
  category_links: CategoryLink[];
  ah_qty: number;
  ah_max_qty: number;
  ah_min_qty: number;
  ah_is_in_stock: number;
  percentage_value: string;
}

export interface CategoryLink {
  position: number;
  category_id: string;
}

export interface MediaGalleryEntry {
  id: number;
  media_type: string;
  label: unknown;
  position: number;
  disabled: boolean;
  types: string[];
  file: string;
}

export interface CustomAttribute {
  attribute_code: string;
  value: string | string[];
}
export type BannersData = {
  banner_id: string;
  url_banner: string;
  mobile_image: string;
  image: string;
  mobile_app_image?: string;
  category_id?: string;
  default_header?: "string";
  color_code?: string;
};
export type BannersType = BannersData[]

export type CategoryData = {
  category_id: number;
  name: string;
  url: string;
  image?: string;
  image_url?: string | StaticImageData;
  banner_image?: string | StaticImageData;
  banner_image_url?: string | StaticImageData;
  is_hide: boolean;
  position: number;
  is_zone_hide: boolean;
}
export type CategoriesType = CategoryData[]

export interface ProductRequestBody {
  // page: number;
  // limit: number;
  // filters: {
  //   method?: string;
  //   code?: string;
  //   options?: number[];
  // }[];
  limit: number;
  page: number;
  category_id: number[];
  method: string;
  filters?: any[];
}
export interface ConfigAttribute {
  id: string;
  code: string;
  label: string;
  value: string;
}

export interface ConfigurableProductVariant {
  sku: string;
  price: string;
  special_price: string | null;
  config_attributes: ConfigAttribute[];
  images: { id: number; url: string }[];
}

export interface CatalogProduct {
  type_id: string;
  id: string | number;
  sku: string;
  name: string;
  image?: string;
  thumbnail?: string;
  price: number;
  special_price?: number | null;
  manufacturer: string;
  min_qty?: number;
  max_qty?: number;
  qty?: number;
  is_saleable?: boolean;
  available_qty?: number;
  left_qty?: number;
  is_sold_out?: boolean;
  uom?: string | null;
  weight?: string;
  is_configurable?: boolean;
  percentage?: number | null;
  configurable_data?: ConfigurableProductVariant[];
}
export interface PlaceOrderRequest {
  comment: string;
  customerId: string;
  delivery_date: string;
  delivery_time: string;
  isUser: boolean;
  orderSource: string;
  paymentMethod: string;
  quoteId: string;
  addressId?: number;
}
export type {
  CartItem,
  CartApiResponse,
  GuestCartApiResponse
} from "./cart.types";
export interface SectionItem {
  id: string
  title: string
  image: string
  parent_id: string
  level: number
  position: number
  is_active: 0 | 1
  section: SectionItem[]
  sub_section?: boolean
  slug?: string
}
export interface CategoriesWithSubCategories {
  id: string
  title: string
  image: string
  parent_id: string
  level: number
  position: number
  is_active: number
  section: SectionItem[]
  sub_section?: boolean
  slug?: string
}

export interface Brand {
  id: string | number;
  name: string;
  value: string | number;
  logo?: string;
  description?: string;
}

export interface BrandsResponse {
  items: Brand[];
}

export interface ProductDetailPageType {
  is_in_stock: number;
  stock_status: string;
  saleable_qty: number;
  min_qty: number;
  max_qty: number;
  source: string;
  zone: string;
  left_qty: number | null;
  id: string;
  sku: string;
  name: string;
  attribute_set_id: string;
  price: number;
  status: string;
  visibility: string;
  type_id: string;
  created_at: string;
  updated_at: string;
  weight: string;
  special_price: number | null;
  url_key: string;
  vendor_name: string;
  swatch_image: string;
  item_number: string;
  delivery_type: string;
  is_produce: string;
  required_options: string;
  has_options: string;
  uom_erp: string;
  category_ids: string[];
  manufacturer: string;
  is_returnable?: string;
  meta_description?: string;
  meta_keyword?: string;
  meta_title?: string;
  category_links: {
    position: number;
    category_id: string;
  }[];
  images: {
    id: string;
    label: string | null;
    file: string;
  }[];
  ah_qty: number;
  ah_max_qty: number;
  ah_min_qty: number;
  ah_is_in_stock: number;
  percentage_value: string;
  country_of_manufacture: string | null;
  specifications: {
    label: string;
    value: string;
  }[];
  options: any[];
  related_products: CatalogProduct[];
  bought_together: CatalogProduct[];
  is_configured?: boolean;
  configured_data?: ConfigurableProductVariant[];
  is_configurable?: boolean;
  configurable_data?: ConfigurableProductVariant[];
  short_description?: string;
}