
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

export default function CategoryPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = use(params);
    // Convert generic slug to string array for easier handling if it isn't already (though Next.js ensures it is for [...slug])
    const slugArray = Array.isArray(slug) ? slug : [slug];
    const currentSlug = slugArray[slugArray.length - 1];

    // 1. Try to get ID from the last segment of the slug directly (e.g. legacy logic)
    let categoryId = getCategoryIdFromSlug(currentSlug);

    // 2. If no ID found, look it up from the full category list
    const { data: allCategories, isLoading: isCategoriesLoading } = useAllCategoriesWithSubCategories();

    // Recursive Finder that returns the chain of categories matching the last slug
    // We only care if the last slug matches a category. 
    // Ideally we should verify the whole path matches the parent chain, 
    // but for now finding the leaf and reconstructing parents is a safer first step given potential data/slug mismatches.
    const findCategoryChain = (
        categories: CategoriesWithSubCategories[],
        targetSlug: string
    ): CategoriesWithSubCategories[] | undefined => {
        for (const cat of categories) {
            if (slugify(cat.title) === targetSlug) {
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

    const breadcrumbs = [{ label: "Home", href: "/" }];

    if (allCategories) {
        const chain = findCategoryChain(allCategories, currentSlug);

        if (chain) {
            const foundCategory = chain[chain.length - 1];
            if (!categoryId) {
                categoryId = Number(foundCategory.id);
            }

            // Build Breadcrumbs from validity chain
            let currentPath = "";
            chain.forEach((cat) => {
                const s = slugify(cat.title);
                currentPath += `/${s}`;
                breadcrumbs.push({ label: cat.title, href: currentPath });
            });
        } else if (categoryId) {
            // Fallback if we found ID via legacy but not in tree (rare) or tree loading
            // Just show the current slug title
            const displayTitle = currentSlug.replace(/-?\d+$/, "").replace(/-/g, " ");
            breadcrumbs.push({ label: displayTitle, href: "#" });
        }
    } else if (categoryId) {
        // Fallback if categories not loaded yet but we have ID
        const displayTitle = currentSlug.replace(/-?\d+$/, "").replace(/-/g, " ");
        breadcrumbs.push({ label: displayTitle, href: "#" });
    }


    const { data, isLoading: isProductsLoading, error } = useCategoryProducts(Number(categoryId));

    const displayTitle = currentSlug.replace(/-?\d+$/, "").replace(/-/g, " ");

    // Loading states
    if (isProductsLoading && !categoryId && isCategoriesLoading) return <div>Loading...</div>;
    if (!categoryId && !isCategoriesLoading && !isProductsLoading) return <div>Category not found</div>;

    if (isProductsLoading) return <div>Loading products...</div>;
    if (error) return <div>Failed to load products</div>;

    return (
        <PageContainer>
            <Breadcrumbs items={breadcrumbs.length > 1 ? breadcrumbs : [
                { label: "Home", href: "/" },
                { label: displayTitle },
            ]} />
            <Heading level={1} className="text-2xl font-bold mb-4 capitalize" title={displayTitle}>{displayTitle}</Heading>
            <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2  gap-4 lg:pb-4 pb-2">
                {data?.items?.map((product: CatalogProduct) => (
                    <CatalogProductCard key={product.id} product={product} />
                ))}
            </div>
        </PageContainer>
    );
}
