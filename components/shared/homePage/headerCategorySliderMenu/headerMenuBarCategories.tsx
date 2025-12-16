"use client";

import { useAllCategoriesWithSubCategories } from "@/hooks/useAllCategoriesWithSubCategories";
import { useState, useRef, useCallback, useEffect } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import Image from "next/image";
import placeHolderImage from "@/public/images/placeholder.jpg";
import getSlugFromMagentoUrl, { slugify } from "@/lib/utils";
import { useZoneStore } from "@/store/useZoneStore";
const HOVER_INTENT_DELAY = 200;

const DropDownCategoryMenu = () => {
    const { data, isLoading, error } = useAllCategoriesWithSubCategories();
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const { isLoading: isZoneLoading } = useZoneStore();

    const isMouseInCategory = useRef(false);
    const isMouseInDropdown = useRef(false);
    const hoverIntentTimeout = useRef<NodeJS.Timeout | null>(null);
    const closeTimeout = useRef<NodeJS.Timeout | null>(null);

    // Lock body scroll with scrollbar compensation
    useEffect(() => {
        if (activeCategory !== null) {
            // Calculate scrollbar width
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            // Apply styles to prevent layout shift
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;

            // Also apply to fixed header if you have one
            const header = document.querySelector('body');
            if (header) {
                (header as HTMLElement).style.paddingRight = `${scrollbarWidth}px`;
            }
        } else {
            // Remove styles
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';

            const header = document.querySelector('header');
            if (header) {
                (header as HTMLElement).style.paddingRight = '';
            }
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            const header = document.querySelector('header');
            if (header) {
                (header as HTMLElement).style.paddingRight = '';
            }
        };
    }, [activeCategory]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (hoverIntentTimeout.current) clearTimeout(hoverIntentTimeout.current);
            if (closeTimeout.current) clearTimeout(closeTimeout.current);
        };
    }, []);

    const checkShouldClose = useCallback(() => {
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
        }

        closeTimeout.current = setTimeout(() => {
            if (!isMouseInCategory.current && !isMouseInDropdown.current) {
                setActiveCategory(null);
            }
        }, 150);
    }, []);

    const handleCategoryEnter = useCallback((index: number) => {
        isMouseInCategory.current = true;

        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }

        if (hoverIntentTimeout.current) {
            clearTimeout(hoverIntentTimeout.current);
        }

        if (activeCategory !== null) {
            setActiveCategory(index);
            return;
        }

        hoverIntentTimeout.current = setTimeout(() => {
            if (isMouseInCategory.current) {
                setActiveCategory(index);
            }
        }, HOVER_INTENT_DELAY);
    }, [activeCategory]);

    const handleCategoryLeave = useCallback(() => {
        isMouseInCategory.current = false;

        if (hoverIntentTimeout.current) {
            clearTimeout(hoverIntentTimeout.current);
            hoverIntentTimeout.current = null;
        }

        checkShouldClose();
    }, [checkShouldClose]);

    const handleDropdownEnter = useCallback(() => {
        isMouseInDropdown.current = true;

        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }
    }, []);

    const handleDropdownLeave = useCallback(() => {
        isMouseInDropdown.current = false;
        checkShouldClose();
    }, [checkShouldClose]);

    const handleLinkClick = useCallback(() => {
        if (hoverIntentTimeout.current) clearTimeout(hoverIntentTimeout.current);
        if (closeTimeout.current) clearTimeout(closeTimeout.current);
        isMouseInCategory.current = false;
        isMouseInDropdown.current = false;
        setActiveCategory(null);
    }, []);

    const handleBackdropClick = useCallback(() => {
        if (hoverIntentTimeout.current) clearTimeout(hoverIntentTimeout.current);
        if (closeTimeout.current) clearTimeout(closeTimeout.current);
        isMouseInCategory.current = false;
        isMouseInDropdown.current = false;
        setActiveCategory(null);
    }, []);

    const activeCategoryData = activeCategory !== null ? data?.[activeCategory] : null;

    if (isLoading || isZoneLoading) {
        return (
            <div className="flex gap-4 px-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-6 w-20 bg-gray-200 animate-pulse rounded" />
                ))}
            </div>
        );
    }

    if (error) {
        return <p className="text-red-500 text-sm px-4">Failed to load categories</p>;
    }

    if (!data || data.length === 0) {
        return null;
    }
    const isOpen = activeCategory !== null && activeCategoryData;
    return (
        <>
            <div className="relative z-50 max-w-[1600px] mx-auto md:px-4 px-2">
                {/* Categories Navigation */}
                <Carousel>
                    <CarouselContent className="-ml-1">
                        {data.map((category, index) => (
                            <CarouselItem
                                key={category.id}
                                className="pl-4 basis-auto"
                                onMouseEnter={() => handleCategoryEnter(index)}
                                onMouseLeave={handleCategoryLeave}
                            >
                                <Link
                                    href={`/${slugify(category.title)}`}
                                    title={category.title}
                                    onClick={handleLinkClick}
                                    className={`
                                            block text-base font-medium px-2 py-1 whitespace-nowrap
                                            transition-all duration-200
                                            ${activeCategory === index
                                            ? "border-b-2 border-black"
                                            : "border-b-2 border-transparent hover:border-gray-300"
                                        }
                                        `}
                                >
                                    {category.title}
                                </Link>
                            </CarouselItem>
                        ))}
                    </CarouselContent >
                    <CarouselPrevious className=" shadow-none hidden lg:left-[-15px]  hover:translate-x-[-2px] transition-all bg-opacity-50 bg-white border-slate-300  md:inline-flex rounded-none  z-10  border-r border-none" />
                    <CarouselNext className=" shadow-none right-2 lg:right-[-15px] hover:translate-x-[2px]  transition-all bg-opacity-50 bg-white border-slate-300 md:inline-flex hidden rounded-none z-10  border-l border-none" />
                </Carousel>

                {/* Dropdown Panel */}
                {isOpen && (
                    <div
                        className="absolute top-full left-0 z-50 w-full bg-white shadow-lg overflow-hidden"
                        style={{ height: "390px" }}
                        onMouseEnter={handleDropdownEnter}
                        onMouseLeave={handleDropdownLeave}
                    >
                        <div className="flex justify-between p-6 h-full">
                            {/* Subcategories */}
                            <div className="flex flex-col flex-wrap gap-3 max-h-full overflow-y-auto pr-4">
                                {activeCategoryData.section.map((section) => (
                                    <Link
                                        key={section.id}
                                        href={`/${slugify(section.title)}`}
                                        title={section.title}
                                        onClick={handleLinkClick}
                                        className="text-gray-600 hover:text-black hover:underline transition-colors duration-150"
                                    >
                                        {section.title}
                                    </Link>
                                ))}
                            </div>

                            {/* Category Image */}
                            <div className=" flex-shrink-0 pl-4">
                                <Image
                                    src={placeHolderImage}
                                    alt={activeCategoryData.title}
                                    width={500}
                                    height={500}
                                    className="w-full h-full object-cover rounded-lg "
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Backdrop Overlay - Rendered outside relative container */}
            {isOpen && (
                <div
                    onClick={handleBackdropClick}
                    className="fixed inset-x-0 bottom-0 bg-black/20 backdrop-blur-sm z-40 h-full w-full"
                    style={{
                        top: "var(--header-height, 100px)",
                    }}
                />
            )}
        </>
    );
};

export default DropDownCategoryMenu;