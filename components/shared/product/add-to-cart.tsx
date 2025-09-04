"use client";
import { Button } from "@/components/ui/button";
import { Plus, Minus, LoaderCircle } from "lucide-react";
import { useTransition } from "react";
const AddToCart = () => {
  const [isPendingPlus, startTransitionplus] = useTransition();
  const handleAddToCart =  () => {
    console.log("item added")
  };
  const handleRemoveFromCart = () => {
    console.log("item removed")
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
