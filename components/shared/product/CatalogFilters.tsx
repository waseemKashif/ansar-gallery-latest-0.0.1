
"use client";

import React, { useState } from "react";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";
import { CatalogFilter, FilterOption, PriceFilterOptions } from "@/types";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CatalogFiltersProps {
    categoryId: number;
    // We can add callbacks later for applying filters
    // onFilterChange?: (filters: any) => void;
}

export default function CatalogFilters({ categoryId }: CatalogFiltersProps) {
    const { data: filters, isLoading } = useCatalogFilters(categoryId);
    // Temporary state to manage expanded items if needed, but Accordion handles top level.
    // For nested categories, we might need a recursive component.

    if (isLoading) {
        return <FiltersSkeleton />;
    }

    // Filter out filters with empty options (unless it's Price which is an object not array)
    // Note: The Price filter in the example JSON has "options": { "maxPrice": 21999, "minPrice": 0 }
    // Other filters have "options": [...]
    const validFilters = filters?.filter(f => {
        if (f.name.toLowerCase() === 'price') return true;
        if (Array.isArray(f.options)) {
            return f.options.length > 0;
        }
        return false;
    });

    if (!validFilters || validFilters.length === 0) {
        return null;
    }

    // Default to only the first filter open
    const defaultOpen = validFilters.length > 0 ? [validFilters[0].name.toLowerCase()] : [];

    return (
        <div className="w-full pr-4">
            <Accordion type="multiple" defaultValue={defaultOpen} className="w-full">
                {validFilters.map((filter) => (
                    <FilterSection key={filter.id} filter={filter} />
                ))}
            </Accordion>
        </div>
    );
}

function FilterSection({ filter }: { filter: CatalogFilter }) {
    const isPrice = filter.name.toLowerCase() === "price";

    return (
        <AccordionItem value={filter.name.toLowerCase()} className="border-b-0 mb-4">
            <AccordionTrigger className="flex justify-between items-center py-4 font-medium transition-all [&[data-state=open]>svg]:rotate-180  capitalize cursor-pointer hover:no-underline ">
                <h3 className="text-sm font-bold text-gray-800">{filter.name}</h3>
                <div className="flex items-center gap-2">
                    {/* <AccordionTrigger className="p-0 hover:no-underline "></AccordionTrigger> */}
                </div>
            </AccordionTrigger>

            <AccordionContent>
                {isPrice ? (
                    <PriceFilter options={filter.options as PriceFilterOptions} />
                ) : (
                    <OptionsList options={filter.options as FilterOption[]} isBrand={filter.name.toLowerCase() === "brands"} />
                )}
            </AccordionContent>
        </AccordionItem>
    );
}

function PriceFilter({ options }: { options: PriceFilterOptions }) {
    return (
        <div className="p-1">
            <div className="text-sm">Range: {options.minPrice} - {options.maxPrice}</div>
            {/* Implement Slider/Inputs here */}
        </div>
    );
}

function OptionsList({ options, isBrand }: { options: FilterOption[]; isBrand?: boolean }) {
    if (!Array.isArray(options) || options.length === 0) return null;

    return (
        <ul className="space-y-2">
            {options.map((option) => (
                <li key={option.id}>
                    {isBrand ? (
                        <BrandOption option={option} />
                    ) : (
                        <CategoryOption option={option} />
                    )}
                </li>
            ))}
        </ul>
    );
}

function BrandOption({ option }: { option: FilterOption }) {
    return (
        <div className="flex items-center space-x-2">
            <input type="checkbox" id={`brand-${option.id}`} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <label htmlFor={`brand-${option.id}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {option.value || option.name}
            </label>
        </div>
    )
}

function CategoryOption({ option }: { option: FilterOption }) {
    const hasSubOptions = option.options && Array.isArray(option.options) && option.options.length > 0;
    const [isOpen, setIsOpen] = useState(false);

    // If it has sub-options, it behaves like a tree node
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
                                <OptionsList options={option.options as FilterOption[]} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Leaf node (Selectable category?)
    // In the image, "Men's Fashion" -> Checkbox "All Men's Fashion"
    // And "Men's Shoes" with +

    return (
        <div className="flex items-center space-x-2 py-1 ml-1">
            <input type="checkbox" id={`cat-${option.id}`} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
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

