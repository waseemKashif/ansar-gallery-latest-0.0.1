import PageContainer from "@/components/pageContainer";
import Image from "next/image";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { termsAndConditionsData } from "@/database/sample-data";

const TermsAndConditions = () => {
    return (
        <PageContainer>
            <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-[400px] items-center justify-center bg-white lg:px-8 px-4 py-12">
                <div className="flex flex-col gap-4">
                    <h1 className="lg:text-4xl text-3xl font-bold text-gray-900">Terms & Conditions</h1>
                    <p className="lg:text-base text-sm text-gray-600">
                        These Terms and Conditions govern your use of the ansargallery.com website. Please read them carefully as they affect your rights and liabilities under the law.
                    </p>
                </div>

                <div className="relative w-full h-[300px] lg:h-[400px]">
                    <Image
                        src="/images/termsandcontitions.webp"
                        alt="Terms and Conditions"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            <div className="lg:pb-10 pb-8 max-w-full mx-auto my-4">
                <Accordion type="multiple" className="w-full space-y-4">
                    {termsAndConditionsData.map((item, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-none bg-white rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5 text-gray-800">
                                <span dangerouslySetInnerHTML={{ __html: item.question }} />
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-base pb-6 leading-relaxed space-y-3">
                                <div dangerouslySetInnerHTML={{ __html: item.content }} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </PageContainer>
    );
};

export default TermsAndConditions;