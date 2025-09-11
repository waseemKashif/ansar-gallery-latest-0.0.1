"use client";
import { Button } from "@/components/ui/button";
import { Plus, Minus, LoaderCircle, Trash, CircleSlash } from "lucide-react";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Product } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { useRef } from "react";
const AddToCart = ({
  product,
  variant,
}: {
  product: Product;
  variant?: string;
}) => {
  const [isPendingPlus, startTransitionplus] = useTransition();
  const { items, removeSingleCount, addToCart } = useCartStore();
  const [showAddButton, setShowAddButton] = useState<boolean>(true);
  const [maxlimitReached, setMaxlimitReached] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animateQuantityButtons = () => {
    setShowAddButton(false);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setShowAddButton(true);
    }, 4000);
  };
  const isPending = false;
  // const addToCart = useCartStore((state) => state.addToCart);
  const handleAddToCart = () => {
    if (
      product?.extension_attributes?.ah_max_qty == existItemInCart?.quantity
    ) {
      toast.error(`Item Purchase limit exceeded`, {
        action: {
          label: "Ok",
          onClick: () => console.log("ok"),
        },
      });

      return;
    }
    toast.success(`${product.name} Item is Added to Cart `, {
      action: {
        label: "Happy 😊",
        onClick: () => console.log("Happy"),
      },
    });
    addToCart(product, 1);
    animateQuantityButtons();
  };

  const handleRemoveFromCart = () => {
    toast.success(`${product.name} is Removed from Cart `);
    animateQuantityButtons();
    removeSingleCount(product.sku);
    console.log("item removed");
  };

  // Check if item exists in cart
  const existItemInCart = items.find(
    (item) => item.product.sku === product.sku
  );

  console.log(existItemInCart, " this is exit");
  console.log(showAddButton, " this is showAddButton");
  if (variant === "cardButton") {
    return (
      <div className=" absolute bottom-2 right-2 z-10 ">
        {!showAddButton && existItemInCart ? (
          <div className="border-2 border-black rounded-full flex items-center  bg-white overflow-clip transition-opacity duration-300">
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemoveFromCart}
              disabled={isPending}
              className=" rounded-full"
            >
              {" "}
              {isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : existItemInCart.quantity == 1 ? (
                <Trash className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
            </Button>
            <span className="px-2 bg-white">{existItemInCart.quantity}</span>
            <Button
              type="button"
              variant="ghost"
              onClick={handleAddToCart}
              disabled={isPendingPlus}
              className=" rounded-full"
            >
              {" "}
              {product?.extension_attributes?.ah_max_qty ==
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
                disabled={isPendingPlus}
                title="open counter"
              >
                {existItemInCart?.quantity}
              </Button>
            ) : (
              <Button
                className="  max-w-[60px] text-gray-800  transition-opacity duration-500 rounded-full border-2 border-gray-800  hover:bg-gray-800 cursor-pointer bg-white hover:text-white"
                type="button"
                onClick={handleAddToCart}
                disabled={isPendingPlus}
                title="add to cart"
              >
                {" "}
                {isPendingPlus && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                Add
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
      disabled={isPendingPlus}
    >
      {" "}
      {isPendingPlus ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Add to cart
    </Button>
  );
};

export default AddToCart;
