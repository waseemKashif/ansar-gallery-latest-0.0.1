"use client";
import { ShoppingBagIcon } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartProducts } from "@/lib/cart/cart.api";
import { useAuthStore } from "@/store/auth.store";
import { Dictionary } from "@/lib/i18n";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { MiniCartSidebar } from "@/components/shared/cart/mini-cart-sidebar";
import { useUIStore } from "@/store/useUIStore";
import { useDictionary } from "@/hooks/useDictionary";
import Image from "next/image";
const TopCartIcon = ({ dict, style }: { dict: Dictionary, style?: React.CSSProperties }) => {
  const { locale } = useDictionary();
  const { totalItems } = useCartProducts();
  const setCartOpen = useUIStore((state) => state.setCartOpen);
  const isCartOpen = useUIStore((state) => state.isCartOpen);
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRtl = locale === 'ar';
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
        <Image src="/images/cartIcon.svg" alt="Cart" width={25} height={25} />
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
      <div className="hidden lg:block" style={style}>
        {pathname?.endsWith('/cart') ? (
          <Link
            href="/cart"
            aria-label="Cart"
            title="Cart"
            className="text-gray-700 hover:text-gray-900 px-0 py-2 rounded-md text-sm font-medium flex relative items-center"
          >
            <Image src="/images/Carticon.svg" alt="Cart" width={25} height={25} />
            {hydrated && totalItems() > 0 && !isAuthenticated && (
              <span className="absolute top-[-1px] -right-0 bg-red-500 text-white text-xs rounded-full px-2">
                {totalItems()}
              </span>
            )}
            {hydrated && isAuthenticated && totalItems() > 0 && (
              <span className="absolute top-[-1px] -right-0 bg-red-500 text-white text-xs rounded-full px-2">
                {totalItems()}
              </span>
            )}
            {dict.common.cart}
          </Link>
        ) : (
          <Sheet modal={false} open={isCartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Cart"
                title="Cart"
                className="text-gray-700 hover:text-gray-900 px-0 py-2 rounded-md text-sm font-medium flex relative items-center"
              >
                <Image src="/images/Carticon.svg" alt="Cart" width={30} height={30} />
                {hydrated && totalItems() > 0 && !isAuthenticated && (
                  <span className="absolute top-0 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
                    {totalItems()}
                  </span>
                )}
                {hydrated && isAuthenticated && totalItems() > 0 && (
                  <span className="absolute top-0 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
                    {totalItems()}
                  </span>
                )}
                {/* {dict.common.cart} */}
              </button>
            </SheetTrigger>
            <SheetContent
              side={isRtl ? "left" : "right"}
              className="w-[130px] sm:max-w-[150px] p-0 [&>button]:hidden"
              onInteractOutside={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <SheetTitle className="sr-only">Shopping Cart</SheetTitle>
              <SheetDescription className="sr-only">
                View and manage items in your shopping cart
              </SheetDescription>
              <MiniCartSidebar />
            </SheetContent>
          </Sheet>
        )}
      </div>
    </>
  );
};

export default TopCartIcon;
