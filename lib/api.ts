import axios from "axios";
import { BestSellerProductType, ProductRecommendationResponse } from "@/types/index";
import { Product } from "@/types/index";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchProductRecommendations =
  async (): Promise<ProductRecommendationResponse> => {
    const response = await api.get<ProductRecommendationResponse>("/products");
    return response.data;
  };
export const fetchProductBySku = async (slug:string): Promise<Product> => {
  console.log("came here bro" ,slug)
  const response = await api.get<Product>(`/product/${slug}`);
  return response.data;
};
export const fetchBestSellerProducts = async (): Promise<BestSellerProductType> => {
  const response = await api.get<BestSellerProductType>(`/bestSeller`);
  return response.data;
};
export const fetchProductRecommendationsLTS = async (
  slug: string|undefined
): Promise<ProductRecommendationResponse> => {
  const response = await api.get<ProductRecommendationResponse>(`/products/${slug}`);
  return response.data;
};