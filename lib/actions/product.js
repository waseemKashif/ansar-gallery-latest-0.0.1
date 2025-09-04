import allProduct from "@/database/sample-data"
export async function getAllProducts() {
    const products = await allProduct.products;
    return products;
  }

  export async function getProductById(slug) {
    const product = await allProduct.products.find((product)=> product.slug === slug)
    return product;
  }