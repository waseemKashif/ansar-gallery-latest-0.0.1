"use client"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useDictionary } from "@/hooks/useDictionary";
import { CatalogProduct } from "@/types";
import CatalogProductCard from "./shared/product/catalogProductCard";
const RelatedBroughtTogether = ({ productList }: { productList: CatalogProduct[] }) => {
  const { locale } = useDictionary();
  const isRtl = locale === 'ar';
  return (
    <Carousel className=" box-border lg:mx-4 mx-0" opts={{
      direction: isRtl ? 'rtl' : 'ltr', dragFree: true,
    }}>
      <CarouselContent className="-ml-1">
        {productList.map((product, index) => (
          <CarouselItem
            key={index}
            className="pl-1 basis-2/4  md:basis-4/12 xl:basis-2/12 rtl:pr-1 rtl:pl-0"
          >
            <Card className="border border-gray-200 shadow-none py-0">
              <CardContent className="flex aspect-square items-center justify-center p-0">
                <CatalogProductCard product={product} className="border-none shadow-none" />
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className=" hidden lg:left-[-34px]  hover:translate-x-[-2px] transition-all bg-opacity-50 bg-gray-200 border-gray-200  md:inline-flex h-full rounded-none disabled:hidden" />
      <CarouselNext className=" right-2 lg:right-[-34px] hover:translate-x-[2px]  transition-all bg-opacity-50 bg-gray-200 border-gray-200 md:inline-flex hidden h-full rounded-none disabled:hidden" />
    </Carousel>
  );
}

export default RelatedBroughtTogether;