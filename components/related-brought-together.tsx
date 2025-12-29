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
import { CatalogProduct } from "@/types";
import CatalogProductCard from "./shared/product/catalogProductCard";
const RelatedBroughtTogether = ({ productList }: { productList: CatalogProduct[] }) => {
  return (
    <Carousel className=" box-border  mx-4">
      <CarouselContent className="-ml-1">
        {productList.map((product, index) => (
          <CarouselItem
            key={index}
            className="pl-1 basis-2/4  md:basis-4/12 xl:basis-2/12 "
          >
            <Card className="border-0 shadow-none py-0 ">
              <CardContent className="flex aspect-square items-center justify-center p-0">
                <CatalogProductCard product={product} />
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className=" hidden lg:left-[-34px]  hover:translate-x-[-2px] transition-all bg-opacity-50 bg-slate-300 border-slate-300  md:inline-flex " />
      <CarouselNext className=" right-2 lg:right-[-34px] hover:translate-x-[2px]  transition-all bg-opacity-50 bg-slate-300 border-slate-300 md:inline-flex hidden " />
    </Carousel>
  );
}

export default RelatedBroughtTogether;