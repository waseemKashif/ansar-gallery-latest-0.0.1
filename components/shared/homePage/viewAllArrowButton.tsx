"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useDictionary } from "@/hooks/useDictionary";
const ViewAllArrowButton = ({ url, title }: { url: string, title: string }) => {
    const { dict } = useDictionary();
    return (
        <Link href={url} title={title} className="text-blue-500 hover:text-blue-600 transition-colors  rounded-md text-sm font-medium flex items-center gap-1 pr-2">
            {dict?.common?.viewAll}
            <ArrowRight className="w-4 h-4" />
        </Link>
    )
}
export default ViewAllArrowButton
