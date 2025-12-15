// app/categories/[slug]/page.tsx

"use client";

import { use } from "react";
import { useCategoryProducts } from "@/hooks/useCategoryProducts";
import getCategoryIdFromSlug from "@/lib/getCategoryIdFromSlug";
import { CatalogProduct } from "@/types";
import CatalogProductCard from "@/components/shared/product/catalogProductCard";
import PageContainer from "@/components/pageContainer";
import Heading from "@/components/heading";
import { Breadcrumbs } from "@/components/breadcurmbsComp";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    // Convert the URL slug → category ID
    const categoryId = getCategoryIdFromSlug(slug);
    console.log("the slug is", slug);
    console.log("the category id is", categoryId);
    const { data, isLoading, error } = useCategoryProducts(Number(categoryId));

    if (isLoading) return <div>Loading products...</div>;
    if (error) return <div>Failed to load products</div>;

    // Clean slug for display: remove trailing ID and hyphens
    const displayTitle = slug.replace(/-?\d+$/, "").replace(/-/g, " ");

    return (
        <PageContainer>
            <Breadcrumbs items={[
                { label: "Home", href: "/" },
                { label: displayTitle },
            ]} />
            <Heading level={1} className="text-2xl font-bold mb-4 capitalize" title={displayTitle}>{displayTitle}</Heading>
            <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-3 grid-cols-2  gap-4">
                {data?.items?.map((product: CatalogProduct) => (
                    <CatalogProductCard key={product.id} product={product} />
                ))}
            </div>
        </PageContainer>
    );
}
