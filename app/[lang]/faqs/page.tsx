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

const faqData = [
    {
        question: "How do I order on ansargallery.com?",
        answer: "Browse the site for the product you require Add the product to the cart Proceed to the checkout Follow the directions on payment Await conformation once payment has been done. Please do not hesitate to contact our Customer Service Hotline @4448 6000 Or WhatsApp Chat + 974 6009 4446 and by email customercare@ansargallery.com"
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for most items. The items must be in their original packaging and condition. Please visit our returns page for more detailed information."
    },
    {
        question: "Do you offer international shipping?",
        answer: "Currently, we offer shipping within Qatar. We are working on expanding our services to other regions soon. Stay tuned for updates!"
    },
    {
        question: "How can I contact customer support?",
        answer: "You can reach our customer support team via WhatsApp using the link above, or email us at support@ansargallery.com. Our team is available 24/7 to assist you."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit and debit cards, as well as cash on delivery for selected locations."
    }
];

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

            <div className=" lg:pb-10 pb-8 max-w-full mx-auto my-4">
                <Accordion type="single" collapsible className="w-full space-y-4 bg">
                    {faqData.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-none bg-white rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5 text-gray-800">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-base pb-6 leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </PageContainer>
    );
};

export default FaqPage;
