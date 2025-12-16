
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

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    // 1. Try to get ID from slug directly (e.g. "mobile-phones-4") or legacy map
    let categoryId = getCategoryIdFromSlug(slug);

    // 2. If no ID found, we need to look it up from the full category list
    // because the URL might be just "mobile-phones" (clean URL)
    const { data: allCategories, isLoading: isCategoriesLoading } = useAllCategoriesWithSubCategories();

    if (!categoryId && allCategories) {
        const findCategoryBySlug = (categories: CategoriesWithSubCategories[]): number | undefined => {
            for (const cat of categories) {
                if (slugify(cat.title) === slug) return Number(cat.id);
                if (cat.section) {
                    const subId = findCategoryBySlug(cat.section);
                    if (subId) return subId;
                }
            }
            return undefined;
        };
        const foundId = findCategoryBySlug(allCategories);
        if (foundId) categoryId = foundId;
    }

    const { data, isLoading: isProductsLoading, error } = useCategoryProducts(Number(categoryId));

    // Loading states
    if (isProductsLoading && !categoryId && isCategoriesLoading) return <div>Loading...</div>; // Still searching for ID
    if (!categoryId && !isCategoriesLoading && !isProductsLoading) return <div>Category not found</div>;

    if (isProductsLoading) return <div>Loading products...</div>;
    if (error) return <div>Failed to load products</div>;

    // Clean slug for display
    const displayTitle = slug.replace(/-?\d+$/, "").replace(/-/g, " ");

    return (
        <PageContainer>
            <Breadcrumbs items={[
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
