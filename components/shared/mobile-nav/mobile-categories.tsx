"use client";

import { useAllCategoriesWithSubCategories } from "@/hooks/useAllCategoriesWithSubCategories";
import { CategoriesWithSubCategories, SectionItem } from "@/types";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { cn, slugify } from "@/lib/utils";
import placeholderImage from "@/public/images/placeholder.jpg";
import { useLocale } from "@/hooks/useLocale";

interface MobileCategoriesProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileCategories = ({ isOpen, onClose }: MobileCategoriesProps) => {
    const { data: categories, isLoading } = useAllCategoriesWithSubCategories();
    const [selectedCategory, setSelectedCategory] = useState<CategoriesWithSubCategories | null>(null);
    const { locale } = useLocale();

    // Filter only main categories (level 2)
    const mainCategories = useMemo(() => categories?.filter((cat) => cat.level === 2) || [], [categories]);

    // Set default selected category when data loads or opens
    useEffect(() => {
        if (isOpen && mainCategories.length > 0 && !selectedCategory) {
            setSelectedCategory(mainCategories[0]);
        }
    }, [isOpen, mainCategories, selectedCategory]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
            {/* Header */}


            {/* Body */}
            <div className="flex flex-1 overflow-hidden pb-14">
                {/* Left Column: Main Categories */}
                <div className="w-[30%] overflow-y-auto border-r bg-gray-50">
                    {isLoading ? (
                        <div className="p-4 text-center">Loading...</div>
                    ) : (
                        mainCategories.map((category) => (
                            <button
                                title={category.title}
                                aria-label={category.title}
                                key={category.id}
                                onClick={() => setSelectedCategory(category)}
                                className={cn(
                                    "w-full px-2 py-2 text-xs font-medium text-center border-b last:border-b-0 transition-colors flex  items-center gap-2 flex-row",
                                    selectedCategory?.id === category.id
                                        ? "bg-white  border-l-4 border-l-pink-600"
                                        : "text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                {category.image ? (
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_CATEGORY_IMAGE_URL}/${category.image}`}
                                        alt={category.title}
                                        width={40}
                                        height={40}
                                        className="object-contain"
                                    />
                                ) : null}
                                <span>{category.title}</span>
                            </button>
                        ))
                    )}
                </div>

                {/* Right Column: Subcategories */}
                <div className="w-[70%] overflow-y-auto bg-white py-4 px-2">
                    {selectedCategory ? (
                        <div className="space-y-6">
                            {/* Banner/Header for selected category */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-lg">{selectedCategory.title}</span>
                                <Link
                                    href={`/${locale}/${getSelectedCategorySlug(selectedCategory)}`}
                                    onClick={onClose}
                                    className="text-xs text-pink-600 underline"
                                >
                                    View All
                                </Link>
                            </div>

                            {/* Subcategories Grid/List */}
                            {/* I want to check if selected category has 3rd level categories then flex else grid */}
                            {selectedCategory.section && selectedCategory.section.length > 0 ? (
                                <div className={cn(" gap-4", selectedCategory.section.some((sub) => sub.section && sub.section.length > 0) ? "flex flex-col" : "grid grid-cols-3")}>
                                    {selectedCategory.section.map((sub: SectionItem) => {
                                        const subHref = `/${locale}/${getLinkHref(selectedCategory, sub)}`;

                                        // Check for nested children (Level 3)
                                        const hasChildren = sub.section && sub.section.length > 0;

                                        return (

                                            <div key={sub.id} className="flex flex-col gap-2">
                                                {/* Parent Subcategory (Level 2) */}
                                                {
                                                    !hasChildren && (
                                                        <Link
                                                            href={subHref}
                                                            onClick={onClose}
                                                            className="flex flex-col items-center text-center gap-2 p-2 rounded-lg hover:bg-gray-50 bg-gray-50/50"
                                                        >
                                                            <div className="w-full aspect-square relative bg-white rounded-md overflow-hidden p-2">
                                                                <Image
                                                                    src={sub.image ? `${process.env.NEXT_PUBLIC_CATEGORY_IMAGE_URL}/${sub.image}` : placeholderImage}
                                                                    alt={sub.title}
                                                                    fill
                                                                    className="object-contain"
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium line-clamp-2">{sub.title}</span>
                                                        </Link>
                                                    )
                                                }

                                                {/* Nested Subcategories (Level 3) List */}
                                                {hasChildren && (
                                                    <div>
                                                        <Link
                                                            href={subHref}
                                                            onClick={onClose}
                                                            className="flex flex-col items-center text-center gap-2 p-2 rounded-lg hover:bg-gray-50 bg-gray-50/50"
                                                        >
                                                            <span className="text-xs font-medium line-clamp-2">{sub.title}</span>
                                                        </Link>

                                                        <div className="flex flex-col gap-1 pl-2 border-l-2 border-gray-100">
                                                            {sub.section!.map((child: SectionItem) => {
                                                                const childHref = `/${locale}/${getChildLinkHref(selectedCategory, sub, child)}`;
                                                                return (
                                                                    <Link
                                                                        key={child.id}
                                                                        href={childHref}
                                                                        onClick={onClose}
                                                                        className="text-[10px] text-gray-500 hover:text-pink-600 text-left py-0.5 line-clamp-1"
                                                                    >
                                                                        {child.title}
                                                                    </Link>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center mt-10">No subcategories found.</p>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select a category
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper to construct URLs compatible with the existing routing logic
function getLinkHref(parent: CategoriesWithSubCategories, child: SectionItem) {
    // Structure: /parent-slug/child-slug
    const parentSlug = parent.slug || slugify(parent.title);
    const childSlug = child.slug || slugify(child.title);
    return `${parentSlug}/${childSlug}`;
}

function getChildLinkHref(parent: CategoriesWithSubCategories, child: SectionItem, grandChild: SectionItem) {
    // Structure: /parent-slug/child-slug/grand-child-slug
    const parentSlug = parent.slug || slugify(parent.title);
    const childSlug = child.slug || slugify(child.title);
    const grandChildSlug = grandChild.slug || slugify(grandChild.title);
    return `${parentSlug}/${childSlug}/${grandChildSlug}`;
}

function getSelectedCategorySlug(category: CategoriesWithSubCategories) {
    return category.slug || slugify(category.title);
}

export default MobileCategories;