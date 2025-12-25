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
import LocaleLink from "../../LocaleLink";
const HOVER_INTENT_DELAY = 200;
const DropDownCategoryMenu = () => {
    const { data, isLoading, error } = useAllCategoriesWithSubCategories();
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const { isLoading: isZoneLoading } = useZoneStore();
    const BASE_IMAGE_URL = process.env.NEXT_PUBLIC_CATEGORY_IMAGE_URL;

    const isMouseInCategory = useRef(false);
    const isMouseInDropdown = useRef(false);
    const hoverIntentTimeout = useRef<NodeJS.Timeout | null>(null);
    const closeTimeout = useRef<NodeJS.Timeout | null>(null);

    // Lock body scroll with scrollbar compensation
    useEffect(() => {
        if (activeCategory !== null) {

            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            const header = document.querySelector('body');
            if (header) {
                (header as HTMLElement).style.paddingRight = `${scrollbarWidth}px`;
            }
        } else {
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

    const mainCategories = data.filter(c => c.level === 2);

    // Adjust activeCategoryData lookup since we are now using a filtered list
    // The activeCategory index from the map will correspond to the index in mainCategories
    const activeCategoryData = activeCategory !== null ? mainCategories[activeCategory] : null;
    const isOpen = !!activeCategoryData;

    return (
        <>
            <div className="relative z-50 max-w-[1600px] mx-auto md:px-4 px-2 lg:bg-white bg-transparent">
                {/* Categories Navigation */}
                <Carousel>
                    <CarouselContent className="-ml-1 ">
                        {mainCategories.map((category, index) => (
                            <CarouselItem
                                key={category.id}
                                className="pl-4 basis-auto"
                                onMouseEnter={() => handleCategoryEnter(index)}
                                onMouseLeave={handleCategoryLeave}
                            >
                                <LocaleLink
                                    href={`/${category.slug}`}
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
                                </LocaleLink>
                            </CarouselItem>
                        ))}
                    </CarouselContent >
                    <CarouselPrevious className=" shadow-none hidden lg:left-[-15px]  hover:translate-x-[-2px] transition-all bg-opacity-50 bg-white border-slate-300  md:inline-flex rounded-none  z-10  border-r border-none" />
                    <CarouselNext className=" shadow-none right-2 lg:right-[-15px] hover:translate-x-[2px]  transition-all bg-opacity-50 bg-white border-slate-300 md:inline-flex hidden rounded-none z-10  border-l border-none" />
                </Carousel>

                {/* Dropdown Panel */}
                {isOpen && activeCategoryData && (
                    <div
                        className="absolute top-full left-0 z-50 w-full bg-white shadow-lg overflow-hidden"
                        style={{ height: "400px" }}
                        onMouseEnter={handleDropdownEnter}
                        onMouseLeave={handleDropdownLeave}
                    >
                        <div className="flex justify-between p-6 h-full">
                            {/* Subcategories */}
                            <div className="flex flex-col flex-wrap gap-y-4 gap-x-8 max-h-full overflow-y-auto pr-4 content-start">
                                {activeCategoryData.section.map((section) => (
                                    <div key={section.id} className="flex flex-wrap flex-col gap-1 mb-2 break-inside-avoid min-w-[200px]">
                                        {/* Level 2 (Parent) Link */}
                                        <LocaleLink
                                            href={`/${activeCategoryData.slug}/${section.slug}`}
                                            title={section.title}
                                            onClick={handleLinkClick}
                                            className="font-medium text-gray-800 text-sm hover:text-ansar-primary hover:underline transition-colors duration-150"
                                        >
                                            {(!section.section || section.section.length === 0) ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 relative flex-shrink-0">
                                                        <Image
                                                            src={`${BASE_IMAGE_URL}/${section.image}` || placeHolderImage}
                                                            alt={section.title}

                                                            width={100}
                                                            height={100}
                                                            className="rounded-full object-cover border border-gray-100"
                                                        />
                                                    </div>
                                                    <span>{section.title}</span>
                                                </div>
                                            ) : (
                                                section.title
                                            )}
                                        </LocaleLink>

                                        {/* Level 3 (Child) Links */}
                                        {section.section && section.section.length > 0 && (
                                            <div className="flex flex-col gap-1 pl-0 mt-1 flex-wrap">
                                                {section.section.map((subSection) => (
                                                    <LocaleLink
                                                        key={subSection.id}
                                                        href={`/${activeCategoryData.slug}/${section.slug}/${subSection.slug}`}
                                                        title={subSection.title}
                                                        onClick={handleLinkClick}
                                                        className="text-sm text-gray-500 hover:text-black hover:underline transition-colors duration-150"
                                                    >
                                                        {subSection.title}
                                                    </LocaleLink>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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