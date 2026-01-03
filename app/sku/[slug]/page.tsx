"use client";

import { Product } from "@/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SkuDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true);

  // Extract SKU from slug like "name-sku"
  const rawSku = slug?.split("-").pop();
  const sku = rawSku?.replace(/_/g, "-");

  useEffect(() => {
    console.log("hereeeee");
    if (!sku) return;

    const fetchProduct = async () => {
      try {

        const res = await fetch(`/api/product/${sku}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [sku]);

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <p className="text-gray-700 mb-2">SKU: {product.sku}</p>
      <p className="text-gray-900 font-semibold mb-6">Price: {product.price}</p>
      <pre className="bg-gray-100 p-4 rounded text-sm">
        {JSON.stringify(product, null, 2)}
      </pre>
    </div>
  );
}
