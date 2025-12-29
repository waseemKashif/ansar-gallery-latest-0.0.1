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
import { CatalogProduct } from "@/types";

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
  const { dict } = useDictionary();
  const baseImageUrl =
    process.env.BASE_IMAGE_URL ||
    "https://www.ansargallery.com/media/catalog/product";

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

      <div className="grid md:grid-cols-4 md:gap-5">
        <div className="overflow-x-auto md:col-span-3 bg-white">

          <CartOutOfStockTable
            items={out_of_stock_items}
            onRemove={handleRemoveSingleItem}
            isUpdating={isUpdating}
            baseImageUrl={baseImageUrl}
          />

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

          <DeleteAllAlert
            onConfirm={handleRemoveCart}
            isPending={isRemoveCartPending}
            disabled={isUpdating}
          />
        </div>

        <div>
          <CartSummary
            subTotal={Number(totalPrice())}
            totalItems={totalItems()}
            onProceed={() => startProceedTransition(() => router.push("/placeorder"))}
            isProceeding={isProceedPending}
            isUpdating={isUpdating}
            hasItems={filteredItems?.length > 0}
          />
        </div>
      </div>

    </PageContainer>
  );
};

export default CartTable;