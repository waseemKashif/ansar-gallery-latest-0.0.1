"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { LoaderCircle, Minus, Plus, ArrowRight, Loader, Trash, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { useCartProducts, useUpdateCart } from "@/lib/cart/cart.api";
import { useCartStore } from "@/store/useCartStore";
import PageContainer from "@/components/pageContainer";
import { toast } from "sonner";
import { useRemoveAllItemsFromCart, useRemoveSingleItemFromCart } from "@/lib/cart/cart.hooks";
import Heading from "@/components/heading";

const CartTable = () => {
  const router = useRouter();
  const { loading } = useCartProducts();
  const { mutateAsync: removeCart, isPending: isRemoveCartPending } = useRemoveAllItemsFromCart();
  const { mutateAsync: updateCart, isPending: isUpdating } = useUpdateCart();
  const { mutateAsync: removeSingleItem, isPending: isRemoveSingleItemPending } = useRemoveSingleItemFromCart();
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

  const baseImgaeUrl =
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

  const handleQuantityIncrease = async (product: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
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

  const out_of_stock_items = items.filter((item) => item?.product?.max_qty === 0);

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
  return (
    <PageContainer>
      <Heading level={1} title="Shopping cart" className="lg:py-4 py-2 font-semibold lg:text-2xl text-xl"> Shopping cart</Heading>
      {(!items || items.length === 0) && !loading ? (
        <div>
          cart is empty <Link href="/" className="text-blue-600 hover:underline">Go to homepage</Link> or add some items from below
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            {/* Out of stock items table */}
            {out_of_stock_items?.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-left">Action</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {out_of_stock_items?.map((item) => (
                    <TableRow key={item.product.sku} className="bg-red-50 border-red-50">
                      <TableCell>
                        <Link
                          href={`/productDetails/${item.product.sku}`}
                          className="flex items-center"
                        >
                          <Image
                            src={`${baseImgaeUrl}${item.product.image}`}
                            alt={item.product.name}
                            height={77}
                            width={75}
                            priority={true}
                            className="rounded-md"
                          />
                          <span className="max-w-[300px] overflow-ellipsis line-clamp-2">
                            {item.product.name}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleRemoveSingleItem(item.product.sku, item.product.id as string)}
                          className="cursor-pointer"
                          title="Remove"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 cursor-pointer" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <span>{Number(item.product.price).toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-right text-red-500 font-semibold">
                        <span>Out of stock</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* In stock items table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-left">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isRemoveCartPending &&
                  filteredItems?.map((item) => (
                    <TableRow key={item.product.sku}>
                      <TableCell>
                        <Link
                          href={`/productDetails/${item.product.sku}`}
                          className="flex items-center"
                        >
                          <Image
                            src={`${baseImgaeUrl}${item.product.image}`}
                            alt={item.product.name}
                            height={77}
                            width={75}
                            priority={true}
                            className="rounded-md"
                          />
                          <span className="max-w-[300px] overflow-ellipsis line-clamp-2">
                            {item.product.name}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="flex-center gap-2">
                        <div className="border-2 border-black rounded-full flex items-center max-w-[108px] bg-white overflow-clip transition-opacity duration-300">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleQuantityDecrease(item.product.sku, item.quantity, item.product.id as string)}
                            disabled={isPending || isUpdating}
                            className="rounded-full"
                          >
                            {isPending || isUpdating ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : item.quantity == 1 ? (
                              <Trash className="h-4 w-4" />
                            ) : (
                              <Minus className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="px-2 bg-white">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleQuantityIncrease(item.product)}
                            disabled={isPendingPlus || isUpdating}
                            className="rounded-full"
                          >
                            {isPendingPlus || isUpdating ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span>{Number(item.product.price).toFixed(2)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="inline-flex justify-end w-full border-t pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={isUpdating}>
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your all items from your cart.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction type="submit" onClick={handleRemoveCart}>
                      {isRemoveCartPending ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        "Continue"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div>
            <Card
              className={`${Number(totalPrice()) < 100 ? "" : "border-green-400"
                }`}
            >
              <CardContent className="p-4 gap-4">
                <div className="pb-3 text-lg flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">{totalPrice()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>No of Items</span>
                  <span>{totalItems()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping Price</span>
                  <span>
                    {totalPrice() >= 99 ? (
                      <span className="text-green-700"> Free Shipping</span>
                    ) : (
                      <span>10</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between mb-2 font-bold text-xl">
                  <span>Total (QAR)</span>
                  <span>{totalPrice().toFixed(2)}</span>
                </div>
                <Button
                  className="w-full mt-3"
                  disabled={filteredItems?.length === 0 || isProceedPending || isUpdating}
                  onClick={() =>
                    startProceedTransition(() => router.push("/placeorder"))
                  }
                >
                  {isProceedPending ? (
                    <Loader size={20} className="animate-spin" />
                  ) : (
                    <ArrowRight size={20} />
                  )}{" "}
                  Proceed to checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default CartTable;