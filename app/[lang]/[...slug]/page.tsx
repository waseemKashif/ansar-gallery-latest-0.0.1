import { Metadata } from "next";
import { getSafeLegacyCategoryId } from "@/lib/getCategoryIdFromSlug";
import { fetchCategoriesServer, fetchProductServer, findCategoryChain, fetchCategoryProductsServer } from "@/lib/metadata-server";
import { CategoriesWithSubCategories, CatalogProduct } from "@/types";
import CatchAllPageClient from "@/components/shared/CatchAllPageClient";
import { APP_NAME, DESCRIPTION } from "@/lib/constants";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface PageProps {
    params: Promise<{ slug: string[]; lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, lang } = await params;
    const slugArray = Array.isArray(slug) ? slug : [slug];
    const currentSlug = slugArray[slugArray.length - 1];

    // 1. Safe Legacy Check
    const safeLegacyId = getSafeLegacyCategoryId(currentSlug);
    if (safeLegacyId) {
        const title = currentSlug.replace(/-?\d+$/, "").replace(/-/g, " ");
        const formattedTitle = title.replace(/\b\w/g, (c) => c.toUpperCase());
        return {
            title: formattedTitle,
        };
    }

    // 2. Check Category Tree
    const allCategories = await fetchCategoriesServer(lang);
    if (allCategories && allCategories.length > 0) {
        const chain = findCategoryChain(allCategories, currentSlug);
        if (chain) {
            const category = chain[chain.length - 1];
            return {
                title: category.title,
            };
        }
    }

    // 3. Fallback to Product - Full SEO Metadata
    const product = await fetchProductServer(currentSlug, lang);

    if (product) {
        const title = product.meta_title || product.name || APP_NAME;
        const description = product.meta_description || DESCRIPTION;
        const keywords = product.meta_keyword
            ? product.meta_keyword.split(",").map((k: string) => k.trim())
            : [];
        const image = product.image || product.images?.[0]?.file || "";

        return {
            title,
            description,
            keywords: keywords.length > 0 ? keywords : undefined,
            openGraph: {
                title,
                description,
                type: "website",
                images: image ? [{ url: image, alt: product.name }] : undefined,
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: image ? [image] : undefined,
            },
            robots: {
                index: true,
                follow: true,
            },
        };
    }

    return {
        title: APP_NAME,
        description: DESCRIPTION,
    };
}

export default async function Page({ params }: PageProps) {
    const { slug, lang } = await params;

    // Prepare initial data for SSR
    const slugArray = Array.isArray(slug) ? slug : [slug];
    const currentSlug = slugArray[slugArray.length - 1];

    const initialData: {
        isCategory: boolean;
        allCategories?: CategoriesWithSubCategories[];
        categoryData?: CategoriesWithSubCategories;
        categoryId?: number;
        productSlug?: string;
        initialProductList?: { items: CatalogProduct[]; total_count: number } | null;
    } = { isCategory: false };

    // 1. Fetch Categories
    const allCategories = await fetchCategoriesServer(lang);
    initialData.allCategories = allCategories;

    // 2. Check logic 
    let isCategory = false;
    let categoryData;

    if (allCategories && allCategories.length > 0) {
        const chain = findCategoryChain(allCategories, currentSlug);
        if (chain) {
            isCategory = true;
            categoryData = chain[chain.length - 1];
        }
    }

    if (!isCategory) {
        // Fallback or Legacy check
        const safeLegacyId = getSafeLegacyCategoryId(currentSlug);
        if (safeLegacyId) {
            isCategory = true;
            initialData.categoryId = safeLegacyId;
        }
    }

    if (isCategory) {
        initialData.isCategory = true;
        let catId = initialData.categoryId;

        if (categoryData) {
            initialData.categoryData = categoryData;
            initialData.categoryId = Number(categoryData.id);
            catId = Number(categoryData.id);
        }

        // Fetch Initial Products for SSR logic
        if (catId) {
            const productList = await fetchCategoryProductsServer(catId, 1, 30, lang);
            initialData.initialProductList = productList;
        }

    } else {
        // Product Logic
        initialData.isCategory = false;
        initialData.productSlug = currentSlug;
    }

    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-10 w-10 animate-spin text-gray-500" /></div>}>
            <CatchAllPageClient slug={slug} initialData={initialData} />
        </Suspense>
    );
}
