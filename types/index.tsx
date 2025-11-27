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
type BannersData = {
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

export type SubCategoriesData = {
  label: string;
  subCategories: {
    title: string;
    id: number;
    image: string;
    url: string;
  }[];
  mainLink: string;
}

export interface ProductRequestBody {
  page: number;
  limit: number;
  filters: {
    method?: string;
    code?: string;
    options?: number[];
  }[];
}
export interface CatalogProduct {
  type_id: string;
  id: string | number;
  sku: string;
  name: string;
  image?: string;
  thumbnail?: string;
  price: number;
  special_price: number | null;
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
  configurable_data?: unknown[];
}