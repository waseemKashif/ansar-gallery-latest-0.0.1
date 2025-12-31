import PageContainer from "@/components/pageContainer";
import Image from "next/image";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const deliveryInformationData = [
    {
        question: "when I will receive my order?",
        option1: "<strong>Furniture, Building Material:</strong> You’ll be able to schedule a delivery time and date that suits you.",
        option2: "<strong>Household, Electronics, Fashion, and similar small items:</strong> Your products will be delivered in 2-3 business days. Delivery will take a little longer to certain areas."
    },
    {
        question: "How do I select a delivery date and time for my furniture or building material?",
        option1: "<strong>Easy!</strong> You can schedule the delivery of your Ansar Gallery products in a few quick steps at the checkout Select a convenient time to receive your order.",

    },
];

const DeliveryInformation = () => {
    return (
        <PageContainer>
            <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-[400px] items-center justify-center bg-white lg:px-8 px-4 py-12">
                <div className="flex flex-col gap-4">
                    <h1 className="lg:text-4xl text-3xl font-bold text-gray-900">Delivery Policy</h1>
                    <p className="lg:text-base text-sm text-gray-600">Please read our delivery policy carefully before placing an order.</p>
                </div>

                <div className="relative w-full h-[300px] lg:h-[400px]">
                    <Image
                        src="/images/delivery_information.webp"
                        alt="Delivery Information"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            <div className=" lg:pb-10 pb-8 max-w-full mx-auto my-4">
                <Accordion type="multiple" className="w-full space-y-4 bg">
                    {deliveryInformationData.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-none bg-white rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5 text-gray-800">
                                <span dangerouslySetInnerHTML={{ __html: faq.question }} />
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-base pb-6 leading-relaxed">
                                <span dangerouslySetInnerHTML={{ __html: faq.option1 }} />
                            </AccordionContent>
                            {faq.option2 && (
                                <AccordionContent className="text-gray-600 text-base pb-6 leading-relaxed">
                                    <span dangerouslySetInnerHTML={{ __html: faq.option2 }} />
                                </AccordionContent>
                            )}
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </PageContainer>
    );
};

export default DeliveryInformation;
