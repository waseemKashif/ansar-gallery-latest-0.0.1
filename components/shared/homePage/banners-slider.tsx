"use client"

import { fetchBanners } from "@/lib/api";
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRef } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useZoneStore } from "@/store/useZoneStore";
import { useLocale } from "@/hooks/useLocale";
const BannerSlider = ({ classes }: { classes?: string }) => {
  const className = twMerge("w-full max-w-[1600px] mx-auto", classes);
  const { zone } = useZoneStore();
  const { isRtl, locale } = useLocale();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["banners-fetch", zone],
    queryFn: () => fetchBanners(locale, zone),
    retry: 1,

  });
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);
  // console.log(data, "banners")
  return (
    <div className="bg-white">
      <div>
        {isLoading && (
          <div className="w-full  bg-gray-200 dark:bg-gray-700 animate-pulse rounded md:h-[450px] md:w-full h-[400px] max-w-[1500px] mx-auto" />
        )}
        {error && (
          <div>
            <p className="text-red-600 mb-4">Error loading banners</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}
        {data && data.length > 0 ? (
          <Carousel
            setApi={setApi}
            className={className}
            plugins={[plugin.current]}
            opts={{ loop: true, align: "start", skipSnaps: false, direction: isRtl ? "rtl" : "ltr" }}
            dir={isRtl ? "rtl" : "ltr"}
          >
            <CarouselContent>
              {data.map((item, index) => (
                <CarouselItem key={index}>
                  <Link
                    href={`/${locale}/promotions?id=${item.category_id}`}
                    title={item.url_banner}
                    className="md:block hidden"
                  >
                    <Image
                      src={item.image}
                      height={550}
                      width={1900}
                      alt={item.url_banner}
                      className="w-full"
                      priority={true}

                    />
                  </Link>
                  <Link
                    href={`/${locale}/promotions?id=${item.category_id}`}
                    title={item.url_banner}
                    className="block md:hidden"
                  >
                    <Image
                      src={item.mobile_image}
                      height={550}
                      width={1900}
                      alt={item.url_banner}
                      className="w-full"
                      priority={true}
                    />
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            {
              true && (
                <CarouselPrevious className=" left-1  hover:translate-x-[-2px] transition-all bg-opacity-50 bg-white border-white  md:inline-flex hidden" />
              )
            }
            {
              true && (
                <CarouselNext className=" right-1 hover:translate-x-[2px]  transition-all bg-opacity-50 bg-white border-white md:inline-flex  hidden" />
              )
            }

            {/* Dots */}
            < div className=" hidden absolute bottom-4 left-1/2 -translate-x-1/2 md:flex gap-2 z-10" >
              {
                Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    className={`h-2.5 w-3 rounded-full transition-all duration-300 ${index === current
                      ? "bg-[#b7d635] w-6"
                      : "bg-white/60 hover:bg-white"
                      }`}
                    onClick={() => api?.scrollTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))
              }
            </div>

          </Carousel>
        ) : (
          !isLoading && (
            <p className="text-gray-500 text-center py-4">No banners found</p>
          )
        )}
      </div>
    </div>
  );
};

export default BannerSlider;
