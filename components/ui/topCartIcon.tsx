"use client";
import { ShoppingBagIcon } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { useEffect, useState } from "react";

const TopCartIcon = () => {
  const totalItems = useCartStore((state) => state.totalItems());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <Link
      href="/cart"
      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex relative"
    >
      <ShoppingBagIcon className="h-5 w-5" />
      {/* Only render badge after hydration */}
      {hydrated && totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
          {totalItems}
        </span>
      )}
      Cart
    </Link>
  );
};

export default TopCartIcon;
