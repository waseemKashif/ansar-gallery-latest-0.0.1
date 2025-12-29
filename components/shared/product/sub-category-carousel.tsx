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

interface SubCategoryCarouselProps {
    subCategories: SectionItem[];
}

export function SubCategoryCarousel({ subCategories }: SubCategoryCarouselProps) {
    if (!subCategories || subCategories.length === 0) return null;

    const BASE_IMAGE_URL = process.env.NEXT_PUBLIC_CATEGORY_IMAGE_URL || "";

    return (
        <div className="w-full lg:py-4 py-2">
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
                            ? `${BASE_IMAGE_URL}${category.image.startsWith("/") ? "" : "/"}${category.image}`
                            : placeholderImage;

                        return (
                            <CarouselItem key={category.id} className="pl-2 md:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/9">
                                <Link href={`/${slug}`} className="block h-full" title={category.title}>
                                    <Card className="h-full transition-shadow duration-200 cursor-pointer border-none shadow-none bg-transparent p-0">
                                        <CardContent className="p-2 flex flex-col items-center gap-2">
                                            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border bg-white flex-shrink-0">
                                                <Image
                                                    src={imageSrc}
                                                    alt={category.title}
                                                    fill
                                                    className="object-cover p-1"
                                                // Use a local variable to avoid TS errors inside JSX if needed, but here simple ternary covers it.
                                                />
                                            </div>
                                            <span className="text-xs md:text-sm font-medium text-center line-clamp-2 leading-tight">
                                                {category.title}
                                            </span>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
                {subCategories.length > 5 && (
                    <>
                        <CarouselPrevious className="left-0 md:-left-2" />
                        <CarouselNext className="right-0 md:-right-2" />
                    </>
                )}
            </Carousel>
        </div>
    );
}
