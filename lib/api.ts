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
import { Product, ProductDetailPageType } from "@/types/index";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchProductBySku = async (slug: string, locale: string): Promise<Product> => {
  const response = await api.get<Product>(`/${locale}/product/${slug}`);
  return response.data;
};

export const fetchProductDetailsApi = async (slug: string, locale: string): Promise<ProductDetailPageType> => {
  const response = await api.get<ProductDetailPageType>(`/${locale}/product/${slug}`);
  return response.data;
};
export const fetchBestSellerProducts =
  async (zone?: string | null): Promise<BestSellerProductType> => {
    const url = zone ? `/bestSeller?zone=${zone}` : `/bestSeller`;
    const response = await api.get<BestSellerProductType>(url);
    return response.data;
  };
export const fetchProductRecommendations = async (
  slug: string | undefined,
  locale: string
): Promise<ProductRecommendationResponse> => {
  const response = await api.get<ProductRecommendationResponse>(
    `/${locale}/products/${slug}`
  );
  return response.data;
};

export const fetchBanners = async (locale: string, zone?: string | null): Promise<BannersType> => {
  const url = zone ? `/${locale}/banners?zone=${zone}` : `/${locale}/banners`;
  const response = await api.get(url);
  return response.data;
};

export const fetchHomepageCategories =
  async (locale: string, zone?: string | null): Promise<CategoryData[]> => {
    const response = await api.get<CategoryData[]>(`/${locale}/homepageCategories?zone=${zone}`);
    return response.data;
  };
export const fetchCategoryProducts = async (categoryId: number, page = 1, limit = 30, locale: string) => {
  const body: ProductRequestBody = {
    page: page,
    limit: limit,
    category_id: [categoryId],
    method: "catalog_list", // "promotion", "new_arrival"
    filters: []
  };
  const url = `${locale}/categoryProducts`;
  const response = await api.post(url, body);
  return response.data;
};

export const fetchAllCategoriesWithSubCategories = async (
  zone?: string | null,
  locale: string = "en"
): Promise<CategoriesWithSubCategories[]> => {
  // Locale is now part of the URL path
  const url = zone
    ? `/${locale}/allCategoriesWithSubCategories?zone=${zone}`
    : `/${locale}/allCategoriesWithSubCategories`;

  const response = await api.get<CategoriesWithSubCategories[]>(url);
  return response.data;
};

export const fetchBrands = async (zone?: string | null): Promise<BrandsResponse> => {
  const url = zone ? `/brands?zone=${zone}` : `/brands`;
  const response = await api.get<BrandsResponse>(url);
  return response.data;
};

export const fetchBrandProducts = async (manufacturerId: string | number, page = 1, limit = 30, zone?: string | null) => {
  const body: ProductRequestBody = {
    page: page,
    limit: limit,
    category_id: [], // Empty category_id for brand-only filtering
    method: "catalog_list",
    filters: [
      {
        code: "manufacturer",
        options: [manufacturerId],
      },
    ],
  };

  const url = zone ? `/categoryProducts?zone=${zone}` : `/categoryProducts`;
  const response = await api.post(url, body);
  return response.data;
};
