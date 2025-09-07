import axios from "axios";
import { ProductType } from "@/types/index";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 10000,
});
// Add request interceptor for auth if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
export const productsApi = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<{
    products: ProductType[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  getProduct: async (sku: string): Promise<ProductType> => {
    const response = await api.get(`/products/${sku}`);
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await api.get("/categories");
    return response.data;
  },
};
