"use client";
import { ShoppingBagIcon } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartProducts } from "@/lib/cart/cart.api";
import { useAuthStore } from "@/store/auth.store";
const TopCartIcon = () => {
  const { totalItems } = useCartProducts();
  const [hydrated, setHydrated] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <Link
      aria-label="Cart"
      title="Cart"
      href="/cart"
      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex relative"
    >
      <ShoppingBagIcon className="h-5 w-5" />
      {/* Only render badge after hydration */}
      {hydrated && totalItems() > 0 && !isAuthenticated && (
        <span className="absolute top-[-1px] -right-2 bg-red-500 text-white text-xs rounded-full px-2">
          {totalItems()}
        </span>
      )}
      {hydrated && isAuthenticated && totalItems() > 0 && (
        <span className="absolute top-[-1px] -right-2 bg-red-500 text-white text-xs rounded-full px-2">
          {totalItems()}
        </span>
      )}
      Cart
    </Link>
  );
};

export default TopCartIcon;
