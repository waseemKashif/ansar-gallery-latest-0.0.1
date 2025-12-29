"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { Loader } from "lucide-react";

import { useCartProducts, useUpdateCart } from "@/lib/cart/cart.api";
import { useCartStore } from "@/store/useCartStore";
import PageContainer from "@/components/pageContainer";
import { toast } from "sonner";
import { useRemoveAllItemsFromCart, useRemoveSingleItemFromCart } from "@/lib/cart/cart.api";
import Heading from "@/components/heading";
import { useDictionary } from "@/hooks/useDictionary";

// Components
import { CartOutOfStockTable } from "@/components/cart/cart-out-of-stock-table";
import { CartInStockTable } from "@/components/cart/cart-in-stock-table";
import { DeleteAllAlert } from "@/components/cart/delete-all-alert";
import { CartSummary } from "@/components/cart/cart-summary";
import { SecureCheckoutInfo } from "@/components/cart/secure-checkout-info";
import { CatalogProduct } from "@/types";

// Imports
import { useAuth } from "@/hooks/useAuth";
import { useAddress, useMapLocation } from "@/lib/address";
import { useZoneStore } from "@/store/useZoneStore";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const CartTable = () => {
  const router = useRouter();
  const { loading } = useCartProducts();
  const { mutateAsync: removeCart, isPending: isRemoveCartPending } = useRemoveAllItemsFromCart();
  const { mutateAsync: updateCart, isPending: isUpdating } = useUpdateCart();
  const { mutateAsync: removeSingleItem } = useRemoveSingleItemFromCart();
  const {
    items,
    totalItems,
    totalPrice,
    addToCart,
    clearCart,
    removeSingleCount,
  } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [isDelAllPending, setDeleteAllPending] = useTransition();
  const [isPendingPlus, startTransitionPlus] = useTransition();
  const [isProceedPending, startProceedTransition] = useTransition();
  const [isOOSAlertOpen, setIsOOSAlertOpen] = useState(false);
  const [isRemovingOOS, setIsRemovingOOS] = useState(false);
  const { dict } = useDictionary();
  const baseImageUrl =
    process.env.BASE_IMAGE_URL ||
    "https://www.ansargallery.com/media/catalog/product";

  // Address & Auth Logic
  const { isAuthenticated } = useAuth();
  const { address, isLoading: isLoadingAddress } = useAddress();
  const { zone } = useZoneStore();
  const { openMap } = useMapLocation();

  // Check if user has a valid address selected
  // We consider it valid if there's a street address. Zone is optional but usually present.
  const hasAddress = !!address?.street;

  // Effect: If logged in and no address, open map
  useEffect(() => {
    // Only trigger if we are authenticated, address loading is done, and we still don't have an address
    if (isAuthenticated && !isLoadingAddress && !hasAddress) {
      // Small timeout to allow hydration/render
      const timer = setTimeout(() => {
        openMap();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasAddress, openMap, isLoadingAddress]);

  const handleRemoveCart = async () => {
    setDeleteAllPending(async () => {
      try {
        // Sync empty cart with server
        const response = await removeCart();
        clearCart();
        console.log("response delete all", response);
        toast.success("Cart cleared successfully");
      } catch (error) {
        console.error("Error clearing cart:", error);
        toast.error("Failed to clear cart");
      }
    });
  };

  const handleQuantityDecrease = async (sku: string, currentQty: number, itemID: string) => {
    startTransition(async () => {
      try {
        if (currentQty === 1) {
          await removeSingleItem(itemID);
          toast.success("Item removed from cart");
        }
        removeSingleCount(sku);
        // Sync with server after local update
        await updateCart();

      } catch (error) {
        console.error("Error updating cart:", error);
        toast.error("Failed to update cart");
      }
    });
  };

  const handleQuantityIncrease = async (product: CatalogProduct) => {
    startTransitionPlus(async () => {
      try {
        addToCart(product, 1);
        // Sync with server after local update
        await updateCart();
      } catch (error) {
        console.error("Error updating cart:", error);
        toast.error("Failed to update cart");
      }
    });
  };

  const handleRemoveSingleItem = async (sku: string, itemID: string) => {
    try {
      removeSingleCount(sku);
      // Pass itemID when calling mutateAsync
      const response = await removeSingleItem(itemID);
      console.log("response remove single item", response);
      await updateCart();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  // filter out out of stock item which max_qty is 0
  const filteredItems = items.filter((item) => {
    if (item?.product?.max_qty === 0) {
      return false;
    }
    return true;
  });

  const out_of_stock_items = items.filter((item) => item?.product?.left_qty === 0);
  console.log("items for the cart", items);

  const handleRemoveAllOOS = async () => {
    setIsRemovingOOS(true);
    try {
      // Remove all OOS items sequentially or in parallel
      await Promise.all(out_of_stock_items.map(item => {
        removeSingleCount(item.product.sku);
        return removeSingleItem(item.product.id as string);
      }));
      await updateCart();
      toast.success("Out of stock items removed");
      setIsOOSAlertOpen(false);
    } catch (error) {
      console.error("Error removing OOS items:", error);
      toast.error("Failed to remove items");
    } finally {
      setIsRemovingOOS(false);
    }
  };

  const handleProceed = () => {
    if (out_of_stock_items.length > 0) {
      setIsOOSAlertOpen(true);
    } else {
      startProceedTransition(() => router.push("/placeorder"));
    }
  };

  // Show loading state while fetching cart
  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }
  if (isDelAllPending) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }
  if (!items || (items.length === 0) && !loading) {
    return (
      <PageContainer>
        <div>
          cart is empty <Link href="/" className="text-blue-600 hover:underline">Go to homepage</Link> or add some items from below
        </div>
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <Heading level={1} title={dict?.cart.title || "Shopping cart"} className="lg:py-4 py-2 font-semibold lg:text-2xl text-xl">{dict?.cart.title || "Shopping cart"}</Heading>

      <div className={cn(
        "grid lg:grid-cols-4 lg:gap-5 transition-all duration-300",
        isAuthenticated && !hasAddress && "blur-sm pointer-events-none opacity-50 select-none"
      )}>
        <div className="overflow-x-auto lg:col-span-3">
          {/* Address Bar (Only for logged in users) */}
          {isAuthenticated && (
            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-between z-10 relative">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">Delivery Address:</span>
                {hasAddress ? (
                  <span className="font-semibold text-gray-800">
                    {address?.street ? address.street : ""}
                    {zone ? `, ${zone}` : ""}
                  </span>
                ) : (
                  <span className="text-red-500 font-medium animate-pulse">
                    Please select a delivery address
                  </span>
                )}
              </div>
              <button
                onClick={openMap}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-sm"
              >
                {hasAddress ? "Change Address" : "Select Address"}
              </button>
            </div>
          )}
          <div className="bg-white px-4 py-2 rounded-lg mb-4 border border-red-200" >

            <CartOutOfStockTable
              items={out_of_stock_items}
              onRemove={handleRemoveSingleItem}
              isUpdating={isUpdating}
              baseImageUrl={baseImageUrl}
            />
          </div>
          <div className="bg-white px-4 py-2 rounded-lg">

            {!isRemoveCartPending && (
              <CartInStockTable
                items={filteredItems}
                onIncrease={handleQuantityIncrease}
                onDecrease={handleQuantityDecrease}
                isUpdating={isUpdating}
                isPendingIncrease={isPendingPlus}
                isPendingDecrease={isPending}
                baseImageUrl={baseImageUrl}
              />
            )}
          </div>

          <DeleteAllAlert
            onConfirm={handleRemoveCart}
            isPending={isRemoveCartPending}
            disabled={isUpdating}
          />
        </div>

        <div className="lg:px-4 lg:py-2 bg-white rounded-lg lg:sticky lg:top-28 lg:h-fit">

          <CartSummary
            subTotal={Number(totalPrice())}
            totalItems={totalItems()}
            onProceed={handleProceed}
            isProceeding={isProceedPending}
            isUpdating={isUpdating}
            hasItems={filteredItems?.length > 0}
          />
          {/* Extra Info Section */}
          <SecureCheckoutInfo />
        </div>
      </div>

      <AlertDialog open={isOOSAlertOpen} onOpenChange={setIsOOSAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Out of Stock Items</AlertDialogTitle>
            <AlertDialogDescription>
              Your cart contains items that are currently out of stock. Please remove them to proceed to checkout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingOOS}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveAllOOS} disabled={isRemovingOOS} className="bg-red-600 hover:bg-red-700">
              {isRemovingOOS ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Out of Stock Items"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </PageContainer>
  );
};

export default CartTable;