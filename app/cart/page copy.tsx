"use client";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } =
    useCartStore();

  if (items.length === 0) {
    return <p className="p-4">Your cart is empty 🛒</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.product.sku}
            className="flex items-center justify-between border p-4 rounded"
          >
            <div>
              <h2 className="font-semibold">{item.product.name}</h2>
              <p className="text-gray-500">
                QAR {Number(item.product.price).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={item.quantity}
                min={1}
                onChange={(e) =>
                  updateQuantity(item.product.sku, Number(e.target.value))
                }
                className="w-16 border p-1"
              />
              <Button
                variant="destructive"
                onClick={() => removeFromCart(item.product.sku)}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <p>Total Items: {totalItems()}</p>
        <p className="font-bold">Total Price: QAR {totalPrice().toFixed(2)}</p>
        <Button className="mt-4 w-full">Proceed to Checkout</Button>
      </div>
    </div>
  );
}
