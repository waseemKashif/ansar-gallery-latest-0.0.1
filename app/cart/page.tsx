import TailrotedSection from "@/components/shared/homePage/tailrotedSection";
import CartTable from "./cart-table";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1500px] pb-8 bg-[#f8f8f8] my-4 border border-gray-300 rounded-lg shadow-lg lg:px-4 px-2">
      <CartTable />
      <TailrotedSection />
    </div>
  );
}
