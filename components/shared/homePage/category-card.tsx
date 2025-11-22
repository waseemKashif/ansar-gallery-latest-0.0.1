import Image from "next/image";
import { CategoryData } from "@/types";
import Link from "next/link";
import placeholderImage from "@/public/images/placeholder.jpg";
// HERE i WANT TO CREATE A CATEGORY CARD

const CategoryCard = ({ category }: { category: CategoryData }) => {
    return (
        <Link href={category.url || "#"} title={category.name} className="flex flex-col gap-2 items-center p-2">
            <Image
                src={category.image_url || placeholderImage}
                alt={category.name || "Category Image"}
                width={150}
                height={150}
            />
            <h2 className="text-base font-medium text-center">{category.name || "Category Name"}</h2>
        </Link>
    );
};

export default CategoryCard;