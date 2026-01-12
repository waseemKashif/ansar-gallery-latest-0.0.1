import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag } from "lucide-react";
import { OrderItem } from "@/lib/user/user.types";

interface OrderHistoryProps {
    orders: OrderItem[];
    isLoading: boolean;
    getStatusColor: (status: string) => string;
    onViewOrder: (order: OrderItem) => void;
}

const OrderHistory = ({
    orders,
    isLoading,
    getStatusColor,
    onViewOrder,
}: OrderHistoryProps) => {
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Order History</h3>

            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            ) : (
                <>
                    {orders.length > 0 ? (
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                                Order #
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                                Date
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                                Amount
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {orders.map((order) => (
                                            <tr key={order.sub_order_id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 font-semibold text-slate-900">
                                                    #{order.order_id}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{order.ordered_date}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-900">
                                                    QAR {order.order_price}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                            order.order_status
                                                        )}`}
                                                    >
                                                        {order.order_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                                        onClick={() => onViewOrder(order)}
                                                    >
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600">No order history found</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OrderHistory;
