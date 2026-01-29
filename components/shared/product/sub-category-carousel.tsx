"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionItem } from "@/types";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { slugify } from "@/lib/utils";
import placeholderImage from "@/public/images/placeholder.jpg";
import LocaleLink from "../LocaleLink";
interface SubCategoryCarouselProps {
    subCategories: SectionItem[];
    parentPath?: string;
}

export function SubCategoryCarousel({ subCategories, parentPath }: SubCategoryCarouselProps) {
    if (!subCategories || subCategories.length === 0) return null;
    return (
        <div className="w-full  py-0">
            <Carousel
                opts={{
                    align: "start",
                    loop: false, // Usually category lists don't need infinite loop
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {subCategories.map((category) => {
                        const slug = category.slug || slugify(category.title);
                        const imageSrc = category.image
                            ? `${category.image}`
                            : placeholderImage;

                        // Construct full path: parentPath/slug
                        // parentPath usually starts with / and doesn't end with /
                        const href = parentPath
                            ? `${parentPath}/${slug}`.replace(/\/\//g, "/")
                            : `/${slug}`;

                        return (
                            <CarouselItem key={category.id} className="pl-2 md:pl-4 basis-1/4 md:basis-1/7 lg:basis-1/9">
                                <LocaleLink href={href} className="block h-full" title={category.title}>
                                    <Card className="h-full transition-shadow duration-200 cursor-pointer border-none shadow-none bg-transparent p-0">
                                        <CardContent className="p-2 flex flex-col items-center gap-2">
                                            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border bg-white flex-shrink-0">
                                                <Image
                                                    src={imageSrc}
                                                    alt={category.title + " Shopping"}
                                                    width={400}
                                                    height={400}
                                                    className="object-cover p-1"
                                                // Use a local variable to avoid TS errors inside JSX if needed, but here simple ternary covers it.
                                                />
                                            </div>
                                            <span className="text-xs md:text-sm font-medium text-center line-clamp-2 leading-tight" dir="auto" title={category.title} >
                                                {category.title}
                                            </span>
                                        </CardContent>
                                    </Card>
                                </LocaleLink>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
                {subCategories.length > 5 && (
                    <>
                        <CarouselPrevious className="left-0 md:-left-2 lg:flex hidden" />
                        <CarouselNext className="right-0 md:-right-2 lg:flex hidden" />
                    </>
                )}
            </Carousel>
        </div>
    );
}
