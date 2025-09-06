import ProductCard from "@/components/shared/product/productCard";
import { getAllProducts } from "@/lib/actions/product";

const CatalogPage = async () => {
  const allProducts = await getAllProducts();
  return (
    <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2  gap-4 p-4 lg:p-10 mx-auto">
      {allProducts.map((product) => (
        <ProductCard key={product.sku} product={product} />
      ))}
    </div>
  );
};

export default CatalogPage;
