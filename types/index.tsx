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
