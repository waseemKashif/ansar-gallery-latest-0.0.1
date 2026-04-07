"use client";
import { Button } from "@/components/ui/button";
import { Plus, Minus, LoaderCircle, Trash, CircleSlash } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { CatalogProduct } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { useDictionary } from "@/hooks/useDictionary";
import { useRouter } from "next/navigation";
import { useCartActions } from "@/lib/cart/cart.api";
import { cn } from "@/lib/utils";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
const AddToCart = ({
  product,
  variant,
  className,
}: {
  product: CatalogProduct;
  variant?: string;
  className?: string;
}) => {
  // const [isPendingPlus, startTransitionplus] = useTransition();
  // const { items } = useCartStore();
  const { items } = useCartStore();
  const { addItem, updateItemQuantity } = useCartActions();
  const [showAddButton, setShowAddButton] = useState<boolean>(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const apiDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isDebouncing = useRef<boolean>(false);
  const { dict } = useDictionary();
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<'add' | 'remove' | null>(null);


  // ... (keeping other parts same, but I need to target specific lines for removal) 


  // const [selectOpen, setSelectOpen] = useState(false);

  // Check if item exists in cart
  const existItemInCart = items.find(
    (item) => item.product.sku === product.sku
  );

  const [optimisticQty, setOptimisticQty] = useState<number>(existItemInCart?.quantity || 0);

  // Sync state with store when not debouncing
  useEffect(() => {
    if (!isDebouncing.current) {
      setOptimisticQty(existItemInCart?.quantity || 0);
    }
  }, [existItemInCart?.quantity]);

  const animateQuantityButtons = () => {
    // If select is open, do not schedule closure
    // if (selectOpen) return;

    setShowAddButton(false);

    // Clear any existing timeout for UI hide
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for UI hide
    timeoutRef.current = setTimeout(() => {
      // Double check state before closing in case it changed
      setShowAddButton(true);
    }, 7000);
  };

  // Helper for update to keep clean
  const updateQtyDebounced = (newQty: number) => {

    if (apiDebounceRef.current) {
      clearTimeout(apiDebounceRef.current);
    }

    isDebouncing.current = true;

    apiDebounceRef.current = setTimeout(async () => {
      try {
        if (newQty <= 0) {
          // Treating 0 as remove. 
          // If API supports updating to 0, use updateItemQuantity. 
          // Otherwise we might need decrementItem loop or assuming 0 removes.
          // For safety with current knowns, if 0, we use decrementItem if quantity was 1? 
          // But here we set arbitrary qty.
          // Let's try updateItemQuantity(0). If it fails, we catch.
          await updateItemQuantity(product.sku, newQty);
          if (newQty === 0) toast.success(`${product.name} is Removed from Cart `);
        } else {
          await updateItemQuantity(product.sku, newQty);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to update cart");
        setOptimisticQty(existItemInCart?.quantity || 0);
      } finally {
        isDebouncing.current = false;
        setLoadingAction(null);
      }
    }, 1200);
  }


  const handleAddToCart = async () => {
    if (product?.max_qty && product.max_qty === optimisticQty) {
      toast.error(`Item Purchase limit exceeded`);
      return;
    }

    animateQuantityButtons(); // Reset UI timer

    // CAS 1: Item NOT in cart (Qty 0 -> 1)
    if (!existItemInCart) {
      setLoadingAction('add');
      try {
        // Immediate add for first item
        await addItem(product, 1);
        setOptimisticQty(1);
        toast.success(`${product.name} Item is Added to Cart `, {
          duration: 1400,
          action: {
            label: "View Cart",
            onClick: () => router.push("/cart"),
          },
          actionButtonStyle: {
            background: "#00A300",
            color: "#fff",
            border: "none",
          },
          style: {
            background: "#00A300",
            color: "#fff",
            border: "none",
          },
        });
      } catch (_error) {
        toast.error("Failed to add item to cart");
      } finally {
        setLoadingAction(null);
      }
      return;
    }

    // CASE 2: Item IS in cart (Qty N -> N+1)
    // Optimistic Update
    const newQty = optimisticQty + 1;
    setOptimisticQty(newQty);

    // Debounce API
    updateQtyDebounced(newQty);
  };

  const handleRemoveFromCart = async () => {
    const newQty = optimisticQty - 1;
    if (newQty < 0) return; // Should not happen if UI is correct

    animateQuantityButtons();
    setOptimisticQty(newQty);

    if (newQty === 0) {
      // Debounced removal? Or immediate?
      // User might click '-' then '+' quickly (oops, didn't mean to remove).
      // So debouncing removal is good.
      // Special API handling for 0 might be needed.
      // Let's use `decrementItem` if we hit 0, assuming it handles "remove from cart".
      // But we want to debounce it.

      if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
      isDebouncing.current = true;
      apiDebounceRef.current = setTimeout(async () => {
        try {
          // If we are at 0, we want to remove.
          // decrementItem removes item if qty drops to 0? usually yes.
          // BUT we need to ensure we remove the item corresponding to the SKU.
          // Previous code: await decrementItem(product.sku);
          // If we are debouncing, we just do it once.

          // Note: If user went 5 -> 0 rapidly.
          // If we call decrementItem, it might only decrement by 1 from server state (which is 5).
          // API mismatch risk!
          // We MUST use `updateItemQuantity(sku, 0)` or `removeItem(sku)`.
          // Checking `cart.api.ts` isn't possible right now but `updateItemQuantity` is standard.
          // If I click 5 times, effectively I want to set Qty=0.

          // Strategy: Call updateItemQuantity(sku, 0).
          await updateItemQuantity(product.sku, 0);
          toast.success(`${product.name} is Removed from Cart `);
        } catch (_e) {
          toast.error("Failed to remove item");
          setOptimisticQty(existItemInCart?.quantity || 1); // Revert?
        } finally {
          isDebouncing.current = false;
          setLoadingAction(null);
        }
      }, 1200);
    } else {
      updateQtyDebounced(newQty);
    }
  };




  //   const handleRemoveFromCartOld = async () => {
  //     setLoadingAction('remove');
  //     animateQuantityButtons();
  //     try {
  //       await decrementItem(product.sku);
  //       toast.success(`${product.name} is Removed from Cart `);
  //       console.log("item removed");
  //     } catch (error) {
  //       console.error("Error removing item from cart:", error);
  //       toast.error("Failed to remove item from cart");
  //     } finally {
  //       setLoadingAction(null);
  //     }
  //   };

  if (variant === "cardButton") {
    return (
      <div className={cn(" absolute bottom-1 right-1 z-10 ", className)}>
        {!showAddButton && (existItemInCart || loadingAction === 'add') ? (
          <div className="border-2 border-black rounded-full flex items-center  bg-white overflow-clip transition-opacity duration-300">
            <button
              type="button"
              // variant="ghost"
              onClick={handleRemoveFromCart}
              disabled={loadingAction === 'add'} // Disable remove if adding initial
              className=" rounded-full px-3 hover:bg-accent py-2"
            >
              {" "}
              {loadingAction === 'remove' ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (!optimisticQty || optimisticQty == 1) ? (
                <Trash className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
            </button>
            <div className="bg-white h-8 flex items-center justify-end">
              <span className="px-2 bg-white text-base font-medium">{optimisticQty}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleAddToCart}
              disabled={loadingAction === 'remove'}
              className=" rounded-full"
            >
              {" "}
              {loadingAction === 'add' ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : product?.max_qty ==
                optimisticQty ? (
                <CircleSlash className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <div>
            {showAddButton && existItemInCart?.quantity ? (
              <Button
                className="  max-w-[60px] text-white  bg-primary transition-opacity duration-500 rounded-full border-2 border-gray-800  hover:bg-primary/90 cursor-pointer  hover:text-white"
                type="button"
                onClick={animateQuantityButtons}
                disabled={loadingAction !== null}
                title="open counter"
              >
                {optimisticQty} {product.uom ? product.uom : ""}
              </Button>
            ) : (
              <Button
                className="  max-w-[60px] text-primary  transition-opacity duration-500 rounded-full border-2 border-primary  hover:bg-primary/90 cursor-pointer bg-white hover:text-white"
                type="button"
                onClick={handleAddToCart}
                disabled={loadingAction !== null}
                title="add to cart"
              >
                {" "}
                {dict && dict?.product?.add || "Add"}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
  return (
    <Button
      className=" w-full bg-[#b7d635] hover:bg-gray-800 cursor-pointer"
      type="button"
      onClick={handleAddToCart}
      disabled={loadingAction !== null}
    >
      {" "}
      {loadingAction === 'add' ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Add to cart
    </Button>
  );
};

export default AddToCart;
