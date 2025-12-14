import PageContainer from "@/components/pageContainer";
import BannerSlider from "./banners-slider";
import SecondaryCategories from "./secondary-categories";
import SubBoxCategoriesCard from "./sub-box-categories-card";
import SubCategoriesData from "@/database/SubCategoriesData";
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
      <section className="mt-2 grid grid-cols-3 gap-2">
        {
          bathHomeData.map((item, index) => (
            <BathHomeSportBlock key={index} title={item.title} image={item.image} link={item.link} subTitle={item.subTitle} gradient={item.gradient} />
          ))
        }
      </section>
      <TailrotedSection />
      <section className=" mt-2 flex justify-start m-0 md:grid md:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 gap-2 bg-transparent flex-wrap w-full">
        <SubBoxCategoriesCard subCategories={SubCategoriesData[0].subCategories} label={SubCategoriesData[0].label} mainLink={SubCategoriesData[0].mainLink} />
        <SubBoxCategoriesCard subCategories={SubCategoriesData[1].subCategories} label={SubCategoriesData[1].label} mainLink={SubCategoriesData[1].mainLink} />
        <SubBoxCategoriesCard subCategories={SubCategoriesData[2].subCategories} label={SubCategoriesData[2].label} mainLink={SubCategoriesData[2].mainLink} />
        <SubBoxCategoriesCard subCategories={SubCategoriesData[3].subCategories} label={SubCategoriesData[3].label} mainLink={SubCategoriesData[3].mainLink} />
      </section>

    </PageContainer>
  );
}
export default HomePage;
