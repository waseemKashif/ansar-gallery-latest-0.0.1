import TailrotedSection from "@/components/shared/homePage/tailrotedSection";
import CartTable from "./cart-table";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1500px] lg:pb-8 pb-4 bg-[#f8f8f8] lg:my-4 my-2 lg:border lg:border-gray-300 lg:rounded-lg lg:shadow-lg lg:px-4 px-0">
      <CartTable />
      <TailrotedSection />
    </div>
  );
}
