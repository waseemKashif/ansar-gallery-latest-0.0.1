import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { SubCategoriesData } from "@/types";

const SubBoxCategoriesCard = ({ subCategories, label, mainLink }: SubCategoriesData) => {
    return (
        <Card className="w-full md:max-w-md p-2 lg:p-4 lg:rounded-lg shadow-md rounded-none   relative md:pb-8!">
            <CardContent className="p-0 w-full" >
                <h2 className="text-xl font-semibold mb-4 text-start">
                    {label || "Sub Categories"}
                </h2>
                <div className="flex flex-nowrap md:grid grid-cols-2 gap-2 w-full scrollbar-hide ">
                    {subCategories.map((item, index) => (
                        <Link key={index} href={item.url} className="flex flex-col items-center text-start hover:opacity-80 transition">
                            <Image src={item.image || '/images/placeholder.jpg' as string} width={200} height={200} alt={item.title || "Category Image"} />
                            <p className="text-xs font-medium  line-clamp-2">{item.title || "Category Name"}</p>
                        </Link>
                    ))}
                </div>
                <div className="md:mt-4 text-right absolute md:bottom-2 md:right-4 md:top-auto top-2 right-2">
                    <Link href={mainLink || "#"} className="text-blue-600 text-sm font-medium">
                        View All
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
export default SubBoxCategoriesCard;