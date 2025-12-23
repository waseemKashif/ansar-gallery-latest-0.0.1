import MarketSearchBox from "./MarketSearchBox";
import { useDictionary } from "@/hooks/useDictionary";
import { useAllCategoriesWithSubCategories } from "@/hooks/useAllCategoriesWithSubCategories";
interface Category {
    id: string;
    label: string;
}
const SearchBox = () => {
    const { dict } = useDictionary();
    const handleSearch = (query: string, categoryId: string) => {
        console.log("Search triggered:", { query, categoryId });
        // Add your API call here
    };
    // fetch all categories here 
    const { data: categories, isLoading: categoriesLoading } = useAllCategoriesWithSubCategories();
    if (!categories && categoriesLoading) {
        return <div>Loading...</div>;
    }
    const mainCategories = categories?.filter(c => c.level === 2);
    if (!mainCategories) {
        return null;
    }
    //  map mainCategories to defaultCategories with the title, category id
    const defaultCategories: Category[] = mainCategories.map((category) => ({
        id: category.id,
        label: category.title,
    }));
    // add all category to defaultCategories
    defaultCategories.unshift({ id: "all", label: dict?.category?.all || "All" });
    const handleCategoryChange = (categoryId: string) => {
        console.log("Category selected:", categoryId);
        // Add your category change logic here
    };
    return (

        <MarketSearchBox
            onSearch={handleSearch}
            onCategoryChange={handleCategoryChange}
            categories={defaultCategories}
            placeholderPrefix={dict?.common?.searchFor || "Search For"}
            placeholderWords={[dict?.category?.carpets || "Carpets", dict?.category?.mobilePhones || "Mobile Phones", dict?.category?.electronics || "Electronics", dict?.category?.grocery || "Grocery"]}
        />
    );
};

export default SearchBox;
