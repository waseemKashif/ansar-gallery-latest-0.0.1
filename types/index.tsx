export type ProductType = {
  sku: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  images: string[];
  regularPrice: string; // You may want to change this to `number` depending on how price is handled
  brand: string;
  rating: number;
  numReviews: number;
  stock: number;
  isFeatured: boolean;
  banner: string;
  deliveryType: "EXP" | "NOL" | "SUP"; // Expand this if there are other types
};