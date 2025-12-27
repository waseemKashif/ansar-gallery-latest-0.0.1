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
import { useRouter, useParams, usePathname } from "next/navigation";
import { searchProductsApi } from "@/lib/search/search.service";
import AnimatedPlaceholder from "@/components/animatedPlaceHolder";
import { useDictionary } from "@/hooks/useDictionary";
// Types
// interface Category {
//     id: string;
//     label: string;
// }

interface MarketSearchBoxProps {
    // categories?: Category[];
    placeholderPrefix?: string;
    placeholderWords?: string[];
    debounceMs?: number;
    wordChangeInterval?: number;
    wordChangeDelay?: number;
    onSearch?: (query: string, categoryId: string) => void;
    // onCategoryChange?: (categoryId: string) => void;
    className?: string;
}

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

import { useZoneStore } from "@/store/useZoneStore";
import { extractZoneNo } from "@/utils/extractZoneNo";

// ... existing imports

export function MarketSearchBox({
    // categories,
    placeholderPrefix = "Search the ",
    placeholderWords = defaultPlaceholderWords,
    debounceMs = 500,
    wordChangeInterval = 3000,
    wordChangeDelay = 300,
    onSearch,
    // onCategoryChange,
    className,
}: MarketSearchBoxProps) {
    const router = useRouter(); // Import useRouter
    const pathname = usePathname();
    const params = useParams(); // Import useParams
    const locale = (params?.lang as string) || "en";

    const { dict } = useDictionary();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);

    // Live Search State
    const [results, setResults] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showDropdown, setShowDropdown] = React.useState(false);

    const { zone } = useZoneStore()

    const debouncedSearchQuery = useDebounce(searchQuery, debounceMs);

    // clear search query when pathname changes
    React.useEffect(() => {
        if (!pathname?.includes("search")) {
            setSearchQuery("");
        }
    }, [pathname]);

    // Trigger search when debounced query changes
    React.useEffect(() => {
        // console.log("Debounced Query:", debouncedSearchQuery);
        if (debouncedSearchQuery && debouncedSearchQuery.trim().length > 2) {
            handleLiveSearch(debouncedSearchQuery);
        } else {
            setResults([]);
            setShowDropdown(false);
        }
    }, [debouncedSearchQuery]);

    const handleLiveSearch = async (query: string) => {
        setIsLoading(true);
        setShowDropdown(true); // Show dropdown immediately to show loading state
        try {
            // console.log("Fetching search results for:", query);
            const data = await searchProductsApi(query, locale, 1, 30, parseInt(extractZoneNo(zone || '56')));
            // console.log("Search results:", data);
            setResults(data.items || []);
        } catch (error) {
            console.error("Search Handler Error:", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFullSearch = (query: string) => {
        if (!query) return;
        setShowDropdown(false);
        router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
        onSearch?.(query, "all");
    };

    // Handle Enter key press
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleFullSearch(searchQuery);
        }
    };

    // Handle search icon click
    const handleSearchClick = () => {
        handleFullSearch(searchQuery);
    };

    const showAnimatedPlaceholder = !searchQuery && !isFocused;

    // Live Search Results Dropdown
    const shouldShow = showDropdown && (results.length > 0 || isLoading);

    return (
        <div className="relative w-full max-w-[1000px] z-[60]">
            <div
                className={cn(
                    "flex items-center w-full border border-gray-200 rounded-md bg-white overflow-hidden focus-within:ring-1 focus-within:ring-gray-300 focus-within:border-gray-300 shrink",
                    className
                )}
            >
                {/* Search Input Container */}
                <div className="relative flex-1">
                    {/* Animated Placeholder */}
                    {showAnimatedPlaceholder && (
                        <div className="absolute inset-0 flex items-center px-3 text-sm pointer-events-none">
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
                        onFocus={() => {
                            setIsFocused(true);
                            if (results.length > 0) setShowDropdown(true);
                        }}
                        onBlur={() => {
                            // Delay hiding to allow clicks on dropdown
                            setTimeout(() => {
                                setIsFocused(false);
                                setShowDropdown(false);
                            }, 200);
                        }}
                        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 shadow-none bg-transparent relative z-10"
                    />
                </div>

                {/* Search Icon Button */}
                <button
                    type="button"
                    onClick={handleSearchClick}
                    className="h-10 px-3 hover:bg-gray-50 transition-colors shrink-0 border-l border-gray-200 cursor-pointer"
                    aria-label="Search"
                    title="Search All"
                >
                    <Search className="h-5 w-5 text-gray-500" />
                </button>
            </div>

            {/* Live Search Results Dropdown */}
            {shouldShow && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-[100] max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                    ) : (
                        results.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">No results found</div>
                        ) : (
                            <div>
                                {/* <button type="button"
                                    onClick={handleSearchClick}
                                    className="h-10 px-2 hover:bg-gray-50 transition-colors shrink-0 border-l border-gray-200 cursor-pointer text-sm text-gray-700 border"
                                    aria-label="Search">see all</button> */}
                                {results.map((item: any, index: number) => (
                                    <div
                                        key={item.id || index}
                                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 border-b last:border-0"
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Prevent blur
                                            if (item.url_key) {
                                                router.push(`/${locale}/product/${item.url_key}`);
                                            } else {
                                                handleFullSearch(item.name);
                                            }
                                        }}
                                    >
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export default MarketSearchBox;