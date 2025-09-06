"use client";
import { Button } from "@/components/ui/button";
import { Plus, Minus, LoaderCircle } from "lucide-react";
import { useTransition,useState } from "react";
import { toast } from "sonner";
const AddToCart = ({productId,variant,productName}:{productId:string,variant?:string,productName?:string}) => {
  const [isPendingPlus, startTransitionplus] = useTransition();
  const [cartItems, setCartItems] = useState<string[]>([]);

 const isPending = false;

 const handleAddToCart = () => {
  toast(`${productName} Item is Added to Cart `, {
    action: {
      label: "Undo",
      onClick: () => console.log("Undo"),
    },
  });
   startTransitionplus(() => {
     // Add new item while preserving previous values using spread operator
     setCartItems((prevItems:string[]) => [...prevItems, productId]);

     // Simulate a network request
     new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
       console.log("Item added to cart");
       console.log("Current cart items:", cartItems);
     });
   });
 };

 const handleRemoveFromCart = () => {
   toast(`${productName} is Removed from Cart `);
   // Remove item from cart
   setCartItems((prevItems:string[]) => prevItems.filter((item) => item !== productId));
   console.log("item removed");
 };

 // Check if item exists in cart
 const existItem = cartItems.includes(productId);
if(variant==="cardButton"){
  return (
  <div className=" absolute bottom-2 right-2 z-10">
  {    
  existItem ? (
    <div className=" ">
      <Button
        type="button"
        variant="outline"
        onClick={handleRemoveFromCart}
        disabled={isPending}
      >
        {" "}
        {isPending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </Button>
      <span className="px-2 bg-white">1</span>
      <Button
        type="button"
        variant="outline"
        onClick={handleAddToCart}
        disabled={isPendingPlus}
      >
        {" "}
        {isPendingPlus ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button
      className="  max-w-[60px] text-gray-800  rounded-full border-2 border-gray-800  hover:bg-gray-800 cursor-pointer bg-white hover:text-white"
      type="button"
      onClick={handleAddToCart}
      disabled={isPendingPlus}
    >
      {" "}
      {isPendingPlus && (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) }
      Add
    </Button>
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
