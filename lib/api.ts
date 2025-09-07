import axios from "axios";
import { ProductRecommendationResponse } from "@/types/index";

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
