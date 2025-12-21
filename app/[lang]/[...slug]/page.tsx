"use client";

import { use } from "react";
import { useCategoryProducts } from "@/hooks/useCategoryProducts";
import getCategoryIdFromSlug from "@/lib/getCategoryIdFromSlug";
import { CatalogProduct } from "@/types";
import CatalogProductCard from "@/components/shared/product/catalogProductCard";
import PageContainer from "@/components/pageContainer";
import Heading from "@/components/heading";
import { Breadcrumbs } from "@/components/breadcurmbsComp";
import { useAllCategoriesWithSubCategories } from "@/hooks/useAllCategoriesWithSubCategories";
import { slugify } from "@/lib/utils";
import { CategoriesWithSubCategories } from "@/types";
import ProductDetailView from "@/components/shared/product/ProductDetailView";

export default function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = use(params);
    // Convert generic slug to string array for easier handling if it isn't already (though Next.js ensures it is for [...slug])
    const slugArray = Array.isArray(slug) ? slug : [slug];
    const currentSlug = slugArray[slugArray.length - 1];

    // 1. Try to get ID from the last segment of the slug directly (e.g. legacy logic)
    let categoryId = getCategoryIdFromSlug(currentSlug);

    // 2. If no ID found, look it up from the full category list
    const { data: allCategories, isLoading: isCategoriesLoading } = useAllCategoriesWithSubCategories();

    console.log("DEBUG: CatchAllPage params", { slug, currentSlug });
    console.log("DEBUG: allCategories loaded?", !!allCategories, "Count:", allCategories?.length);
    if (allCategories && allCategories.length > 0) {
        console.log("DEBUG: First Category Sample:", allCategories[0].title, "Slug:", allCategories[0].slug);
    }

    // Recursive Finder that returns the chain of categories matching the last slug
    const findCategoryChain = (
        categories: CategoriesWithSubCategories[],
        targetSlug: string
    ): CategoriesWithSubCategories[] | undefined => {
        for (const cat of categories) {
            // Use property slug if available (populated by hook), otherwise fallback to legacy check
            const catSlug = cat.slug || slugify(cat.title);
            // console.log(`DEBUG: Checking ${cat.title} (slug: ${catSlug}) against ${targetSlug}`);
            if (catSlug === targetSlug) {
                console.log("DEBUG: MATCH FOUND!", cat.title);
                return [cat];
            }
            if (cat.section) {
                const subChain = findCategoryChain(cat.section, targetSlug);
                if (subChain) {
                    return [cat, ...subChain];
                }
            }
        }
        return undefined;
    }

    // Determine if it matches a category
    let isCategory = false;
    let categoryData: CategoriesWithSubCategories | undefined;
    const breadcrumbs = [{ label: "Home", href: "/" }];

    // We check if it is a category
    if (categoryId && !allCategories) {
        // We have an ID from legacy map, assume category
        isCategory = true;
    } else if (allCategories) {
        const chain = findCategoryChain(allCategories, currentSlug);
        if (chain) {
            isCategory = true;
            categoryData = chain[chain.length - 1];
            if (!categoryId) categoryId = Number(categoryData.id);

            // Build Breadcrumbs from validity chain
            let currentPath = "";
            chain.forEach((cat) => {
                const s = slugify(cat.title);
                currentPath += `/${s}`;
                breadcrumbs.push({ label: cat.title, href: currentPath });
            });
        }
    }

    // If categories are loading, we show loading
    if (isCategoriesLoading && !categoryId) {
        return <div>Loading...</div>;
    }

    // If it IS a category, render category view
    // If it IS a category, render category view
    // CRITICAL FIX: Only render as category if:
    // 1. It matched the category tree (isCategory = true)
    // 2. OR we don't have the category tree yet (or failed to load) but have a legacy ID (fallback)
    // Do NOT render as category if we have the tree and it didn't match (meaning it's likely a product)
    const isValidCategory = isCategory || (categoryId && !allCategories);

    if (isValidCategory) {
        return (
            <CategoryView
                categoryId={Number(categoryId)}
                breadcrumbs={breadcrumbs}
                displayTitle={currentSlug.replace(/-?\d+$/, "").replace(/-/g, " ")}
                currentPath={breadcrumbs[breadcrumbs.length - 1]?.href || "/"}
            />
        );
    }

    // Otherwise, assume Product View
    const productBreadcrumbs = [{ label: "Home", href: "/" }];

    // Always generate breadcrumbs from segments, enriching with titles if available
    if (slugArray.length > 1) {
        let currentPath = "";
        let currentLevelCategories = allCategories || [];

        // Iterate all segments except the last one (product)
        for (let i = 0; i < slugArray.length - 1; i++) {
            const segment = slugArray[i];
            currentPath += `/${segment}`;

            // Find category matches segment if we have data
            let matchedCategory: CategoriesWithSubCategories | undefined;
            if (currentLevelCategories.length > 0) {
                matchedCategory = currentLevelCategories.find(c => slugify(c.title) === segment);
            }

            if (matchedCategory) {
                productBreadcrumbs.push({ label: matchedCategory.title, href: currentPath });
                // Prepare for next iteration
                currentLevelCategories = matchedCategory.section || [];
            } else {
                // Fallback: Use segment as label
                const segmentLabel = segment.replace(/-/g, " ");
                productBreadcrumbs.push({ label: segmentLabel, href: currentPath });
                // If we lose the chain, we can't look up deeper levels properly, but we continue generating links
                currentLevelCategories = [];
            }
        }
    }

    return (
        <ProductDetailView productSlug={currentSlug} breadcrumbs={productBreadcrumbs} />
    );
}

function CategoryView({ categoryId, breadcrumbs, displayTitle, currentPath }: { categoryId: number, breadcrumbs: any[], displayTitle: string, currentPath: string }) {
    const { data, isLoading: isProductsLoading, error } = useCategoryProducts(categoryId);

    if (isProductsLoading) return <div>Loading products...</div>;
    if (error) return <div>Failed to load products</div>;

    return (
        <PageContainer>
            <Breadcrumbs items={breadcrumbs.length > 1 ? breadcrumbs : [
                { label: "Home", href: "/" },
                { label: displayTitle },
            ]} />
            <Heading level={1} className="text-2xl font-bold mb-4 capitalize" title={displayTitle}>{displayTitle} waseem</Heading>
            <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2  gap-4 lg:pb-4 pb-2">
                {data?.items?.map((product: CatalogProduct) => (
                    <CatalogProductCard key={product.id} product={product} categoryPath={currentPath} />
                ))}
            </div>
        </PageContainer>
    );
}
