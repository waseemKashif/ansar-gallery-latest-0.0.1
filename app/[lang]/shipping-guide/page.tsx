import PageContainer from "@/components/pageContainer";
import Image from "next/image";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const ShippingGuideData = [
    {
        question: "When will I receive my order?",
        content: `
        <p><strong>Furniture, Building Material:</strong> You'll be able to schedule a delivery time and date that suits you.</p>
        <p><strong>Household, Electronics, Fashion, and similar small items:</strong> Your products will be delivered in <strong>2-3 business days</strong>. Delivery will take a little longer to certain areas.</p>
        <p><strong>Supermarket products:</strong> Your products will be delivered on the same day following the available delivery slot available or chosen during the checkout business days. Delivery will take a little longer to certain areas.</p>
    `
    },
    {
        question: "Does delivery take longer in some areas?",
        content: `
        <p>Delivery will take longer to the following areas: Al Shahaniya, Al Wakrah, Al Shamal, and a few others</p>
    `
    },
    {
        question: "Will I be charged for delivery?",
        content: `
        <p><strong>Here's how your delivery charges work:</strong></p>
        <p>All items: Standard delivery is free on all orders more than <strong>QAR 100</strong> or more.</p>
        <p>If your order value is less than or equal to <strong>QAR 99</strong>, you will be charged <strong>QAR 10</strong> for delivery.</p>
        <p>Your delivery charges will be displayed during the checkout process.</p>
    `
    },
];

const ShippingGuide = () => {
    return (
        <PageContainer>
            <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-[400px] items-center justify-center bg-white lg:px-8 px-4 py-12">
                <div className="flex flex-col gap-4">
                    <h1 className="lg:text-4xl text-3xl font-bold text-gray-900">Shipping Guide</h1>
                    <p className="lg:text-base text-sm text-gray-600">Please read our shipping guide carefully before placing an order.</p>
                </div>

                <div className="relative w-full h-[300px] lg:h-[400px]">
                    <Image
                        src="/images/shippingGuide.webp"
                        alt="Shipping Guide"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            <div className=" lg:pb-10 pb-8 max-w-full mx-auto my-4">
                <Accordion type="multiple" className="w-full space-y-4 bg">
                    {ShippingGuideData.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-none bg-white rounded-xl px-6 shadow-sm hover:shadow-md duration-200 data-[state=open]:space-y-4 transition-all"
                        >
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5 text-gray-800 data-[state=open]:border-gray-200 data-[state=open]:border-b transition-colors duration-200">
                                <span dangerouslySetInnerHTML={{ __html: faq.question }} />
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-base pb-6 leading-relaxed ">
                                <span dangerouslySetInnerHTML={{ __html: faq.content }} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </PageContainer>
    );
};

export default ShippingGuide;
