"use client";
import DealOfTheDayProductCard from "../product/dealOfTheDayProductCard";
import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useDealOfTheDay } from "@/hooks/useDealOfTheDay";
import { useLocale } from "@/hooks/useLocale";

const CountdownTimer = () => {
    const [time, setTime] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const target = new Date();
            target.setHours(23, 59, 56, 0); // Target: 11:59:56 PM today

            const difference = target.getTime() - now.getTime();

            if (difference > 0) {
                return {
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }
            return { hours: 0, minutes: 0, seconds: 0 };
        };

        // Initial calculation
        setTime(calculateTimeLeft());

        const timer = setInterval(() => {
            setTime(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const format = (n: number) => n.toString().padStart(2, '0');

    return (
        <div className="flex flex-col items-center gap-1 lg:my-2 my-0">
            <div className="text-yellow-400 font-medium tracking-wide text-sm mb-1 uppercase animate-pulse">Offer expires in</div>
            <div className="flex items-start gap-3 text-2xl font-semibold text-white tracking-widest font-mono">
                <div className="flex flex-col items-center gap-1">
                    <span>{format(time.hours)}</span>
                    <span className="text-[10px] text-gray-400 font-sans font-normal uppercase tracking-wider">Hours</span>
                </div>
                <span className="text-xl mt-1">:</span>
                <div className="flex flex-col items-center gap-1">
                    <span>{format(time.minutes)}</span>
                    <span className="text-[10px] text-gray-400 font-sans font-normal uppercase tracking-wider">Mins</span>
                </div>
                <span className="text-xl mt-1">:</span>
                <div className="flex flex-col items-center gap-1">
                    <span>{format(time.seconds)}</span>
                    <span className="text-[10px] text-gray-400 font-sans font-normal uppercase tracking-wider">Sec</span>
                </div>
            </div>
        </div>
    )
}

const DealOfTheDay = () => {
    const [api, setApi] = useState<CarouselApi>()
    const [progress, setProgress] = useState(0)
    const { products, loading } = useDealOfTheDay(); // Use the hook
    const { locale, isRtl } = useLocale()

    useEffect(() => {
        if (!api) {
            return
        }

        const onScroll = (api: CarouselApi) => {
            const scrollProgress = api!.scrollProgress()
            // Clamp progress between 0 and 1
            const clampedProgress = Math.max(0, Math.min(1, scrollProgress))
            setProgress(clampedProgress * 100)
        }

        api.on("scroll", onScroll)
        api.on("reInit", onScroll)

        // Initial call
        onScroll(api)

        return () => {
            api.off("scroll", onScroll)
            api.off("reInit", onScroll)
        }
    }, [api])

    if (loading) return null; // Or a skeleton loader
    if (!products || !products.length) return null;

    return (
        <div className="bg-[#374151] rounded-lg overflow-hidden flex flex-col lg:flex-row my-8 shadow-sm">
            {/* Left Banner Section */}
            <div className="relative flex-shrink-0 w-full lg:w-[280px] px-2 lg:p-0 flex flex-row justify-between lg:flex-col items-center lg:justify-start  text-baseline lg:text-center bg-[#374151] z-10 gap-x-1">
                <div className="relative w-[200px] h-[120px] mb-2">
                    <Image
                        src={"/images/fourdays-sticker.webp"}
                        alt="Deal of the day"
                        fill
                        className=" aspect-square  lg:object-contain"
                    />
                </div>

                <CountdownTimer />
                <div className="flex  gap-2 self-end lg:self-center w-fit lg:w-full lg:justify-center ">
                    <Link href={`/${locale}/promotions?id=product_tags=1038`} className=" lg:text-black hover:bg-gray-100 font-bold w-full max-w-[180px] lg:mt-2 text-xs uppercase lg:py-2 rounded-sm bg-transparent text-white lg:bg-white lg:w-full flex items-center whitespace-nowrap lg:justify-center">
                        View All <ArrowRight className="ml-2 lg:hidden w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Right Carousel Section */}
            <div className="flex-grow p-2 min-w-0 bg-[#374151]">
                <Carousel
                    setApi={setApi}
                    className="w-full"
                    opts={{
                        align: "start",
                        containScroll: "trimSnaps",
                        dragFree: true,
                        direction: isRtl ? "rtl" : "ltr"
                    }}
                    dir={isRtl ? "rtl" : "ltr"}
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {products.map((product, index) => (
                            <CarouselItem
                                key={index}
                                className="pl-2 md:pl-4 basis-[46%] sm:basis-[35%] md:basis-[28%] lg:basis-[22%] xl:basis-[16%]"
                            >
                                <DealOfTheDayProductCard product={product} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                </Carousel>
                {/* Custom scrollbar indicator */}
                <div className="flex justify-center mt-2">
                    <div className="w-16 h-1.5 bg-gray-600 rounded-full overflow-hidden relative" dir="ltr">
                        <div
                            className="w-1/2 h-full bg-white rounded-full absolute top-0"
                            style={{
                                left: isRtl ? 'auto' : '0',
                                right: isRtl ? '0' : 'auto',
                                transform: `translateX(${isRtl ? -progress : progress}%)`
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealOfTheDay;
