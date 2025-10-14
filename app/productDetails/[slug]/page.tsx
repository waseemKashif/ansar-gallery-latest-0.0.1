
import { Metadata } from "next";
import ProductDetailsPage from "../productDetailsPage";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;

  const productName =
    slug.charAt(0).toUpperCase() +
    slug.slice(1).replace(/-/g, " ").split(" ").slice(0, -1).join(" ");

  const title = `${productName} | Ansar Gallery`;
  const description = `Buy ${productName} at the best price on Ansar Gallery. Fast delivery, secure checkout, and quality guaranteed.`;

  const imageUrl = `https://media-qatar.ansargallery.com/catalog/product/${slug}.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://ansargallery.com/products/${slug}`,
   
    //   type: "product" as any, // 👈 bypass typing
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: productName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://ansargallery.com/products/${slug}`,
    },
  };
}

export default function Page({ params }: Props) {
  return <ProductDetailsPage slug={params.slug} />;
}
