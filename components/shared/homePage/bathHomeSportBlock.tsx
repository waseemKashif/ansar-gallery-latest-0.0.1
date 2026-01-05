import Image from "next/image"
import Heading from "@/components/heading"
import { cn } from "@/lib/utils"
import ShopNowBtn from "./shopNowBtn"
import { ShoppingBag } from "lucide-react"
const BathHomeSportBlock = ({ title, image, link, subTitle, gradient, category_id }: { title: string, image: string, link: string, subTitle: string, gradient: string, category_id: number }) => {

    return (
        <div className={cn("flex xl:flex-row flex-col-reverse items-center lg:gap-2 gap-1 bg-linear-gradient-to-b from-white to-gray-100 rounded-lg text-white overflow-hidden justify-start", gradient)}>
            <div className="flex flex-col justify-center  gap-1 lg:gap-y-2 lg:grow lg:p-5 p-2 lg:shrink items-center lg:items-start">
                <Heading level={2} title={title} className="text-white lg:text-[20px] leading-[1.2]">{title}</Heading>
                <p className="text-sm ">{subTitle}</p>
                <ShopNowBtn link={link} title={title} className="group" category_id={category_id}><ShoppingBag className="lg:block hidden mr-1 group-hover:scale-110 transition-all" size={20} /> Shop Now</ShopNowBtn>
            </div>
            <div className="lg:shrink-0 lg:px-5 px-2 relative max-w-[300px]">
                <Image src={image} alt={title} width={400} height={400} className="z-10 relative" />
                <div className="absolute  left-1/9 w-full max-w-[230px] h-full bg-white opacity-50 rounded-full top-[-2rem] right-[-2rem] z-0 lg:block hidden "></div>
            </div>
        </div>
    )
}
export default BathHomeSportBlock