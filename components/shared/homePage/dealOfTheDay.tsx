import { dealOfTheDayItems } from "@/database/sample-data";
import DealOfTheDayProductCard from "../product/dealOfTheDayProductCard";
import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
const DealOfTheDay = () => {
    if (!dealOfTheDayItems.length || !dealOfTheDayItems) return null;
    return (
        <div className="flex gap-4 p-0 my-4 lg:flex-row flex-col">
            <div className="">
                <Image src={"/images/fourdays-sticker.webp"} alt="4 day icon" width={250} height={250} className=" object-contain" />
            </div>
            <Carousel className=" box-border  mx-4 w-full">
                <CarouselContent className="-ml-1">
                    {dealOfTheDayItems.map((product, index) => (
                        <CarouselItem
                            key={index}
                            className="pl-1 basis-2/4  md:basis-4/12 xl:basis-2/12 "
                        >
                            <DealOfTheDayProductCard product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>

            </Carousel>
        </div>
    );
};

export default DealOfTheDay;
