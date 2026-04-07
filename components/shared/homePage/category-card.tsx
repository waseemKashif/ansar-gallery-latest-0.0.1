import Image from "next/image";
import placeholderImage from "@/public/images/placeholder.jpg";
import { slugify } from "@/lib/utils";
import { CategoriesWithSubCategories } from "@/types";
import LocaleLink from "../LocaleLink";
const CategoryCard = ({ category }: { category: CategoriesWithSubCategories }) => {
    // Fallback to name-based slug if magento url is weird, or just use name for consistency
    // const slug = slugify(category.title);
    return (
        <LocaleLink
            href={category.slug || `/${slugify(category.title)}`}
            title={category.title}
            className="flex flex-col gap-2 items-center p-2"
        >
            <Image
                src={category.image || placeholderImage}
                alt={category.title}
                width={200}
                height={200}
                className=" rounded-lg min-w-[90px] min-h-[90px]"
            />
            <h2 className=" text-sm lg:text-base font-medium text-center">
                {category.title || "Category Name"}
            </h2>
        </LocaleLink>
    );
};

export default CategoryCard;
