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
import { useCartProducts } from "@/lib/cart/cart.api";
import { useCartStore } from "@/store/useCartStore";
const CartTable = () => {
  const router = useRouter();
  const { cartItems } = useCartProducts();
  const {
    items,
    // removeFromCart,
    // updateQuantity,
    totalItems,
    totalPrice,
    addToCart,
    clearCart,
    removeSingleCount,
  } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [isDelAllPending, setDelAllPending] = useTransition();
  const [isPendingPlus, startTransitionPlus] = useTransition();
  const [isProceedPending, startProceedTransition] = useTransition();
  const baseImgaeUrl =
    process.env.BASE_IMAGE_URL ||
    "https://www.ansargallery.com/media/catalog/product";
  const handleRemoveCart = () => {
    clearCart();
  };

  console.log("cart items", cartItems);
  // filter out out of stock item which max_qty is 0
  const filteredItems = items.filter((item) => item.product.max_qty > 0);
  const out_of_stock_items = items.filter((item) => item.product.max_qty === 0);
  return (
    <div>
      <h1 className="h2-bold py-4 ">Shopping cart</h1>
      {!items || items.length === 0 ? (
        <div>
          cart is empty <Link href="/">Go to homepage</Link>
        </div>
      ) : (
        <div className=" grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            {/* loop out of stock items here */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className=" text-left">Action</TableHead>
                  <TableHead className=" text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {out_of_stock_items?.map((item) => (
                  <TableRow key={item.product.sku} className=" bg-red-50 border-red-50" >
                    <TableCell>
                      <Link
                        href={`/productDetails/${item.product.sku}`}
                        className="flex items-center "
                      >
                        <Image
                          src={`${baseImgaeUrl}${item.product.image}`}
                          alt={item.product.name}
                          height={77}
                          width={75}
                          priority={true}
                          className=" rounded-md"
                        />
                        <span className=" max-w-[300px] overflow-ellipsis line-clamp-2">
                          {item.product.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell >
                      <button onClick={() => removeSingleCount(item.product.sku)} className=" cursor-pointer" title="Remove">
                        <Trash2 className="h-4 w-4 cursor-pointer" />
                      </button>
                    </TableCell>
                    <TableCell className=" text-right">
                      <span>{Number(item.product.price).toFixed(2)}</span>
                    </TableCell>
                    <TableCell className=" text-right text-red-500 font-semibold">
                      <span>Out of stock</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* loop in stock items here */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className=" text-left">Quantity</TableHead>
                  <TableHead className=" text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isDelAllPending &&
                  filteredItems?.map((item) => (
                    <TableRow key={item.product.sku}>
                      <TableCell>
                        <Link
                          href={`/productDetails/${item.product.sku}`}
                          className="flex items-center "
                        >
                          <Image
                            src={`${baseImgaeUrl}${item.product.image}`}
                            alt={item.product.name}
                            height={77}
                            width={75}
                            priority={true}
                            className=" rounded-md"
                          />
                          <span className=" max-w-[300px] overflow-ellipsis line-clamp-2">
                            {item.product.name}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className=" flex-center gap-2">
                        <div className="border-2 border-black rounded-full flex items-center max-w-[108px] bg-white overflow-clip transition-opacity duration-300">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              removeSingleCount(item.product.sku);
                            }}
                            disabled={isPending}
                            className=" rounded-full"
                          >
                            {isPending ? (
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
                            onClick={() => {
                              addToCart(item.product, 1);
                            }}
                            disabled={isPendingPlus}
                            className=" rounded-full"
                          >
                            {" "}
                            {isPendingPlus ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {/* new buttons ends here */}
                      </TableCell>
                      <TableCell className=" text-right">
                        <span>{Number(item.product.price).toFixed(2)}</span>
                        {/* {item.discountedPrice !== item.regularPrice ? (
                          <div>
                            {makingFinalPrice(
                              Number(item.discountedPrice),
                              item.qty
                            )}
                            <span className=" line-through text-muted-foreground decoration-red-500 decoration-2">
                              {makingFinalPrice(
                                Number(item.regularPrice),
                                item.qty
                              )}
                            </span>
                          </div>
                        ) : (
                          <div>
                            {makingFinalPrice(
                              Number(item.regularPrice),
                              item.qty
                            )}
                          </div>
                        )} */}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="  inline-flex justify-end w-full border-t pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Delete All</Button>
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
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div>
            <Card
              className={`${Number(totalPrice()) < 100 ? "" : " border-green-400"
                }`}
            >
              <CardContent className="p-4 gap-4">
                <div className="pb-3 text-lg flex justify-between ">
                  <span>Subtotal</span>
                  <span className="font-bold">{totalPrice()}</span>
                </div>
                <div className=" flex justify-between mb-2">
                  <span>No of Items</span>
                  <span>{totalItems()}</span>
                </div>
                <div className=" flex justify-between mb-2">
                  <span>Shipping Price</span>
                  <span>
                    {totalPrice() >= 99 ? (
                      <span className=" text-green-700"> Free Shipping</span>
                    ) : (
                      <span>10</span>
                    )}
                  </span>
                </div>
                {/* {cart.discountedPrice && Number(cart.discountedPrice) > 0 && (
                  <div className=" flex justify-between mb-2">
                    <span>Discount</span>
                    <span>{formatCurrency(cart.discountedPrice)}</span>
                  </div>
                )} */}
                <div className=" flex justify-between mb-2 font-bold text-xl">
                  <span>Total (QAR)</span>
                  <span>{totalPrice().toFixed(2)}</span>
                </div>
                <Button
                  className=" w-full mt-3"
                  disabled={items?.length === 0 || isProceedPending}
                  onClick={
                    () =>
                      startProceedTransition(() => router.push("/place-order"))
                    // startTransition(() => router.push("/shipping-address"))
                  }
                >
                  {isProceedPending ? (
                    <Loader size={20} className=" animate-spin" />
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
    </div>
  );
};

export default CartTable;
