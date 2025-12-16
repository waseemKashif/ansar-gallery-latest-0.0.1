"use client";

import * as React from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AnimatedPlaceholder from "@/components/animatedPlaceHolder";

// Types
interface Category {
    id: string;
    label: string;
}

interface MarketSearchBoxProps {
    categories?: Category[];
    placeholderPrefix?: string;
    placeholderWords?: string[];
    debounceMs?: number;
    wordChangeInterval?: number;
    wordChangeDelay?: number;
    onSearch?: (query: string, categoryId: string) => void;
    onCategoryChange?: (categoryId: string) => void;
    className?: string;
}

const defaultCategories: Category[] = [
    { id: "all", label: "All" },
    { id: "electronics", label: "Electronics" },
    { id: "clothing", label: "Clothing" },
    { id: "home", label: "Home & Garden" },
    { id: "sports", label: "Sports" },
    { id: "toys", label: "Toys" },
];

const defaultPlaceholderWords = [
    "Carpets",
    "Mobile Phones",
    "Electronics",
    "Grocery",
];

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function MarketSearchBox({
    categories = defaultCategories,
    placeholderPrefix = "Search the ",
    placeholderWords = defaultPlaceholderWords,
    debounceMs = 500,
    wordChangeInterval = 3000,
    wordChangeDelay = 300,
    onSearch,
    onCategoryChange,
    className,
}: MarketSearchBoxProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<Category>(
        categories[0] || { id: "all", label: "All" }
    );

    const debouncedSearchQuery = useDebounce(searchQuery, debounceMs);

    // Trigger search when debounced query changes
    React.useEffect(() => {
        if (debouncedSearchQuery !== undefined) {
            handleSearch(debouncedSearchQuery);
        }
    }, [debouncedSearchQuery]);

    const handleSearch = (query: string) => {
        console.log("Searching for:", query, "in category:", selectedCategory.id);
        onSearch?.(query, selectedCategory.id);

        // api call here. const results = await searchApi(query, selectedCategory.id);
    };

    // Empty function - add your category change logic here
    const handleCategoryChange = (category: Category) => {
        setSelectedCategory(category);
        console.log("Category changed to:", category.id);
        onCategoryChange?.(category.id);
        // TODO: Add any additional logic when category changes
        // Optionally trigger a new search with the current query
        if (searchQuery) {
            handleSearch(searchQuery);
        }
    };

    // Handle Enter key press
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            // Bypass debounce on Enter
            handleSearch(searchQuery);
        }
    };

    // Handle search icon click
    const handleSearchClick = () => {
        handleSearch(searchQuery);
    };

    const showAnimatedPlaceholder = !searchQuery && !isFocused;

    return (
        <div
            className={cn(
                "flex items-center w-full max-w-[1000px] border border-gray-200 rounded-md bg-white overflow-hidden focus-within:ring-1 focus-within:ring-gray-300 focus-within:border-gray-300 shrink",
                className
            )}
        >
            {/* Category Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-10 px-3 rounded-none border-r border-gray-200 hover:bg-gray-50 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 gap-1 text-gray-700 font-normal shrink-0"
                    >
                        {selectedCategory.label}
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                    {categories.map((category) => (
                        <DropdownMenuItem
                            key={category.id}
                            onClick={() => handleCategoryChange(category)}
                            className={cn(
                                "cursor-pointer",
                                selectedCategory.id === category.id && "bg-gray-100"
                            )}
                        >
                            {category.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Input Container */}
            <div className="relative flex-1">
                {/* Animated Placeholder */}
                {showAnimatedPlaceholder && (
                    <div className="absolute inset-0 flex items-center px-3 text-sm">
                        <AnimatedPlaceholder
                            prefix={placeholderPrefix}
                            words={placeholderWords}
                            intervalMs={wordChangeInterval}
                            delayMs={wordChangeDelay}
                        />
                    </div>
                )}

                {/* Actual Input */}
                <Input
                    type="text"
                    placeholder=""
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 shadow-none bg-transparent relative z-10"
                />
            </div>

            {/* Search Icon Button */}
            <button
                type="button"
                onClick={handleSearchClick}
                className="h-10 px-3 hover:bg-gray-50 transition-colors shrink-0 border-l border-gray-200"
                aria-label="Search"
            >
                <Search className="h-5 w-5 text-gray-500" />
            </button>
        </div>
    );
}

export default MarketSearchBox;