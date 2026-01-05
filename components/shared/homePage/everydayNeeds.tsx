import Link from "next/link"
import Image from "next/image"
import Heading from "@/components/heading"
import ViewAllArrowButton from "./viewAllArrowButton"
const EverydayNeeds = () => {
    const data = [
        {
            title: "Everyday Grocery Needs",
            category_id: "4",
            images: [
                {
                    linkText: "Fresh Fruits",
                    src: "/images/everydayneeds.webp",
                    alt: "Everyday Needs",
                    category_id: "4",
                },
                {
                    linkText: "Fresh Vegetables",
                    src: "/images/everydayneeds.webp",
                    alt: "Everyday Needs",
                    category_id: "5",
                },
                {
                    linkText: "Fresh Chicken & Meat",
                    src: "/images/everydayneeds.webp",
                    alt: "Everyday Needs",
                    category_id: "6",
                },
                {
                    linkText: "Dry Food",
                    src: "/images/everydayneeds.webp",
                    alt: "Everyday Needs",
                    category_id: "7",
                },
            ],
        },
        {
            title: "Explore All Beauty & Hygiene",
            category_id: "8",
            images: [
                {
                    linkText: "Hair care",
                    src: "/images/personal-care-card.webp",
                    alt: "Everyday Needs",
                    category_id: "8",
                },
                {
                    linkText: "skin & body care",
                    src: "/images/personal-care-card.webp",
                    alt: "Everyday Needs",
                    category_id: "9",
                },
                {
                    linkText: "Face care",
                    src: "/images/personal-care-card.webp",
                    alt: "Everyday Needs",
                    category_id: "10",
                },
                {
                    linkText: "Oral care",
                    src: "/images/personal-care-card.webp",
                    alt: "Everyday Needs",
                    category_id: "11",
                },
            ],
        },
    ]
    return (
        <section className="flex flex-col lg:grid grid-cols-2 gap-2 mt-2 lg:mt-4">
            {
                data.map((item) => (
                    <div key={item.title}>
                        <div className="flex justify-between items-center pb-[0.25rem]">
                            <Heading level={2} title={item.title}>{item.title}</Heading>
                            <ViewAllArrowButton url={item.category_id} title={item.title} />
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                            {
                                item.images.slice(0, 4).map((image) => (
                                    <Link key={image.linkText} href={image.category_id} title={image.linkText} className=" relative">
                                        <h3 className=" absolute top-3 left-1/2 transform -translate-x-1/2 text-center w-full text-black">{image.linkText}</h3>
                                        <Image src={image.src} alt={image.alt} width={500} height={200} className="object-cover" />
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
export default EverydayNeeds