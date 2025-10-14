"use client"
import PageContainer from "@/components/pageContainer";
import BannerSlider from "./banners-slider";
import { fetchCategories } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
const HomePage = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["best-seller-products"],
    queryFn: fetchCategories,
    retry: 1,
  });
  console.log("the isloading", isLoading)
  console.log("the error", error)
  console.log("the data", data)
  return (
    <PageContainer>
      <BannerSlider />
      <h1>categories here</h1>
    </PageContainer>
  );
};
export default HomePage;
