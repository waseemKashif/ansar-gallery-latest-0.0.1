"use client"

import { fetchBanners } from "@/lib/api";
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
const BannerSlider = ({ classes }: { classes?: string }) => {
  const className = twMerge("w-full max-w-[1600px] mx-auto", classes);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["banners-fetch"],
    queryFn: fetchBanners,
    retry: 1,
  });
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );
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
            className={className}
            plugins={[plugin.current]}
            opts={{ loop: true, align: "start", skipSnaps: false }}
          >
            <CarouselContent>
              {data.map((item, index) => (
                <CarouselItem key={index}>
                  <Link
                    href={`${item.url_banner}`}
                    title="home page"
                    className="md:block hidden"
                  >
                    <Image
                      src={item.image}
                      height={550}
                      width={1900}
                      alt={item.url_banner}
                      className="w-full"

                    />
                  </Link>
                  <Link
                    href={`${item.url_banner}`}
                    title="home page"
                    className="block md:hidden"
                  >
                    <Image
                      src={item.mobile_image}
                      height={550}
                      width={1900}
                      alt={item.url_banner}
                      className="w-full"
                    />
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            {true && (
              <CarouselPrevious className=" left-1  hover:translate-x-[-2px] transition-all bg-opacity-50 bg-slate-300 border-slate-300  md:inline-flex hidden" />
            )}
            {true && (
              <CarouselNext className=" right-1 hover:translate-x-[2px]  transition-all bg-opacity-50 bg-slate-300 border-slate-300 md:inline-flex  hidden" />
            )}
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
