import ProductCard from "@/components/shared/product/productCard";
import { getAllProducts } from "@/lib/actions/product";
//
import { useState } from "react";
import { useProducts } from "@/hooks/use-products";

const CatalogPage = () => {
  const [page, setPage] = useState(1);
  const limit = 12;

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    // refetch: refetchProducts,
  } = useProducts({ page, limit });

  if (productsError) {
    return <div>Error loading products</div>;
  }
  if (!productsData || productsData.products.length === 0) {
    return <div>No products found</div>;
  }

  // const allProducts =  getAllProducts();
  return (
    <>
      {productsLoading ? (
        <div>Loading products...</div>
      ) : (
        <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2  gap-4 p-4 lg:p-10 mx-auto">
          {productsData?.products.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      )}
    </>
  );
};

export default CatalogPage;
