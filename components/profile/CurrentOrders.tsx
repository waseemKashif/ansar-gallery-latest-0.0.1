import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronDown, ShoppingBag, Loader2 } from "lucide-react";
import { OrderItem } from "@/lib/user/user.types";

interface CurrentOrdersProps {
    orders: OrderItem[];
    isLoading: boolean;
    getStatusColor: (status: string) => string;
}

const CurrentOrders = ({ orders, isLoading, getStatusColor }: CurrentOrdersProps) => {
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">Current Orders</h3>
                <span className="text-slate-600">{orders.length} active</span>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            ) : (
                <>
                    {orders.map((order) => (
                        <div
                            key={order.sub_order_id}
                            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
                        >
                            {/* Order Header */}
                            <button
                                onClick={() =>
                                    setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)
                                }
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                            >
                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div>
                                            <p className="font-semibold text-slate-900">Order #{order.order_id}</p>
                                            <p className="text-sm text-slate-600">{order.ordered_date}</p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                                order.order_status
                                            )}`}
                                        >
                                            {order.order_status}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right mr-4">
                                    <p className="font-bold text-slate-900">QAR {order.order_price}</p>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-slate-600 transition ${expandedOrder === order.order_id ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {/* Order Details */}
                            {expandedOrder === order.order_id && (
                                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                                    <h4 className="font-semibold text-slate-900 mb-4">Items in this order</h4>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {order.order_product_images && order.order_product_images.length > 0 ? (
                                                order.order_product_images.map((image, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-white p-2 rounded-lg border border-gray-200"
                                                    >
                                                        <div className="relative w-full h-24">
                                                            <Image
                                                                src={image}
                                                                alt={`Product ${idx + 1}`}
                                                                fill
                                                                className="object-contain rounded"
                                                            />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 whitespace-nowrap">
                                                    No product images available
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button className="bg-blue-600 hover:bg-blue-700 flex-1">Track Order</Button>
                                        <Button
                                            variant="outline"
                                            className="border-slate-300 text-slate-900 hover:bg-slate-50 flex-1"
                                        >
                                            Contact Support
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600">You have no active orders</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CurrentOrders;
