import { Metadata } from 'next';
import BrandClient from './BrandClient';
import { Brand } from '@/types';

// Helper function to make slug (duplicated here for server-side logic)
function makeSlug(name: string): string {
  return name.toLowerCase().replace(/[\s/]+/g, "-");
}

async function getBrandData(locale: string, slug: string): Promise<Brand | null> {
  try {
    const res = await fetch(`https://www.ansargallery.com/${locale}/rest/V1/brands`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const brands = data.brands || [];

    return brands.find((brand: Brand) =>
      (brand.url_key && brand.url_key === slug) || makeSlug(brand.name) === slug
    ) || null;
  } catch (error) {
    console.error("Error fetching brand metadata:", error);
    return null;
  }
}

type Props = {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  props: Props,
): Promise<Metadata> {
  const params = await props.params;
  const { lang, slug } = params;

  // Default metadata
  const defaultMeta = {
    title: 'Brand Details - Ansar Gallery',
    description: 'Browse products from top brands at Ansar Gallery.',
  };

  const brand = await getBrandData(lang, slug);

  if (!brand) {
    return defaultMeta;
  }

  return {
    title: brand.meta_title || brand.name || defaultMeta.title,
    description: brand.meta_description || brand.short_description || defaultMeta.description,
    keywords: brand.meta_key || undefined,
    openGraph: {
      title: brand.meta_title || brand.name,
      description: brand.meta_description || brand.short_description,
      images: brand.image ? [brand.image] : (brand.logo ? [brand.logo] : undefined),
    },
  };
}

export default function BrandPage() {
  return <BrandClient />;
}
