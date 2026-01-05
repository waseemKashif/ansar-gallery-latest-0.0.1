"use client";

import { useBooklets } from "@/hooks/useBooklets";
import Image from "next/image";
import Link from "next/link";
import PageContainer from "@/components/pageContainer";
const BookletsPage = () => {

    const { data, isLoading, error } = useBooklets();

    if (isLoading) {
        return (
            <PageContainer>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-200 h-[400px] rounded-lg"></div>
                    ))}
                </div>
            </PageContainer>
        );
    }

    if (error) return <div className="text-center py-8 text-red-500">Error: {error.message}</div>;

    return (
        <PageContainer className="container mx-auto px-4 py-4">
            <div className="text-sm text-gray-500 mb-4">
                <Link href="/">Home</Link> <span className="mx-1">›</span> <span>Promotions</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {data?.booklets.map((booklet, index) => (
                    <a
                        key={`${booklet.url}-${index}`}
                        href={booklet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                    >
                        <div className="p-3 bg-white border-b border-gray-100">
                            <h2 className="text-gray-800 font-medium text-lg lg:text-xl line-clamp-2 min-h-[3.5rem] leading-snug mb-1">
                                {booklet.name}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {booklet.date}
                            </p>
                        </div>
                        <div className="relative aspect-[3/4] w-full bg-gray-50">
                            <Image
                                src={booklet.img || "/images/placeholder.jpg"}
                                alt={booklet.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                                width={500}
                                height={500}
                            />
                        </div>
                        {/* Download Footer - optional, makes it clear it's actionable */}
                        {/* <div className="p-2 text-center text-sm font-medium text-[#c9112a]">
                            <EyeIcon className="inline-block mr-1" /> View Promotion
                        </div> */}
                    </a>
                ))}
            </div>
        </PageContainer>
    );
};

export default BookletsPage;