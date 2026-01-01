import PageContainer from "@/components/pageContainer";

const AboutUs = () => {
    return (
        <PageContainer>
            <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-[400px] items-center justify-center bg-white lg:px-8 px-2 lg:py-12 py-4">
                <div className="flex flex-col gap-4">
                    <h1 className="lg:text-4xl text-3xl font-bold text-gray-900">About Us</h1>
                    <p className="lg:text-base text-sm text-gray-600">We are a company that sells furniture and building materials.</p>
                </div>
            </div>
        </PageContainer>
    );
};

export default AboutUs;
