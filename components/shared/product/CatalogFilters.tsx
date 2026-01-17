
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
import { Minus, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname, ReadonlyURLSearchParams } from "next/navigation";
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

    const hasActiveFilters = Array.from(searchParams.keys()).some(key =>
        key !== 'p' && key !== 'limit' && key !== 'sort'
    );

    // Helper for robust comparison ignoring special chars
    const normalizeForMatch = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    return (
        <div className="w-full pr-4 pb-0 bg-white px-2 h-fit">
            {hasActiveFilters && (
                <div className="mb-6 border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">Applied Filters</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-red-500 hover:text-red-600 hover:bg-transparent"
                            onClick={handleClearFilters}
                        >
                            Clear All
                        </Button>
                    </div>
                    <AppliedFilters
                        filters={validFilters}
                        searchParams={searchParams}
                        onFilterChange={onFilterChange}
                        categoryName={categoryName}
                    />
                </div>
            )}

            <Accordion type="multiple" defaultValue={defaultOpen} className="w-full mb-6">
                {validFilters.map((filter) => {
                    const isCategoryMatch = categoryName && normalizeForMatch(filter.name) === normalizeForMatch(categoryName);
                    // Determine the code used for URL params.
                    // If it matches category, force 'category'.
                    const code = (filter.code === 'category' || isCategoryMatch)
                        ? 'category'
                        : (filter.code || (filter.name.toLowerCase() === 'brands' ? "manufacturer" : filter.name.toLowerCase()));

                    return (
                        <FilterSection
                            key={filter.id}
                            filter={filter}
                            onFilterChange={onFilterChange}
                            categoryName={categoryName}
                            selectedOptions={getSelectedOptions(code)}
                        />
                    );
                })}
            </Accordion>
        </div>
    );
}

function AppliedFilters({
    filters,
    searchParams,
    onFilterChange,
    categoryName
}: {
    filters: CatalogFilter[],
    searchParams: ReadonlyURLSearchParams,
    onFilterChange?: (filters: Record<string, (string | number)[]>) => void,
    categoryName?: string
}) {
    if (!onFilterChange) return null;

    const applied: { label: string, value: string | number, filterCode: string, displayValue: string }[] = [];
    const normalizeForMatch = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    filters.forEach(filter => {
        const isCategoryMatch = categoryName && normalizeForMatch(filter.name) === normalizeForMatch(categoryName);
        const code = filter.code || (isCategoryMatch ? 'category' : filter.name.toLowerCase());
        const filterCode = code === "brands" ? "manufacturer" : code;

        const param = searchParams.get(filterCode);
        if (!param) return;

        if (filter.name.toLowerCase() === 'price') {
            const range = param.split(',').map(Number);
            if (range.length === 2) {
                applied.push({
                    label: filter.name,
                    value: param, // Store full param value for price removal
                    filterCode: filterCode,
                    displayValue: `${range[0]} - ${range[1]}`
                });
            }
        } else {
            const selectedIds = param.split(',').map(v => !isNaN(Number(v)) ? Number(v) : v);

            // Helper to recursively find option name
            const findOptionName = (opts: FilterOption[], id: string | number): string | undefined => {
                for (const opt of opts) {
                    // Loose equality for ID matching
                    if (opt.id == id) return opt.name || opt.value;
                    if (opt.options && Array.isArray(opt.options) && opt.options.length > 0) {
                        const found = findOptionName(opt.options as FilterOption[], id);
                        if (found) return found;
                    }
                }
                return undefined;
            };

            selectedIds.forEach(id => {
                const name = findOptionName(filter.options as FilterOption[], id);
                if (name) {
                    applied.push({
                        label: filter.name,
                        value: id,
                        filterCode: filterCode,
                        displayValue: name
                    });
                }
            });
        }
    });

    const removeFilter = (item: { filterCode: string, value: string | number }) => {
        const currentParam = searchParams.get(item.filterCode);
        if (!currentParam) return;

        if (item.filterCode === 'price') {
            // For price, we just remove the filter entirely by sending empty array or handling in parent
            // Ideally we shouldn't send null, but empty array or similar based on how onFilterChange works.
            // Looking at CatalogFilters logic, standard practice for onFilterChange is { [key]: value[] }
            // To clear, we can try sending empty array? Or rework onFilterChange to accept removals?
            // Actually, `onFilterChange` typically merges. 
            // Let's assume sending EMPTY array clears it.
            onFilterChange({ [item.filterCode]: [] });
        } else {
            const currentIds = currentParam.split(',').map(v => !isNaN(Number(v)) ? Number(v) : v);
            const newIds = currentIds.filter(id => id != item.value);
            onFilterChange({ [item.filterCode]: newIds });
        }
    };

    if (applied.length === 0) return null;

    return (
        <div className="flex flex-col gap-3">
            {/* Group by Filter Name for cleaner look? User requested: "category: apple phones... Colors: pink..." */}
            {/* Let's group them */}
            {Object.entries(applied.reduce((acc, item) => {
                if (!acc[item.label]) acc[item.label] = [];
                acc[item.label].push(item);
                return acc;
            }, {} as Record<string, typeof applied>)).map(([label, items]) => (
                <div key={label} className="text-sm">
                    <span className="font-semibold text-gray-700 block mb-1 capitalize">{label}:</span>
                    <div className="flex flex-wrap gap-2">
                        {items.map((item, idx) => (
                            <span key={`${item.filterCode}-${idx}`} className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-800 px-2 py-1 rounded text-xs">
                                {item.displayValue}
                                <button
                                    onClick={() => removeFilter(item)}
                                    className="ml-1 text-neutral-500 hover:text-red-500 focus:outline-none"
                                    aria-label={`Remove ${item.displayValue}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            ))}
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

    // Normalize helper (duplicated for now to avoid prop drilling or large refactor)
    const normalizeForMatch = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Map 'Brands' to 'manufacturer' code if needed, otherwise use name lowercase
    // Prioritize API 'code' if available
    // If filter name matches category name, treat as 'category' code
    const isCategoryMatch = categoryName && normalizeForMatch(filter.name) === normalizeForMatch(categoryName);
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

