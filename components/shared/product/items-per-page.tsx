
"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ItemsPerPageProps {
    currentLimit: number;
    onLimitChange: (limit: number) => void;
}

export function ItemsPerPage({ currentLimit, onLimitChange }: ItemsPerPageProps) {
    const options = [30, 60, 90];

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Items per page:</span>
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
