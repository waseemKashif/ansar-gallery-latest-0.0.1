
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
        question: "PERSONAL INFORMATION WE COLLECT",
        option1: "When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site and information about how you interact with the Site. We refer to this automatically-collected information as “Device Information.",
        option2: "<strong>We collect Device Information using the following technologies:</strong> <br> <strong>&apos;Cookies&apos;</strong> are data files that are placed on your device or computer and often include an anonymous unique identifier. For more information about cookies, and how to disable cookies, visit http://www.allaboutcookies.org. ",
        option3: "<strong>&apos;Log files&apos;</strong> track actions occurring on the Site, and collect data including your IP address, browser type, Internet service provider, referring/exit pages, and date/time stamps.",
        option4: "<strong> &apos;Web beacons&apos; , &apos;tags&apos; . and &apos;pixels&apos;  </strong>are electronic files used to record information about how you browse the Site. Additionally, when you make a purchase or attempt to purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information (including credit card numbers, email address, and phone number. We refer to this information as &apos;Order Information&apos;. When we talk about &apos;Personal Information&apos; in this Privacy Policy, we are talking both about Device Information and Order Information.",

    },
    {
        question: "HOW DO WE USE YOUR PERSONAL INFORMATION?",
        option1: "We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to: Communicate with you; ",
        option2: "Screen our orders for potential risk or fraud; and When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services. We use the Device Information that we collect to help us screen for potential risk and fraud (in particular, your IP address), and more generally to improve and optimize our Site (for example, by generating analytics about how our customers browse and interact with the Site, and to assess the success of our marketing and advertising campaigns). ",

    },
    {
        question: "SHARING YOUR PERSONAL INFORMATION",
        option1: "We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to communicate with you; ",
        option2: "<strong> Screen our orders for potential risk or fraud </strong> and When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services. We use the Device Information that we collect to help us screen for potential risk and fraud (in particular, your IP address), and more generally to improve and optimize our Site (for example, by generating analytics about how our customers browse and interact with the Site, and to assess the success of our marketing and advertising campaigns). ",

    },
    {
        question: "SHARING YOUR PERSONAL INFORMATION",
        option1: "We share your Personal Information with third parties to help us use your Personal Information, as described above. We use Google Analytics to help us understand how our customers use the Site--you can read more about how Google uses your Personal Information here: <a target='_blank' href='https://www.google.com/intl/en/policies/privacy/'><strong> Google's Privacy Policy</strong></a> . You can also opt-out of Google Analytics here: <a target='_blank' href=' https://tools.google.com/dlpage/gaoptout'><strong> Google Analytics Opt-out Browser Add-on</strong></a>",
        option2: "Finally, we may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant, or other lawful requests for information we receive, or to otherwise protect our rights.",
    },
    {
        question: "DO NOT TRACK ",
        option1: "Please note that we do not alter our Site&apos;s data collection and use practices when we see a Do Not Track signal from your browser.",
    },
    {
        question: "DATA RETENTION",
        option1: "When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.",
    },
    {
        question: "MINORS",
        option1: "The Site is not intended for individuals under the age of 18.",
        option2: "If your age is below that of 18 years your parents or legal guardians can transact on behalf of you if they are registered users/members.",
    },
    {
        question: "CHANGES",
        option1: "We may update this privacy policy from time to time to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.",
    },
    {
        question: "SOCIAL MEDIA",
        option1: "We operate channels, pages and accounts on some social media sites to inform, assist and engage with customers. We monitor and record comments and posts made on these channels about us so that we can improve our services.",
        option2: "ansargallery.com is not responsible for any information posted on those sites other than information we have posted ourselves.We do not endorse the social media sites themselves or any information posted on them by third parties.",
        option3: "The following companies, <strong>Facebook</strong>, <strong>Twitter</strong>, <strong>Instagram</strong>, <strong>YouTube</strong>, <strong>Google</strong> and <strong>LinkedIn</strong>, may use data for their own purposes, specifically to market to you through their social media platforms and allow engagement on our websites. This includes profiling and targeting you with other advertising",
    }
];

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
                    {faqData.map((faq, index) => (
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
                            {faq.option3 && (
                                <AccordionContent className="text-gray-600 text-base pb-6 leading-relaxed">
                                    <span dangerouslySetInnerHTML={{ __html: faq.option3 }} />
                                </AccordionContent>
                            )}
                            {faq.option4 && (
                                <AccordionContent className="text-gray-600 text-base pb-6 leading-relaxed">
                                    <span dangerouslySetInnerHTML={{ __html: faq.option4 }} />
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
