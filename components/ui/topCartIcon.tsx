"use client";
import { ShoppingBagIcon } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartProducts } from "@/lib/cart/cart.api";
import { useAuthStore } from "@/store/auth.store";
import { Dictionary } from "@/lib/i18n";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { MiniCartSidebar } from "@/components/shared/cart/mini-cart-sidebar";
const TopCartIcon = ({ dict }: { dict: Dictionary }) => {
  const { totalItems } = useCartProducts();
  const [hydrated, setHydrated] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <>
      {/* Mobile: Link to Cart */}
      <Link
        aria-label="Cart"
        title="Cart"
        href="/cart"
        className="lg:hidden text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex relative"
      >
        <ShoppingBagIcon className="h-5 w-5" />
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
        {dict.common.cart}
      </Link>

      {/* Desktop: Mini Cart Sidebar */}
      <div className="hidden lg:block">
        <Sheet>
          <SheetTrigger asChild>
            <button
              aria-label="Cart"
              title="Cart"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex relative"
            >
              <ShoppingBagIcon className="h-5 w-5" />
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
              {dict.common.cart}
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[130px] sm:max-w-[150px] p-0">
            <SheetTitle className="sr-only">Shopping Cart</SheetTitle>
            <SheetDescription className="sr-only">
              View and manage items in your shopping cart
            </SheetDescription>
            <MiniCartSidebar />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default TopCartIcon;
