
import PageContainer from "@/components/pageContainer";
import Image from "next/image";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { privacyPolicyData } from "@/database/sample-data";

const PrivacyPolicy = () => {
    return (
        <PageContainer>
            <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-[400px] items-center justify-center bg-white lg:px-8 px-4 py-12">
                <div className="flex flex-col gap-4">
                    <h1 className="lg:text-4xl text-3xl font-bold text-gray-900">Privacy Policy</h1>
                    <p className="lg:text-base text-sm text-gray-600">At ansargallery.com, we respect your privacy. We inform our users on how we collect, use, share, and protect your personal data. Every time you interact with ansargallery.com through either our physical stores or e-commerce websites and engage our services, you agree to the use of information that is collected or submitted as stated in this Privacy Policy. Looking after your personal information is important to us, which is why we would like you to be confident that your data is kept safe and secured with us. This Privacy Policy applies to all personal information collected by Ansar Gallery.com. ansargallery.com can be referred here to as “Ansar Gallery”, “we”, “our” or “us” in this privacy statement as applicable. At Ansar Gallery, we are working hard to serve our customers better as we are keeping the personal data shared to us. We keep it as confidential and private as possible, which has become one of our top priorities. This privacy statement will further explain how and why we collect your personal information for the purpose of both managing your accounts with us and processing transactions made between you and ansargallery.com.</p>
                </div>

                <div className="relative w-full h-[300px] lg:h-[400px]">
                    <Image
                        src="/images/privacy_policy.webp"
                        alt="Privacy Policy"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            <div className=" lg:pb-10 pb-8 max-w-full mx-auto my-4">
                <Accordion type="multiple" className="w-full space-y-4 bg">
                    {privacyPolicyData.map((item, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-none bg-white rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5 text-gray-800">
                                <span dangerouslySetInnerHTML={{ __html: item.question }} />
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-base pb-6 leading-relaxed">
                                <span dangerouslySetInnerHTML={{ __html: item.option1 }} />
                            </AccordionContent>
                            {item.option2 && (
                                <AccordionContent className="text-gray-600 text-base pb-6 leading-relaxed">
                                    <span dangerouslySetInnerHTML={{ __html: item.option2 }} />
                                </AccordionContent>
                            )}
                            {item.option3 && (
                                <AccordionContent className="text-gray-600 text-base pb-6 leading-relaxed">
                                    <span dangerouslySetInnerHTML={{ __html: item.option3 }} />
                                </AccordionContent>
                            )}
                            {item.option4 && (
                                <AccordionContent className="text-gray-600 text-base pb-6 leading-relaxed">
                                    <span dangerouslySetInnerHTML={{ __html: item.option4 }} />
                                </AccordionContent>
                            )}
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </PageContainer>
    );
};

export default PrivacyPolicy;
