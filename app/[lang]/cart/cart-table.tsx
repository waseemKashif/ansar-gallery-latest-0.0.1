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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { CustomPagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

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
    removeFromCart,
    subTotal,
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
      removeFromCart(sku);
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
  // console.log(items, " cart items")
  const handleUpdateQuantity = async (product: CatalogProduct, newQty: number) => {
    const currentQty = items.find((i) => i.product.sku === product.sku)?.quantity || 0;
    if (newQty === currentQty) return;

    if (newQty > currentQty) {
      const diff = newQty - currentQty;
      handleQuantityIncrease(product, diff); // Modified to accept diff or call multiple times
    } else {
      const diff = currentQty - newQty;
      // We need to decrease 'diff' times. 
      // EXISTING LOGIC for handleQuantityDecrease removes 1 at a time and calls updateCart.
      // For dropdown, we should probably implement a bulk update or loop locally.
      // Given current store implementation:
      startTransition(async () => {
        try {
          // This is a simplification. Ideally, updateCart API supports setting quantity directly.
          // If strictly add/remove 1 logic in store:
          for (let i = 0; i < diff; i++) {
            removeSingleCount(product.sku);
          }
          // Ideally we also call API update? The store `removeSingleCount` updates local state.
          // `updateCart` syncs local state to server.
          await updateCart();
        } catch (error) {
          console.error("Error updating cart:", error);
        }
      });
    }
  };

  // Helper wrapper for increase to match signature needed if we refactor handleQuantityIncrease
  // But strictly, handleQuantityIncrease takes (product). It adds 1.
  // We need to improve handleQuantityIncrease/Decrease or just implement logic here.

  const handleWrapperUpdateQuantity = async (product: CatalogProduct, newQty: number) => {
    const item = items.find((i) => i.product.sku === product.sku);
    if (!item) return;
    const currentQty = item.quantity;

    if (newQty > currentQty) {
      const diff = newQty - currentQty;
      startTransitionPlus(async () => {
        addToCart(product, diff); // addToCart(product, qty) adds qty items
        await updateCart();
      });
    } else if (newQty < currentQty) {
      const diff = currentQty - newQty;
      startTransition(async () => {
        for (let i = 0; i < diff; i++) {
          removeSingleCount(product.sku);
        }
        await updateCart();
      });
    }
  };

  // filter out out of stock item which max_qty is 0
  const filteredItems = items.filter((item) => {
    if (item?.product?.is_sold_out) {
      return false;
    }
    return true;
  }).reverse();

  // Pagination Logic
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const currentTableItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const out_of_stock_items = items.filter((item) => item?.product?.is_sold_out);

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
  // Calculate totals
  const grossTotal = Number(subTotal());
  const discountedTotal = Number(totalPrice());
  const discountAmount = grossTotal - discountedTotal;

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
          {
            out_of_stock_items.length > 0 && (
              <div className="bg-white px-4 py-2 rounded-lg mb-4 border border-red-200" >

                <CartOutOfStockTable
                  items={out_of_stock_items}
                  onRemove={handleRemoveSingleItem}
                  isUpdating={isUpdating}
                  baseImageUrl={baseImageUrl}
                />
              </div>
            )}
          <div className="bg-white lg:p-4 p-2 rounded-lg">

            {!isRemoveCartPending && (
              <>
                <div className="flex items-center justify-between border-b pb-4 ">
                  <h3 className="text-xl font-bold">Items in your cart</h3>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 ">
                        <Trash className="w-4 h-4" />
                        Clear Cart
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your all items from your cart.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveCart}>
                          {isRemoveCartPending ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            "Continue"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <CartInStockTable
                  items={currentTableItems}
                  onUpdateQuantity={handleWrapperUpdateQuantity}
                  isUpdating={isUpdating}
                  baseImageUrl={baseImageUrl}
                  removeSingleItem={handleRemoveSingleItem}
                />

                {totalPages > 1 && (
                  <div className="py-4 border-t border-gray-100 mt-4">
                    <CustomPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* DeleteAllAlert Removed - Configured in Header */}
        </div>

        <div className="lg:px-4 lg:py-2 bg-white rounded-lg lg:sticky lg:top-28 lg:h-fit">

          <CartSummary
            subTotal={grossTotal}
            discount={discountAmount}
            totalItems={totalItems()}
            onProceed={handleProceed}
            isProceeding={isProceedPending}
            isUpdating={isUpdating}
            hasItems={filteredItems?.length > 0}
          />
          {/* Report Issue */}
          <div className="text-center">
            <Link href="/report-issue" className="text-red-500 hover:underline font-medium text-xs">Report an Issue</Link>
          </div>
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