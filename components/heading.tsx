import { JSX } from "react";

interface HeadingProps {
    level?: 1 | 2 | 3 | 4 | 5 | 6; // heading level
    children: React.ReactNode;
    className?: string;
}

export default function Heading({
    level = 1,
    children,
    className = "",
}: HeadingProps) {

    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    return <Tag className={className}>{children}</Tag>;
}
