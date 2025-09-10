// 'use client'

// import { useQuery } from '@tanstack/react-query'


// export const useProducts = (params?: {
//   page?: number
//   limit?: number
//   category?: string
//   search?: string
// }) => {
//   return useQuery({
//     queryKey: ['products', params],
//     queryFn: () => productsApi.getProducts(params),
//     // keepPreviousData: true,
//   })
// }

// export const useProduct = (sku: string) => {
//   return useQuery({
//     queryKey: ['product', sku],
//     queryFn: () => productsApi.getProduct(sku),
//     enabled: !!sku,
//   })
// }

// export const useInfiniteProducts = (params?: {
//   limit?: number
//   category?: string
//   search?: string
// }) => {
//   return useInfiniteQuery({
//     queryKey: ['products', 'infinite', params],
//     queryFn: ({ pageParam = 1 }) =>
//       productsApi.getProducts({ ...params, page: pageParam }),
//     getNextPageParam: (lastPage) => {
//       if (lastPage.page < lastPage.totalPages) {
//         return lastPage.page + 1
//       }
//       return undefined
//     },
//   })
// }

// export const useCategories = () => {
//   return useQuery({
//     queryKey: ['categories'],
//     queryFn: productsApi.getCategories,
//     staleTime: 10 * 60 * 1000, // 10 minutes
//   })
// }