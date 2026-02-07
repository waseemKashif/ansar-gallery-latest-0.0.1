"use client"
import PageContainer from "@/components/pageContainer";
import { useState, useRef, useEffect } from "react";
import { Locale } from "@/lib/i18n";
import { getSeoContent } from "./seo-content-data";

const SeoBlock = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            if (contentRef.current.scrollHeight > 120) {
                setShowButton(true);
            }
        }
    }, []);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="mb-0">
            <h2 className="text-xl font-bold mb-3 text-gray-800" title={title}>{title}</h2>
            <div
                ref={contentRef}
                className={`text-gray-600 text-sm leading-relaxed transition-all duration-300 ease-in-out relative ${!isExpanded ? 'max-h-[120px] overflow-hidden' : ''
                    }`}
            >
                {children}

                {/* Gradient overlay when collapsed */}
                {!isExpanded && showButton && (
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}
            </div>

            {showButton && (
                <button
                    onClick={toggleExpand}
                    className="text-blue-600 hover:underline text-sm mt-0 focus:outline-none cursor-pointer"
                >
                    {isExpanded ? "show less" : "show more"}
                </button>
            )}
        </div>
    );
};

const SeoSectionHome = ({ lang }: { lang: Locale }) => {
    const content = getSeoContent(lang);

    return (
        <section className="bg-[#ffffff]">
            <PageContainer className="">
                <div className="grid grid-cols-1 gap-2">
                    {content.map((block, index) => (
                        <SeoBlock key={index} title={block.title}>
                            {block.content}
                        </SeoBlock>
                    ))}
                </div>
            </PageContainer>
        </section>
    );
};
export default SeoSectionHome;