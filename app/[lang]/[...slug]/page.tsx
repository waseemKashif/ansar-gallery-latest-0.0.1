
import { Metadata } from "next";
import { getSafeLegacyCategoryId } from "@/lib/getCategoryIdFromSlug";
import { fetchCategoriesServer, fetchProductServer, findCategoryChain } from "@/lib/metadata-server";
import CatchAllPageClient from "@/components/shared/CatchAllPageClient";

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
        // We can just format the slug as title if we don't have the full category name easily without fetching
        // But since it's legacy, we generally know it matches.
        const title = currentSlug.replace(/-?\d+$/, "").replace(/-/g, " ");
        // Capitalize
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

    // 3. Fallback to Product
    let productTitle = currentSlug.replace(/-/g, " ");
    const product = await fetchProductServer(currentSlug, lang);
    if (product && product.name) {
        productTitle = product.name;
    } else {
        // Capitalize fallback
        productTitle = productTitle.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return {
        title: productTitle,
    };
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    return <CatchAllPageClient slug={slug} />;
}
