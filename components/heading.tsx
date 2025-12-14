import { cn } from "@/lib/utils";
import { JSX } from "react";

interface HeadingProps {
    level?: 1 | 2 | 3 | 4 | 5 | 6; // heading level
    children: React.ReactNode;
    className?: string;
    title: string;
}

export default function Heading({
    level = 1,
    children,
    className = "",
    title,
}: HeadingProps) {

    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    switch (level) {
        case 1:
            return <Tag className={cn("text-[#111] text-[2rem] font-bold", className)} title={title}>{children}</Tag>;
        case 2:
            return <Tag className={cn("text-[#111] text-[1.125rem] font-semibold", className)} title={title}>{children}</Tag>;
        case 3:
            return <Tag className={cn("text-[#111] text-[0.75rem] font-semibold", className)} title={title}>{children}</Tag>;
        case 4:
            return <Tag className={cn("text-[#111] text-[0.5rem]", className)} title={title}>{children}</Tag>;
        case 5:
            return <Tag className={cn("text-[#111] text-[0.25rem]", className)} title={title}>{children}</Tag>;
        case 6:
            return <Tag className={cn("text-[#111] text-[0.125rem]", className)} title={title}>{children}</Tag>;
        default:
            return <Tag className={cn("text-[#111] text-[1rem]", className)} title={title}>{children}</Tag>;
    }
}
