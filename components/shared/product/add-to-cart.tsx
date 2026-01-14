"use client";
import { Button } from "@/components/ui/button";
import { Plus, Minus, LoaderCircle, Trash, CircleSlash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CatalogProduct } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { useRef } from "react";
import { useDictionary } from "@/hooks/useDictionary";
import { useRouter } from "next/navigation";
import { useCartActions } from "@/lib/cart/cart.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const AddToCart = ({
  product,
  variant,
}: {
  product: CatalogProduct;
  variant?: string;
}) => {
  // const [isPendingPlus, startTransitionplus] = useTransition();
  const { items } = useCartStore();
  const { addItem, decrementItem, updateItemQuantity } = useCartActions();
  const [showAddButton, setShowAddButton] = useState<boolean>(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { dict } = useDictionary();
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<'add' | 'remove' | null>(null);
  const [selectOpen, setSelectOpen] = useState(false);

  const animateQuantityButtons = () => {
    // If select is open, do not schedule closure
    if (selectOpen) return;

    setShowAddButton(false);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      // Double check state before closing in case it changed
      setShowAddButton(true);
    }, 7000);
  };

  const handleAddToCart = async () => {
    console.log(product, "this is product for add to cart")
    if (
      product?.max_qty == existItemInCart?.quantity
    ) {
      toast.error(`Item Purchase limit exceeded`, {
        action: {
          label: "Ok",
          onClick: () => console.log("ok"),
        },
      });

      return;
    }

    setLoadingAction('add');
    animateQuantityButtons(); // Immediately update UI

    // Defer store update to next tick to allow UI to paint the loading state first
    setTimeout(async () => {
      try {
        await addItem(product, 1);
        toast.success(`${product.name} Item is Added to Cart `, {
          action: {
            label: "View Cart",
            onClick: () => router.push("/cart"),
          },
        });
      } catch (error) {
        console.error("Error adding item to cart:", error);
        toast.error("Failed to add item to cart");
      } finally {
        setTimeout(() => {
          setLoadingAction(null);
        }, 500);
      }
    }, 0);
  };

  const handleRemoveFromCart = async () => {
    setLoadingAction('remove');
    animateQuantityButtons();
    try {
      await decrementItem(product.sku);
      toast.success(`${product.name} is Removed from Cart `);
      console.log("item removed");
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove item from cart");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleQuantitySelect = async (val: string) => {
    const newQty = Number(val);
    animateQuantityButtons(); // Reset timer on interaction
    try {
      await updateItemQuantity(product.sku, newQty);
    } catch (error) {
      console.error("Error updating item quantity:", error);
      toast.error("Failed to update item quantity");
    }
  };

  // Check if item exists in cart
  const existItemInCart = items.find(
    (item) => item.product.sku === product.sku
  );

  if (variant === "cardButton") {
    return (
      <div className=" absolute bottom-2 right-2 z-10 ">
        {!showAddButton && (existItemInCart || loadingAction === 'add') ? (
          <div className="border-2 border-black rounded-full flex items-center  bg-white overflow-clip transition-opacity duration-300">
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemoveFromCart}
              disabled={loadingAction !== null}
              className=" rounded-full"
            >
              {" "}
              {loadingAction === 'remove' ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (!existItemInCart || existItemInCart.quantity == 1) ? (
                <Trash className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
            </Button>
            <div className="bg-white h-8 flex items-center justify-end">
              {/* <Select
                value={String(existItemInCart?.quantity || 1)}
                onValueChange={handleQuantitySelect}
                onOpenChange={(isOpen) => {
                  setSelectOpen(isOpen);
                  if (isOpen) {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  } else {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    timeoutRef.current = setTimeout(() => {
                      setShowAddButton(true);
                    }, 5000);
                  }
                }}
              >
                <SelectTrigger className="w-auto min-w-[2rem] h-8 border-0 p-0 px-0 text-baseline font-medium focus:ring-0 focus:ring-offset-0 gap-1 justify-center">
                  <SelectValue className="text-base">{existItemInCart?.quantity || 1}</SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[17rem] overflow-y-auto">
                  {Array.from({ length: Math.min(product.max_qty || 0) }, (_, index) => (
                    <SelectItem value={(index + 1).toString()} key={index}>
                      {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
              <span className="px-2 bg-white text-base font-medium">{existItemInCart?.quantity || 1}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleAddToCart}
              disabled={loadingAction !== null}
              className=" rounded-full"
            >
              {" "}
              {loadingAction === 'add' ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : product?.max_qty ==
                existItemInCart?.quantity ? (
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
                className="  max-w-[60px] text-white  bg-gray-800 transition-opacity duration-500 rounded-full border-2 border-gray-800  hover:bg-gray-800 cursor-pointer  hover:text-white"
                type="button"
                onClick={animateQuantityButtons}
                disabled={loadingAction !== null}
                title="open counter"
              >
                {existItemInCart?.quantity} {product.uom ? product.uom : ""}
              </Button>
            ) : (
              <Button
                className="  max-w-[60px] text-gray-800  transition-opacity duration-500 rounded-full border-2 border-gray-800  hover:bg-gray-800 cursor-pointer bg-white hover:text-white"
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
