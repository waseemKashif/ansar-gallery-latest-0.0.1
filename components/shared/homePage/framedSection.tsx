"use client"
import Heading from "@/components/heading";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import ViewAllArrowButton from "./viewAllArrowButton";
import { useDictionary } from "@/hooks/useDictionary";
// interface FramedSectionProps {
//     title: string;
//     image: string | StaticImageData;
//     link: string;
// }
const FramedSection = () => {
    const { dict } = useDictionary();
    const frameData = [
        {
            title: "Inspiring Furniture for Your Home",
            link: "/",
            data: [
                {
                    image: "/images/furniture card.webp",
                    name: "Furniture",
                    link: "/"
                },
                {
                    image: "/images/furniture2.webp",
                    name: "Home decor",
                    link: "/"
                },
                {
                    image: "/images/furniture3.webp",
                    name: "Carpets & Rugs",
                    link: "/"
                },
            ]
        },
        {
            title: "Modern Household Essentials",
            link: "/",
            data: [
                {
                    image: "/images/furniture card.webp",
                    name: "Furniture",
                    link: "/"
                },
                {
                    image: "/images/furniture2.webp",
                    name: "Home decor",
                    link: "/"
                },
                {
                    image: "/images/furniture3.webp",
                    name: "Carpets & Rugs",
                    link: "/"
                },
            ]
        }
    ]
    return (
        <section className="flex flex-col lg:grid grid-cols-2 gap-2 mt-2 lg:mt-4">
            {
                frameData.map((item, index) => (
                    <div key={index}>
                        <div className="flex justify-between items-center pb-[0.25rem]">
                            <Heading level={2} title={item.title}>{item.title}</Heading>
                            <ViewAllArrowButton url={item.link} title={`${dict?.common?.viewAll || "View All"}`} />
                        </div>
                        <div className="grid grid-cols-3 gap-[2px]">
                            {
                                item.data.map((data, index) => (
                                    <Link key={index} href={data.link} title={data.name} className="relative">
                                        {/* for first image want to make left rounded corners */}
                                        {index === 0 && <Image src={data.image} alt={data.name} width={500} height={200} className="object-cover rounded-l-md" />}
                                        {index === 1 && <Image src={data.image} alt={data.name} width={500} height={200} className="object-cover" />}
                                        {index === 2 && <Image src={data.image} alt={data.name} width={500} height={200} className="object-cover rounded-r-md" />}
                                        <h3 className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-center w-full text-black">{data.name}</h3>
                                    </Link>
                                ))
                            }
                        </div>
                    </div>
                ))
            }
        </section>
    )
}
export default FramedSection
