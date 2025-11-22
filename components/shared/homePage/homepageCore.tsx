import PageContainer from "@/components/pageContainer";
import BannerSlider from "./banners-slider";
import SecondaryCategories from "./secondary-categories";
import SubBoxCategoriesCard from "./sub-box-categories-card";
import SubCategoriesData from "@/database/SubCategoriesData";

function HomePage() {
  return (
    <PageContainer>
      <BannerSlider />
      <SecondaryCategories />
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
