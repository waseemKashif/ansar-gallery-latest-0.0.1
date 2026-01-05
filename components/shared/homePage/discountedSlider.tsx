
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import DiscountPercentage from "../product/discountPercentage";
import DiscountProductPriceBlockSlider from "../product/discountProductPriceBlockSlider";
import Heading from "@/components/heading";
import ViewAllArrowButton from "./viewAllArrowButton";
const itemsDataForSlider = {
    title: "New Arrivals Just added",
    items: [
        {
            id: 1,
            name: "Iphone 14 Pro Max",
            image: "/images/placeholder.jpg",
            price: 100,
            discount: 20,
            rating: 4.5,
            reviews: 100,
            category: "Discounted",
            brand: "Brand",
            sku: "000000",
            stock: 100,
            description: "Description",
            images: ["/images/placeholder.jpg", "/images/placeholder.jpg", "/images/placeholder.jpg", "/images/placeholder.jpg", "/images/placeholder.jpg"],
            isDiscounted: false
        },
        {
            id: 2,
            name: "Iphone 14 Pro Max",
            image: "/images/placeholder.jpg",
            price: 100,
            discount: 20,
            rating: 4.5,
            reviews: 100,
            category: "Discounted",
            brand: "Brand",
            sku: "000000",
            stock: 100,
            description: "Description",
            images: ["/images/placeholder.jpg", "/images/placeholder.jpg", "/images/placeholder.jpg", "/images/placeholder.jpg", "/images/placeholder.jpg"],

        },
        {
            id: 3,
            name: "Iphone 14 Pro Max",
            image: "/images/placeholder.jpg",
            price: 100,
            discount: 20,
            rating: 4.5,
            special_price: 80,
            reviews: 100,
            category: "Discounted",
            brand: "Brand",
            sku: "000000",
            stock: 100,
            description: "Description",
            images: ["/images/placeholder.jpg", "/images/placeholder.jpg", "/images/placeholder.jpg", "/images/placeholder.jpg", "/images/placeholder.jpg"],

        }
    ]
}
const DiscountedSlider = () => {
    return (
        <section className="mt-2 lg:mt-4">
            <div className="flex justify-between items-center">
                <Heading level={2} title={itemsDataForSlider.title} className="mb-[0.25rem]">{itemsDataForSlider.title}</Heading>
                <ViewAllArrowButton url={"/"} title={itemsDataForSlider.title} />
            </div>
            <Carousel className="w-full">
                <CarouselContent>
                    {itemsDataForSlider.items.map((product, index) => (
                        <CarouselItem
                            key={product.id}
                            className="basis-5/12 md:basis-3/12 lg:basis-3/12 xl:basis-2/14 "
                        >
                            <Card className="border-0 shadow-none p-0 bg-white h-full">
                                <CardContent className="p-0">
                                    <Link href={`/ProductDetails/${index}`} className="flex flex-col gap-0" title={product.name}>
                                        <div className="relative">
                                            <Image src={product.image} alt={product.name} width={400} height={400} />
                                            {product.special_price && <DiscountPercentage discount={product.discount} />}
                                        </div>
                                        {product.special_price ? <DiscountProductPriceBlockSlider price={product.price} discountedPrice={product.special_price} isDiscounted={true} name={product.name} /> : <DiscountProductPriceBlockSlider price={product.price} isDiscounted={false} name={product.name} />}
                                    </Link>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {/* <CarouselContent> */}
                {/* {Array.from({ length: 10 }).map((_, index) => (
                        <CarouselItem
                            key={index}
                            className="basis-5/12 md:basis-3/12 lg:basis-3/12 xl:basis-2/14 "
                        >
                            <Card className="border-0 shadow-none p-0 bg-white h-full">
                                <CardContent className="p-0">
                                    <Link href={`/ProductDetails/${index}`} className="flex flex-col gap-0" title={"Iphone 14 Pro Max"}>
                                        <div className="relative">
                                            <Image src={"/images/placeholder.jpg"} alt={"placeholder"} width={400} height={400} />
                                            {/* {itemsDataForSlider[0].isDiscounted && <DiscountPercentage discount={20} />} */}
                {/* {index === 0 && false && <DiscountPercentage discount={20} />}
                                            {index === 1 && true && <DiscountPercentage discount={20} />}
                                            {index === 2 && true && <DiscountPercentage discount={15} />}
                                            {index === 3 && true && <DiscountPercentage discount={20} />}
                                            {index === 4 && false && <DiscountPercentage discount={35} />}
                                            {index === 5 && false && <DiscountPercentage discount={20} />}
                                            {index === 6 && true && <DiscountPercentage discount={25} />}
                                            {index === 7 && false && <DiscountPercentage discount={20} />}
                                            {index === 8 && true && <DiscountPercentage discount={5} />}
                                            {index === 9 && false && <DiscountPercentage discount={20} />} */}
                {/* </div>
                                        {index === 0 || index === 4 ? <DiscountProductPriceBlockSlider price={2232} isDiscounted={false} name={"Apple iPhone 16 Plus 128GB Storage Ultramarine"} /> : <DiscountProductPriceBlockSlider price={4533} discountedPrice={4456} isDiscounted={true} name={itemsDataForSlider[0].name} />}
                                    </Link>
                                </CardContent>
                            </Card>
                        </CarouselItem> */}
                {/* ))} */}
                {/* </CarouselContent> */}
                <CarouselPrevious className=" hidden lg:left-[-15px]  hover:translate-x-[-2px] transition-all bg-opacity-50 bg-white border-slate-300  md:inline-flex " />
                <CarouselNext className=" right-2 lg:right-[-15px] hover:translate-x-[2px]  transition-all bg-opacity-50 bg-white border-slate-300 md:inline-flex hidden " />
            </Carousel>
        </section>
    )
}
export default DiscountedSlider