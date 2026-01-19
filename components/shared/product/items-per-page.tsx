
"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
interface ItemsPerPageProps {
    currentLimit: number;
    onLimitChange: (limit: number) => void;
    className?: string;
}

export function ItemsPerPage({ currentLimit, onLimitChange, className }: ItemsPerPageProps) {
    const options = [30, 60, 90];

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <span className="text-sm text-muted-foreground whitespace-nowrap lg:block hidden">Items per page:</span>
            <Select
                value={currentLimit.toString()}
                onValueChange={(value) => onLimitChange(Number(value))}
            >
                <SelectTrigger className="w-[80px] h-9">
                    <SelectValue placeholder={currentLimit.toString()} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
