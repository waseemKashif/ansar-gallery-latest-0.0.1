import Image from "next/image";
import { CategoryData } from "@/types";
import Link from "next/link";
import placeholderImage from "@/public/images/placeholder.jpg";
import { slugify } from "@/lib/utils";

const CategoryCard = ({ category }: { category: CategoryData }) => {
    // Fallback to name-based slug if magento url is weird, or just use name for consistency
    const slug = slugify(category.name);

    return (
        <Link
            href={`/${slug}`}
            title={category.name}
            className="flex flex-col gap-2 items-center p-2"
        >
            <Image
                src={category.image_url || placeholderImage}
                alt={category.name || "Category Image"}
                width={200}
                height={200}
                className=" rounded-lg min-w-[90px] min-h-[90px]"
            />
            <h2 className=" text-sm lg:text-base font-medium text-center">
                {category.name || "Category Name"}
            </h2>
        </Link>
    );
};

export default CategoryCard;
