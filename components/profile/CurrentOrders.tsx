"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronDown, ShoppingBag, Loader2, Package, MapPin, Clock, CreditCard, Truck } from "lucide-react";
import { CurrentOrder } from "@/lib/user/user.types";
import { fetchCurrentOrders } from "@/lib/user/user.service";
import { useAuthStore } from "@/store/auth.store";
import { useLocale } from "@/hooks/useLocale";
import Link from "next/link";

interface CurrentOrdersProps {
    getStatusColor: (status: string) => string;
}

const CurrentOrders = ({ getStatusColor }: CurrentOrdersProps) => {
    const [orders, setOrders] = useState<CurrentOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const { userId } = useAuthStore();
    const { locale } = useLocale();

    useEffect(() => {
        const loadOrders = async () => {
            if (!userId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                // If userId is undefined, we shouldn't fetch, handled above.
                // Assuming userId could be string or undefined/null from store.
                const data = await fetchCurrentOrders(String(userId), locale);
                setOrders(data);
            } catch (error) {
                console.error("Failed to load current orders", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadOrders();
    }, [userId, locale]);

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
                            key={order.increment_id}
                            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
                        >
                            {/* Order Header (Accordion Trigger) */}
                            <button
                                onClick={() =>
                                    setExpandedOrder(expandedOrder === order.increment_id ? null : order.increment_id)
                                }
                                className="w-full px-4 md:px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                            >
                                <div className="flex-1 text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                        <div>
                                            <p className="font-semibold text-slate-900">Order #{order.increment_id}</p>
                                            <p className="text-xs text-slate-500">{order.sub_title}</p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${getStatusColor(
                                                order.order_status
                                            )}`}
                                        >
                                            {order.order_label}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right mr-4">
                                    <p className="font-bold text-slate-900">QAR {order.grand_total}</p>
                                    <p className="text-xs text-slate-500">{order.items.length} Items</p>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-slate-600 transition duration-200 ${expandedOrder === order.increment_id ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {/* Order Details (Accordion Content) */}
                            {expandedOrder === order.increment_id && (
                                <div className="border-t border-slate-200 bg-slate-50 px-4 md:px-6 py-6 animate-in slide-in-from-top-1 duration-200">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Generic Info */}
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">Shipping Address</p>
                                                    <p className="text-sm text-slate-600 leading-relaxed">{order.shipping_address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Clock className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">Delivery Time</p>
                                                    <p className="text-sm text-slate-600">{order.delivery_time.timerange}</p>
                                                    <p className="text-xs text-slate-400">{order.delivery_time.delivery_from}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <CreditCard className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">Payment Method</p>
                                                    <p className="text-sm text-slate-600 capitalize">{order.payment_method}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Financials */}
                                        <div className="bg-white p-4 rounded-lg border border-slate-200 h-fit">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between text-slate-600">
                                                    <span>Subtotal</span>
                                                    <span>QAR {order.sub_total}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-600">
                                                    <span>Delivery Charges</span>
                                                    <span>QAR {order.delivery_charges}</span>
                                                </div>
                                                {order.total_discount > 0 && (
                                                    <div className="flex justify-between text-green-600">
                                                        <span>Discount</span>
                                                        <span>- QAR {order.total_discount}</span>
                                                    </div>
                                                )}
                                                <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900 text-base">
                                                    <span>Total</span>
                                                    <span>QAR {order.grand_total}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                            <Package className="w-4 h-4" /> Items in Order
                                        </h4>
                                        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="p-3 flex gap-4 items-center">
                                                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded-md border border-gray-100 overflow-hidden">
                                                        <Image
                                                            src={item.img_url}
                                                            alt={item.name}
                                                            fill
                                                            className="object-contain p-1"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900 text-sm line-clamp-2">{item.name}</p>
                                                        <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-slate-900 text-sm">QAR {item.price}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-6 flex flex-col justify-end sm:flex-row gap-3">
                                        <Button className="bg-white hover:bg-gray-100 text-primary border border-primary  w-fit px-6 py-4"><Truck className="w-4 h-4 mr-2" /> Track Order</Button>
                                        <Link href="https://api.whatsapp.com/send/?phone=97460094446&text=Hi,%20Can%20you%20assist%20me?&app_absent=0" target="_blank" className="flex items-center gap-2 text-white bg-primary hover:bg-primary/80 rounded-lg px-4 py-1"><Image src="/images/whatsappIcon.svg" alt="whatsapp" width={14} height={14} /> Contact Support</Link>
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
