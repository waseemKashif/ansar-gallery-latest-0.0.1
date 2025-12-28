import PageContainer from "@/components/pageContainer";
import BannerSlider from "./banners-slider";
import SecondaryCategories from "./secondary-categories";
import FreeDevMagazine from "./freeDev-magazine";
import EverydayNeeds from "./everydayNeeds";
import DiscountedSlider from "./discountedSlider";
import FramedSection from "./framedSection";
import BathHomeSportBlock from "./bathHomeSportBlock";
import TailrotedSection from "./tailrotedSection";
function HomePage() {
  const bathHomeData = [
    {
      title: "Kitchen & Bath Essentials",
      image: "/images/beauty1.webp",
      link: "/",
      subTitle: "Shop Bathtubs, Showers, Faucets & Vanities",
      gradient: "bg-gradient-to-r from-[#97A367] to-[#A4AE7A]"
    },
    {
      title: "Modern Home Appliances",
      image: "/images/washingMachine.webp",
      link: "/",
      subTitle: "Discover the latest energy-saving technology.",
      gradient: "bg-gradient-to-r from-[#23539C] to-[#4481DD]"
    },
    {
      title: "Sports & Fitness Essentials",
      image: "/images/cycleWithBall.webp",
      link: "/",
      subTitle: "Gear and Equipment for Every Sport and Outdoor Activity.",
      gradient: "bg-gradient-to-r from-[#E2A141] to-[#DFB473]"
    },
  ]
  return (
    <PageContainer>
      <BannerSlider />
      <SecondaryCategories />
      <FreeDevMagazine />
      <EverydayNeeds />
      <DiscountedSlider title="New Devices Just Added" />
      <FramedSection />
      <DiscountedSlider title="Best Sellers: Scents that Inspire" />
      <section className="mt-2 lg:mt-4 grid grid-cols-3 gap-2">
        {
          bathHomeData.map((item, index) => (
            <BathHomeSportBlock key={index} title={item.title} image={item.image} link={item.link} subTitle={item.subTitle} gradient={item.gradient} />
          ))
        }
      </section>
      <TailrotedSection />
    </PageContainer>
  );
}
export default HomePage;
