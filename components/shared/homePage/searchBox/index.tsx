import MarketSearchBox from "./MarketSearchBox";

const SearchBox = () => {
    const handleSearch = (query: string, categoryId: string) => {
        console.log("Search triggered:", { query, categoryId });
        // Add your API call here
    };

    const handleCategoryChange = (categoryId: string) => {
        console.log("Category selected:", categoryId);
        // Add your category change logic here
    };
    return (

        <MarketSearchBox
            onSearch={handleSearch}
            onCategoryChange={handleCategoryChange}

            placeholderPrefix="Search For "
            placeholderWords={[" Carpets", " Mobile Phones", " Electronics", " Grocery"]}
        />
    );
};

export default SearchBox;
