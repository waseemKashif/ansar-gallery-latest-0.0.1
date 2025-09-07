"use client"
import ProductCard from "@/components/shared/product/productCard";
import { getAllProducts } from "@/lib/actions/product";
import { fetchProductRecommendations } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
const CatalogPage = () => {
  // const allProducts = await getAllProducts();
   const { data, isLoading, error, refetch } = useQuery({
     queryKey: ["product-recommendations"],
     queryFn: fetchProductRecommendations,
     retry: 1,
   });
      if (isLoading) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading SKU data...</p>
            </div>
          </div>
        );
      }
     if (!data) {
       return (
         <div className="flex items-center justify-center min-h-screen">
           <p className="text-gray-600">No data available</p>
         </div>
       );
     }
    
  return (
    <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2  gap-4 p-4 lg:p-10 mx-auto">
      {/* {allProducts.map((product) => (
        <ProductCard key={product.sku} product={product} />
      ))} */}

      {data.buywith.items.length > 0 ? (
        <div className="space-y-3">
          {data.buywith.items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
            >
              <div>
                
                <p className="text-sm text-gray-600 mt-1 truncate max-w-[200px]">
                  {item.name}
                </p>
                <Image src={item.media_gallery_entries[0].file} alt={item.name} width={400} height={400}/>
              </div>
              <span className="text-xs text-gray-500">#{index + 1}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No buy with items found
        </p>
      )}
    </div>
  );
};

export default CatalogPage;
