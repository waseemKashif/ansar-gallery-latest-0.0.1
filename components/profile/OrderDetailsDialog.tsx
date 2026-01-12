import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useOrderDetails } from "@/hooks/useOrderDetails";
import { Currency } from "@/lib/constants";
interface OrderDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string;
    orderId: string | null;
    locale?: string;
}

const OrderDetailsDialog = ({
    isOpen,
    onClose,
    userId,
    orderId,
    locale = "en",
}: OrderDetailsDialogProps) => {
    const { data, isLoading, error } = useOrderDetails(userId, orderId, locale);
    const orderDetails = data?.data;

    const getStatusColor = (status: string) => {
        const lowerStatus = status?.toLowerCase() || "";
        if (lowerStatus.includes("delivered")) {
            return "bg-green-100 text-green-800";
        } else if (
            lowerStatus.includes("pending") ||
            lowerStatus.includes("processing")
        ) {
            return "bg-blue-100 text-blue-800";
        } else if (lowerStatus.includes("cancel")) {
            return "bg-red-100 text-red-800";
        }
        return "bg-gray-100 text-gray-800";
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[95%] sm:max-w-lg md:max-w-3xl lg:max-w-5xl rounded-lg p-0 max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 md:p-6 border-b border-gray-100">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about your order.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {isLoading ? (
                        <div className="flex h-60 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col h-60 items-center justify-center text-center">
                            <p className="text-red-500 mb-4">Error loading order details.</p>
                            <Button variant="outline" onClick={() => onClose()}>
                                Close
                            </Button>
                        </div>
                    ) : orderDetails ? (
                        <div className="space-y-6">
                            {/* Order Info Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Order ID</p>
                                    <p
                                        className="text-sm font-semibold text-slate-900 truncate"
                                        title={orderDetails.sub_order_id}
                                    >
                                        #{orderDetails.sub_order_id}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Date</p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {new Date(orderDetails.delivered_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Total</p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {Currency} {orderDetails.total}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Status</p>
                                    <span
                                        className={`inline-block px-2 py-1 rounded text-[10px] font-semibold ${getStatusColor(
                                            orderDetails.order_status
                                        )}`}
                                    >
                                        {orderDetails.order_status}
                                    </span>
                                </div>
                            </div>

                            {/* Address Info */}
                            {orderDetails.address && (
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-slate-900 mb-2 text-sm md:text-base">Shipping Address</h4>
                                    <p className="text-sm text-slate-700 font-medium">{orderDetails.address.name}</p>
                                    <p className="text-sm text-slate-600">{orderDetails.address.street}</p>
                                    <p className="text-sm text-slate-600">
                                        {orderDetails.address.city}, {orderDetails.address.state}, {orderDetails.address.zip}
                                    </p>
                                    <p className="text-sm text-slate-600 mt-1">{orderDetails.address.phone}</p>
                                </div>
                            )}

                            {/* Items List */}
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-3 text-sm md:text-base">Items ({orderDetails.items.length})</h4>
                                <div className="space-y-3">
                                    {orderDetails.items.map((item) => (
                                        <div
                                            key={item.item_id}
                                            className="flex gap-3 p-3 bg-white border border-gray-100 rounded-lg"
                                        >
                                            <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                                                <Image
                                                    src={item.image}
                                                    alt={item.item_name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 line-clamp-2">
                                                        {item.item_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">SKU: {item.sku}</p>
                                                </div>
                                                <div className="flex items-end justify-between mt-2">
                                                    <p className="text-xs text-slate-600">
                                                        Qty: {item.ordered_quantity} x {Currency} {item.ordered_price}
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {Currency} {(item.ordered_quantity * item.ordered_price).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="border-t border-slate-100 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-medium text-slate-900">{Currency} {orderDetails.sub_total}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Delivery Charges</span>
                                    <span className="font-medium text-slate-900">{Currency} {orderDetails.delivery_charges}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold border-t border-slate-100 pt-2 mt-2">
                                    <span className="text-slate-900">Total</span>
                                    <span className="text-slate-900">{Currency} {orderDetails.total}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-40 items-center justify-center text-center">
                            <p className="text-gray-500">No details found for this order.</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {orderDetails && (
                    <div className="p-4 md:p-6 border-t border-gray-100 bg-white">
                        <div className="flex justify-end gap-3">
                            <Button className="bg-gray-800 hover:bg-gray-900 text-white w-full md:w-auto">
                                Reorder
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default OrderDetailsDialog;
