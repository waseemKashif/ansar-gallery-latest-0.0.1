import PageContainer from "@/components/pageContainer";
import { Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { faqDataOrders, faqDataSecurity, FAQDeliveryData, faqReturnsCancelationsData, faqPaymentsData } from "@/database/sample-data";

const FaqPage = () => {
    return (
        <PageContainer>
            <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-[400px] items-center justify-center bg-white lg:px-8 px-4 py-12">
                <div className="flex flex-col gap-4">
                    <h1 className="lg:text-4xl text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
                    <p className="lg:text-base text-sm text-gray-600">Contact our customer support team and they will get back to you instantly</p>
                    <div className="flex flex-col gap-2 mt-4">
                        <Link href="https://wa.me/yourwhatsappnumber" target="_blank" title="Contact Us on WhatsApp" className="flex items-center gap-2 text-primary font-medium hover:underline">
                            <Mail className="h-5 w-5" /> WhatsApp Support
                        </Link>
                    </div>
                </div>

                <div className="relative w-full h-[300px] lg:h-[400px]">
                    <Image
                        src="/images/faq1.webp"
                        alt="Frequently Asked Questions"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            <div className=" lg:pb-8 pb-4 max-w-full mx-auto my-4">
                <h2 className="lg:text-xl text-base font-bold text-gray-800 px-4">Orders</h2>
                <Accordion type="single" collapsible className="w-full space-y-4 bg">
                    {faqDataOrders.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-none bg-white rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <AccordionTrigger className="text-base font-semibold hover:no-underline py-5 text-gray-800">
                                <span dangerouslySetInnerHTML={{ __html: faq.question }} />
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-sm pb-6 leading-relaxed">
                                <span dangerouslySetInnerHTML={{ __html: faq.answer }} />
                            </AccordionContent>

                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            <div className=" lg:pb-8 pb-4 max-w-full mx-auto">
                <h2 className="lg:text-xl text-base font-bold text-gray-800 px-4">Security</h2>
                <Accordion type="single" collapsible className="w-full space-y-4 bg">
                    {faqDataSecurity.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-none bg-white rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <AccordionTrigger className="text-base font-semibold hover:no-underline py-5 text-gray-800">
                                <span dangerouslySetInnerHTML={{ __html: faq.question }} />
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-sm pb-6 leading-relaxed">
                                <span dangerouslySetInnerHTML={{ __html: faq.answer }} />
                            </AccordionContent>
                            {faq.answer2 && (
                                <AccordionContent className="text-gray-600 text-sm pb-6 leading-relaxed">
                                    <span dangerouslySetInnerHTML={{ __html: faq.answer2 }} />
                                </AccordionContent>
                            )}
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
            <div className=" lg:pb-8 pb-4 max-w-full mx-auto">
                <h2 className="lg:text-xl text-base font-bold text-gray-800 px-4">Payments</h2>
                <Accordion type="single" collapsible className="w-full space-y-4 bg">
                    {faqPaymentsData.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-none bg-white rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <AccordionTrigger className="text-base font-semibold hover:no-underline py-5 text-gray-800">
                                <span dangerouslySetInnerHTML={{ __html: faq.question }} />
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-sm pb-6 leading-relaxed">
                                <span dangerouslySetInnerHTML={{ __html: faq.answer }} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
            <div className=" lg:pb-8 pb-4 max-w-full mx-auto">
                <h2 className="lg:text-xl text-base font-bold text-gray-800 px-4">Delivery</h2>
                <Accordion type="single" collapsible className="w-full space-y-4 bg">
                    {FAQDeliveryData.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-none bg-white rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <AccordionTrigger className="text-base font-semibold hover:no-underline py-5 text-gray-800">
                                <span dangerouslySetInnerHTML={{ __html: faq.question }} />
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-sm pb-6 leading-relaxed">
                                <span dangerouslySetInnerHTML={{ __html: faq.answer }} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
            <div className=" lg:pb-8 pb-4 max-w-full mx-auto">
                <h2 className="lg:text-xl text-base font-bold text-gray-800 px-4 capitalize">Returns / cancellations warranty</h2>
                <Accordion type="single" collapsible className="w-full space-y-4 bg">
                    {faqReturnsCancelationsData.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-none bg-white rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <AccordionTrigger className="text-base font-semibold hover:no-underline py-5 text-gray-800">
                                <span dangerouslySetInnerHTML={{ __html: faq.question }} />
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-sm pb-6 leading-relaxed">
                                <span dangerouslySetInnerHTML={{ __html: faq.answer }} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </PageContainer>
    );
};

export default FaqPage;
