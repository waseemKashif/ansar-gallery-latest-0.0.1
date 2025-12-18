import axios from "axios";
import {
  BannersType,
  BestSellerProductType,
  ProductRecommendationResponse,
  CategoryData,
  ProductRequestBody,
  PlaceOrderRequest,
  CategoriesWithSubCategories,
  BrandsResponse,
} from "@/types/index";
import { Product } from "@/types/index";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchProductBySku = async (slug: string): Promise<Product> => {
  console.log("came here bro", slug);
  const response = await api.get<Product>(`/product/${slug}`);
  return response.data;
};
export const fetchBestSellerProducts =
  async (zone?: string | null): Promise<BestSellerProductType> => {
    const url = zone ? `/bestSeller?zone=${zone}` : `/bestSeller`;
    const response = await api.get<BestSellerProductType>(url);
    return response.data;
  };
export const fetchProductRecommendations = async (
  slug: string | undefined
): Promise<ProductRecommendationResponse> => {
  const response = await api.get<ProductRecommendationResponse>(
    `/products/${slug}`
  );
  return response.data;
};

export const fetchBanners = async (zone?: string | null): Promise<BannersType> => {
  const url = zone ? `/banners?zone=${zone}` : `/banners`;
  const response = await api.get(url);
  return response.data;
};

export const fetchHomepageCategories =
  async (): Promise<CategoryData[]> => {
    const response = await api.get<CategoryData[]>(`/homepageCategories`);
    return response.data;
  };
export const fetchCategoryProducts = async (categoryId: number, page = 1, limit = 30) => {
  const body: ProductRequestBody = {
    page: page,
    limit: limit,
    category_id: [categoryId],
    method: "catalog_list", // "promotion", "new_arrival"
    filters: []
    // page,
    // limit,
    // filters: [
    //   { method: "catalog_list" },
    //   {
    //     code: "category",
    //     options: [categoryId],
    //   }
    // ]


  };

  const response = await api.post("/categoryProducts", body);
  return response.data;
};

export const fetchAllCategoriesWithSubCategories = async (zone?: string | null): Promise<CategoriesWithSubCategories[]> => {
  const url = zone ? `/allCategoriesWithSubCategories?zone=${zone}` : `/allCategoriesWithSubCategories`;
  const response = await api.get<CategoriesWithSubCategories[]>(url);
  return response.data;
};

export const fetchBrands = async (zone?: string | null): Promise<BrandsResponse> => {
  const url = zone ? `/brands?zone=${zone}` : `/brands`;
  const response = await api.get<BrandsResponse>(url);
  return response.data;
};
