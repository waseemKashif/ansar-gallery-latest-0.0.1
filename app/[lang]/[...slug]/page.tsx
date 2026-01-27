
import { Metadata } from "next";
import { getSafeLegacyCategoryId } from "@/lib/getCategoryIdFromSlug";
import { fetchCategoriesServer, fetchProductServer, findCategoryChain } from "@/lib/metadata-server";
import CatchAllPageClient from "@/components/shared/CatchAllPageClient";
import { APP_NAME, DESCRIPTION } from "@/lib/constants";

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

    // 3. Fallback to Product - Full SEO Metadata
    const product = await fetchProductServer(currentSlug, lang);

    if (product) {
        // Build comprehensive metadata from product response
        // Fallback to static Ansar Gallery metadata when product fields are missing
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

    // Fallback when product not found - use static Ansar Gallery metadata
    return {
        title: APP_NAME,
        description: DESCRIPTION,
    };
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    return <CatchAllPageClient slug={slug} />;
}
