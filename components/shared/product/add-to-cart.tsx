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
const AddToCart = ({
  product,
  variant,
}: {
  product: CatalogProduct;
  variant?: string;
}) => {
  // const [isPendingPlus, startTransitionplus] = useTransition();
  const { items } = useCartStore();
  const { addItem, decrementItem } = useCartActions();
  const [showAddButton, setShowAddButton] = useState<boolean>(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { dict } = useDictionary();
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<'add' | 'remove' | null>(null);

  const animateQuantityButtons = () => {
    setShowAddButton(false);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setShowAddButton(true);
    }, 5000);
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

    // Optimistically switch to counter view immediately
    const addPromise = addItem(product, 1);
    animateQuantityButtons();

    try {
      await addPromise;
      toast.success(`${product.name} Item is Added to Cart `, {
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart"),
        },
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRemoveFromCart = async () => {
    setLoadingAction('remove');
    animateQuantityButtons();
    try {
      await decrementItem(product.sku);
      toast.success(`${product.name} is Removed from Cart `);
      console.log("item removed");
    } finally {
      setLoadingAction(null);
    }
  };

  // Check if item exists in cart
  const existItemInCart = items.find(
    (item) => item.product.sku === product.sku
  );

  if (variant === "cardButton") {
    return (
      <div className=" absolute bottom-2 right-2 z-10 ">
        {!showAddButton && existItemInCart ? (
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
              ) : existItemInCart.quantity == 1 ? (
                <Trash className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
            </Button>
            <span className="px-2 bg-white">{existItemInCart.quantity} {product.uom ? product.uom : ""}</span>
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
