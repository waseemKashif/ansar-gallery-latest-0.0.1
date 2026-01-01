import PageContainer from "@/components/pageContainer";
import Image from "next/image";

const AboutUs = () => {
    return (
        <PageContainer className="bg-white pt-6 lg:pt-8">
            <div className=" max-w-7xl mx-auto space-y-16 ">
                {/* Header */}
                <div className="text-center mb-6 lg:mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 uppercase tracking-wide">
                        Welcome to <span className="text-[#bad739] ">Ansar Gallery</span>
                    </h1>
                </div>

                {/* Intro Section */}
                <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12 border-b pb-4 lg:pb-8 mb-6 lg:mb-auto">
                    <div className="w-full lg:w-auto flex-shrink-0 flex justify-center">
                        <div className="relative w-48 h-18 lg:w-64 lg:h-24">
                            <Image
                                src="/images/ansar-gallery-logo.webp"
                                alt="Ansar Gallery Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                    <p className="text-gray-600 text-base lg:text-lg leading-relaxed text-justify lg:text-left">
                        Ansar Gallery is a subsidiary brand of Ansar Group established in 2018, under CR number 120616 and venturing into the world of e-commerce in 2021 proudly offering an innovative shopping experience with its wide range selection of products from grocery, fashion, furniture, and much more. Enjoy the best deals at Ansar Gallery Market and get rewards with every product you purchase.
                    </p>
                </div>

                {/* Leadership Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
                    {/* Chairman */}
                    <div className="space-y-6">
                        <div className="flex justify-center lg:justify-start">
                            <div className="w-48 h-48 rounded-full bg-gray-200 overflow-hidden relative border-[6px] border-[#bad739] shadow-lg">
                                {/* Placeholder for Chairman Image */}
                                <Image
                                    src="/images/DrAliAkbar.jpg"
                                    alt="Dr Ali Akbar"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl lg:text-2xl font-medium text-gray-800">
                                Chairman&apos;s Foreword, <span className="text-[#bad739]">Dr. Ali Akbar Shaikh Ali</span>
                            </h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-justify text-sm lg:text-base">
                            The journey began in 1980 with the launch of a single store for a retail business called the New World Company. A few years later, in 1987, the Ansar Group was officially formed with the establishment of an enticing new shopping hub known as the New World Centre. Ansar Group has moved through greater stages of growth from its inception to expansion with 20+ massive malls and Real estate properties that have been attracting a steadily rising number of visitors over the years. Our retail presence now extends across three GCC countries, which are individually tailored to meet the specific needs and requirements of each market.
                        </p>
                    </div>

                    {/* Director */}
                    <div className="space-y-6">
                        <div className="flex justify-center lg:justify-start">
                            <div className="w-48 h-48 rounded-full bg-gray-200 overflow-hidden relative border-[6px] border-[#bad739] shadow-lg">
                                <Image
                                    src="/images/DrHussainSaadat.jpg"
                                    alt="Dr Hussain Saadat"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl lg:text-2xl font-medium text-gray-800">
                                Director&apos;s Message, <span className="text-[#bad739]">Dr. Hussain Saadat</span>
                            </h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-justify text-sm lg:text-base">
                            Ansar Group is the name behind the creation of a varied range of malls and retail destinations that offer quality, lifestyle products and services to its shoppers. As of today, our group encompasses over two million sq. feet of retail space; another 1.3 million sq. feet of warehousing space; 4,000+ well-trained, passionate staff; and a minimum yearly footfall of over 15 million. The core of our success lies in our consumer-driven strategy of providing affordably priced, quality merchandise by sourcing them directly from factories of over fifteen diverse countries such as France, Brazil, Italy, Thailand, Turkey, India, etc. In this way, we eliminate multiple levels of middlemen whose margins push product prices to inflated figures. Today, with an annual growth rate of 25%, our expansion plans include the opening of two new shopping centers in the GCC market, every year. In our journey forward, we commit to continue bringing this exceptional retail mix of attractive prices, quality, and range to our ever-growing number of centers across the region.
                        </p>
                    </div>
                </div>

                {/* Values, Mission, Vision Section */}
                <div className="py-4 lg:pt-12 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Mission */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-medium text-gray-800">
                                Our <span className="text-[#bad739]">Mission</span>
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm text-justify">
                                Our Ansar group family works tirelessly around the clock to meet the expectation and demands of the customers. We stretch our arms across the seas to bring the best to our customers. We are shoulder to shoulder with the latest trend and tradition to fetch the best onboard.
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-medium text-gray-800">
                                Our <span className="text-[#bad739]">Vision</span>
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm text-justify">
                                Our vision is not only To be the most trusted provider of the best worldwide products that ensure the satisfaction of our customers, but also delivering happiness and a great experience to clients, employees, and all our visitors.
                            </p>
                        </div>

                        {/* Values */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-medium text-gray-800">
                                Our <span className="text-[#bad739]">Values</span>
                            </h3>
                            <ul className="text-gray-600 leading-relaxed text-sm space-y-2 text-justify list-disc pl-4">
                                <li>
                                    <strong>Passion</strong> is at the heart of our company. We are continuously moving forward, innovating, and improving.
                                </li>
                                <li>
                                    Each employee represents the company and his <strong>commitment</strong> to the customers is the most valued asset.
                                </li>
                                <li>
                                    <strong>Honesty</strong> is the best tool and most admired which has brought us here with continued growth year after year.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default AboutUs;
