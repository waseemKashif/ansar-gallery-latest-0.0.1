
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";
import { CatalogFilter, FilterOption, PriceFilterOptions } from "@/types";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Minus, Plus, Check, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CatalogFiltersProps {
    categoryId: number;
    categoryName?: string;
    onFilterChange?: (filters: Record<string, (string | number)[]>) => void;
}

export default function CatalogFilters({ categoryId, categoryName, onFilterChange }: CatalogFiltersProps) {
    const { data: filters, isLoading } = useCatalogFilters(categoryId);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const handleClearFilters = () => {
        router.push(pathname);
    };

    // Helper to get selected options for a specific filter code from URL
    const getSelectedOptions = useCallback((code: string): (string | number)[] => {
        const param = searchParams.get(code);
        if (!param) return [];
        if (code === 'price') {
            return param.split(',').map(Number);
        }
        return param.split(',').map(v => !isNaN(Number(v)) ? Number(v) : v);
    }, [searchParams]);

    if (isLoading) {
        return <FiltersSkeleton />;
    }

    const validFilters = filters?.filter(f => {
        // ... (existing logic)
        if (f.name.toLowerCase() === 'price') return true;
        if (Array.isArray(f.options)) {
            return f.options.length > 0;
        }
        return false;
    });

    if (!validFilters || validFilters.length === 0) {
        return null;
    }

    const defaultOpen = validFilters.length > 0 ? [validFilters[0].name.toLowerCase()] : [];

    // Check if any filters are currently active to potentially disable the button
    // Simple check: do we have any query params?
    // Or we could be more specific, but for now let's just show the button.
    const hasActiveFilters = Array.from(searchParams.keys()).some(key =>
        key !== 'p' && key !== 'limit' && key !== 'sort' // exclude control params
    );

    return (
        <div className="w-full pr-4 pb-0 bg-white px-2 h-fit">
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    className="w-fit border-none shadow-none cursor-pointer text-neutral-700 font-medium hover:bg-transparent"
                    onClick={handleClearFilters}
                >
                    <Trash className="w-4 h-4" /> Clear Filters
                </Button>
            )}
            <Accordion type="multiple" defaultValue={defaultOpen} className="w-full mb-6">
                {validFilters.map((filter) => (
                    <FilterSection
                        key={filter.id}
                        filter={filter}
                        onFilterChange={onFilterChange}
                        categoryName={categoryName}
                        selectedOptions={getSelectedOptions(
                            (filter.code === 'category' || (categoryName && filter.name.toLowerCase() === categoryName.toLowerCase()))
                                ? 'category'
                                : (filter.code || (filter.name.toLowerCase() === 'brands' ? "manufacturer" : filter.name.toLowerCase()))
                        )}
                    />
                ))}
            </Accordion>


        </div>
    );
}

function FilterSection({
    filter,
    onFilterChange,
    selectedOptions,
    categoryName
}: {
    filter: CatalogFilter,
    onFilterChange?: (filters: Record<string, (string | number)[]>) => void,
    selectedOptions: (string | number)[],
    categoryName?: string
}) {
    const isPrice = filter.name.toLowerCase() === "price";
    const isColor = filter.name.toLowerCase() === "color";
    const isBrand = filter.name.toLowerCase() === "brands";

    // Map 'Brands' to 'manufacturer' code if needed, otherwise use name lowercase
    // Prioritize API 'code' if available
    // If filter name matches category name, treat as 'category' code
    const isCategoryMatch = categoryName && filter.name.toLowerCase() === categoryName.toLowerCase();
    const code = filter.code || (isCategoryMatch ? 'category' : filter.name.toLowerCase());
    const filterCode = code === "brands" ? "manufacturer" : code;

    return (
        <AccordionItem value={filter.name.toLowerCase()} className="border-b-1 mb-2">
            <AccordionTrigger className="flex justify-between items-center py-4 font-medium transition-all [&[data-state=open]>svg]:rotate-180  capitalize cursor-pointer hover:no-underline ">
                <h3 className="text-sm font-bold text-gray-800">{filter.name}</h3>
            </AccordionTrigger>

            <AccordionContent>
                {isPrice ? (
                    <PriceFilter
                        options={filter.options as PriceFilterOptions}
                        onFilterChange={onFilterChange}
                        selectedRange={selectedOptions as number[]}
                    />
                ) : isColor ? (
                    <ColorFilter
                        options={filter.options as FilterOption[]}
                        onFilterChange={onFilterChange}
                        selectedOptions={selectedOptions}
                        filterCode={filterCode}
                    />
                ) : (
                    <OptionsList
                        options={filter.options as FilterOption[]}
                        isBrand={isBrand}
                        onFilterChange={onFilterChange}
                        selectedOptions={selectedOptions}
                        filterCode={filterCode}
                    />
                )}
            </AccordionContent>
        </AccordionItem>
    );
}

function PriceFilter({
    options,
    onFilterChange,
    selectedRange
}: {
    options: PriceFilterOptions,
    onFilterChange?: (filters: Record<string, (string | number)[]>) => void,
    selectedRange: number[]
}) {
    const min = Math.floor(options.minPrice);
    const max = Math.ceil(options.maxPrice);

    // Use selected range from URL if valid, otherwise use min/max default
    const currentMin = (selectedRange && selectedRange[0] !== undefined) ? selectedRange[0] : min;
    const currentMax = (selectedRange && selectedRange[1] !== undefined) ? selectedRange[1] : max;

    const [range, setRange] = useState([currentMin, currentMax]);

    useEffect(() => {
        setRange([currentMin, currentMax]);
    }, [currentMin, currentMax]);

    const handleSliderChange = (value: number[]) => {
        setRange(value);
    };

    const handleSliderCommit = (value: number[]) => {
        if (onFilterChange) {
            onFilterChange({ price: value });
        }
    };

    return (
        <div className="p-1 px-2 space-y-4">
            <Slider
                defaultValue={[min, max]}
                value={range}
                max={max}
                min={min}
                step={1}
                onValueChange={handleSliderChange}
                onValueCommit={handleSliderCommit}
                className="my-4"
            />
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1 w-full">
                    <span className="text-xs text-neutral-500 text-center">Min</span>
                    <div className="bg-neutral-100 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 w-full text-center">
                        {range[0]}
                    </div>
                </div>
                <div className="h-[1px] w-4 bg-neutral-300 flex-shrink-0" />
                <div className="flex flex-col gap-1 w-full">
                    <span className="text-xs text-neutral-500 text-center">Max</span>
                    <div className="bg-neutral-100 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 w-full text-center">
                        {range[1]}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ColorFilter({
    options,
    onFilterChange,
    selectedOptions,
    filterCode
}: {
    options: FilterOption[],
    onFilterChange?: (filters: Record<string, (string | number)[]>) => void,
    selectedOptions: (string | number)[],
    filterCode: string
}) {
    if (!Array.isArray(options) || options.length === 0) return null;

    const toggleOption = (id: number | string) => {
        if (!onFilterChange) return;

        let newSelected = [...selectedOptions];
        // Use string comparison to match robustly
        if (newSelected.some(item => String(item) === String(id))) {
            newSelected = newSelected.filter(item => String(item) !== String(id));
        } else {
            newSelected.push(id);
        }
        onFilterChange({ [filterCode]: newSelected });
    };

    return (
        <div className="flex flex-wrap gap-3 p-1">
            {options.map((option) => {
                // Ensure robust comparison between URL params (selectedOptions) and option.id
                const isSelected = selectedOptions.some(item => String(item) === String(option.id));
                return (
                    <button
                        key={option.id}
                        onClick={() => toggleOption(option.id)}
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all relative",
                            isSelected
                                ? "scale-110 border-2 border-neutral-300"
                                : "hover:scale-110 border border-neutral-200"
                        )}
                        title={option.value || option.name}
                        style={{ backgroundColor: option.code || "#ccc" }}
                    >
                        {isSelected && (
                            <Check className="w-3 h-3 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] stroke-[3]" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}


function OptionsList({
    options,
    isBrand,
    onFilterChange,
    selectedOptions,
    filterCode,
    toggleOption: externalToggleOption
}: {
    options: FilterOption[],
    isBrand?: boolean,
    onFilterChange?: (filters: Record<string, (string | number)[]>) => void,
    selectedOptions: (string | number)[],
    filterCode?: string,
    toggleOption?: (id: number | string) => void
}) {
    if (!Array.isArray(options) || options.length === 0) return null;

    const toggleOptionRaw = (id: number | string) => {
        if (!onFilterChange || !filterCode) return;

        let newSelected = [...selectedOptions];
        if (newSelected.some(item => item == id)) {
            newSelected = newSelected.filter(item => item != id);
        } else {
            newSelected.push(id);
        }
        onFilterChange({ [filterCode]: newSelected });
    };

    const toggleOption = externalToggleOption || toggleOptionRaw;

    return (
        <ul className="space-y-2">
            {options.map((option) => (
                <li key={option.id}>
                    {isBrand ? (
                        <div className="flex items-center space-x-2">
                            <button
                                role="checkbox"
                                aria-checked={selectedOptions.some(i => i == option.id)}
                                onClick={() => toggleOption(option.id)}
                                className={cn(
                                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                    selectedOptions.some(i => i == option.id)
                                        ? "bg-[#B7D635] border-[#B7D635]"
                                        : "border-gray-300 bg-white"
                                )}
                            >
                                {selectedOptions.some(i => i == option.id) && (
                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                            </button>
                            <label htmlFor={`brand-${option.id}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {option.value || option.name}
                            </label>
                        </div>
                    ) : (
                        <CategoryOption
                            option={option}
                            toggleOption={toggleOption}
                            selectedOptions={selectedOptions}
                        />
                    )}
                </li>
            ))}
        </ul>
    );
}

function CategoryOption({
    option,
    toggleOption,
    selectedOptions
}: {
    option: FilterOption,
    toggleOption: (id: number | string) => void,
    selectedOptions: (string | number)[]
}) {
    const hasSubOptions = option.options && Array.isArray(option.options) && option.options.length > 0;
    const [isOpen, setIsOpen] = useState(false);

    if (hasSubOptions) {
        return (
            <div className="ml-1">
                <div className="flex items-center gap-2 py-1">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1 hover:bg-neutral-100 rounded text-neutral-500 transition-colors cursor-pointer"
                    >
                        {isOpen ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    </button>
                    <span className="text-sm font-medium text-neutral-700">{option.name}</span>
                </div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="pl-4 border-l border-neutral-200 ml-2 mt-1">
                                <OptionsList
                                    options={option.options as FilterOption[]}
                                    toggleOption={toggleOption} // Pass toggleOption down
                                    selectedOptions={selectedOptions} // Pass selectedOptions down
                                // isBrand is false for category sub-options obviously
                                // But we need filterCode to pass to OptionsList if we refactor OptionsList to not need it...
                                // Wait, OptionsList calls onFilterChange, but here we are passing toggleOption recursively.
                                // So we need to adjust OptionsList to accept toggleOption AND onFilterChange?
                                // Actually, OptionsList uses toggleOption internally if provided?
                                // No, looking at OptionsList: "const toggleOption = (id) => { if (!onFilterChange) return; ... }"
                                // But CategoryOption receives `toggleOption` func from parent.
                                // So we should reuse `toggleOption` for sub-items too?
                                // Yes, because `toggleOption` handles the logic of adding/removing ID from the selected set for THIS filter code.
                                // So simply passing `toggleOption` is enough if the sub-options share the SAME filter code (e.g. all are 'category' IDs).
                                // If sub-categories are just IDs within the same 'category' filter parameter, then yes.
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2 py-1 ml-1">
            <button
                role="checkbox"
                aria-checked={selectedOptions.some(i => i == option.id)}
                onClick={() => toggleOption(option.id)}
                className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    selectedOptions.some(i => i == option.id)
                        ? "bg-[#B7D635] border-[#B7D635]"
                        : "border-gray-300 bg-white"
                )}
            >
                {selectedOptions.some(i => i == option.id) && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
            </button>
            <label htmlFor={`cat-${option.id}`} className="text-sm text-neutral-600">
                {option.name}
            </label>
        </div>
    );
}

function FiltersSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ))}
        </div>
    );
}

