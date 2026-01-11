"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import placeholderImage from "@/public/images/placeholder.jpg";
import { Loader2, ChevronDown, User, ShoppingBag, ArrowRight, MapPin, Plus, Home, Phone, Edit2, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import PageContainer from "@/components/pageContainer";
import { redirect } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getUserOrders } from "@/lib/user/user.service";
import { OrderItem } from "@/lib/user/user.types";
import { useUpdateCart } from "@/lib/cart/cart.api";
import { useCartStore } from "@/store/useCartStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import ProfileSidebar, { MenuSection } from "@/components/profile/ProfileSidebar";
import ProfileInfo from "@/components/profile/ProfileInfo";
import CurrentOrders from "@/components/profile/CurrentOrders";
import OrderHistory from "@/components/profile/OrderHistory";
import SavedAddresses from "@/components/profile/SavedAddresses";

export default function Profile() {
    const [activeSection, setActiveSection] = useState<MenuSection>("profile");
    const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

    // Mobile accordion state
    const [expandedMobileSection, setExpandedMobileSection] = useState<MenuSection | null>("profile");

    const { mutateAsync: updateCart } = useUpdateCart();
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const userProfile = useAuthStore((state) => state.userProfile);
    const [isLogoutLoading, setIsLogoutLoading] = useState(false);
    const useStore = useCartStore();
    const authStore = useAuthStore();
    const clearCart = useStore.clearCart;
    const items = useStore.items;

    // Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            if (userProfile?.id) {
                setIsLoadingOrders(true);
                try {
                    const response = await getUserOrders(userProfile.id);
                    if (response && response.data) {
                        setOrders(response.data);
                    }
                } catch (error) {
                    console.error("Error fetching orders:", error);
                } finally {
                    setIsLoadingOrders(false);
                }
            }
        };

        if (activeSection === "orders" || activeSection === "history") {
            fetchOrders();
        }
    }, [userProfile?.id, activeSection]);

    if (!userProfile || !isAuthenticated) {
        redirect("/");
    }

    // User Data for ProfileInfo
    const userData = {
        name:
            userProfile?.firstname + " " + userProfile?.lastname
                ? userProfile?.firstname + " " + userProfile?.lastname
                : "Add name",
        email: userProfile?.email ? userProfile?.email : "Add email",
        phone: userProfile?.phone_number ? userProfile?.phone_number : "Add phone number",
        joinedDate: userProfile?.created_at ? userProfile?.created_at : "N/A",
        profileImage: placeholderImage ? placeholderImage : "No Image",
    };

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

    const handleLogout = () => {
        if (items.length > 0 && isAuthenticated) {
            setIsLogoutLoading(true);
            updateCart().then(() => {
                console.log("Cart updated successfully");
                authStore.clearAuth();
                clearCart();
                setIsLogoutLoading(false);
            });
        } else {
            authStore.clearAuth();
            clearCart();
            setIsLogoutLoading(false);
        }
    };

    const getDeliveryType = (subOrderId: string) => {
        if (!subOrderId) return "Standard Delivery";
        const prefix = subOrderId.split("-")[0];
        if (prefix === "NOL") return "Normal Delivery";
        if (prefix === "EXP") return "Express Delivery";
        if (prefix === "SUP") return "Supplier Delivery";
        return "Standard Delivery";
    };

    const currentOrders = orders.filter(
        (order) =>
            order.order_status?.toLowerCase().includes("pending") ||
            order.order_status?.toLowerCase().includes("processing")
    );

    if (isAuthLoading) {
        return (
            <PageContainer>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="my-4">
                {/* Desktop Layout: Sidebar + Content */}
                <div className="hidden lg:grid grid-cols-4 gap-6">
                    {/* Sidebar Menu */}
                    <div className="col-span-1">
                        <ProfileSidebar
                            activeSection={activeSection}
                            setActiveSection={setActiveSection}
                            onLogout={handleLogout}
                            isLogoutLoading={isLogoutLoading}
                        />
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-3">
                        {activeSection === "profile" && <ProfileInfo userData={userData} />}
                        {activeSection === "orders" && (
                            <CurrentOrders
                                orders={currentOrders}
                                isLoading={isLoadingOrders}
                                getStatusColor={getStatusColor}
                            />
                        )}
                        {activeSection === "history" && (
                            <OrderHistory
                                orders={orders}
                                isLoading={isLoadingOrders}
                                getStatusColor={getStatusColor}
                                onViewOrder={setSelectedOrder}
                            />
                        )}
                        {activeSection === "addresses" && (
                            <SavedAddresses addresses={userProfile?.addresses || []} />
                        )}
                    </div>
                </div>

                {/* Mobile Layout: Accordion */}
                <div className="lg:hidden space-y-4">
                    {/* My Information Accordion */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() =>
                                setExpandedMobileSection(
                                    expandedMobileSection === "profile" ? null : "profile"
                                )
                            }
                            className="w-full px-6 py-4 text-left font-semibold transition bg-white hover:bg-slate-50 flex items-center justify-between"
                        >
                            <span className="flex items-center gap-3 text-slate-900">
                                <User className="w-4 h-4" />
                                My Information
                            </span>
                            <ChevronDown
                                className={`w-5 h-5 text-slate-600 transition ${expandedMobileSection === "profile" ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        {expandedMobileSection === "profile" && (
                            <div className="border-t border-slate-200 px-6 py-8 bg-slate-50">
                                <div className="-m-6 bg-transparent border-none shadow-none">
                                    <ProfileInfo userData={userData} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Current Orders Accordion */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() =>
                                setExpandedMobileSection(
                                    expandedMobileSection === "orders" ? null : "orders"
                                )
                            }
                            className="w-full px-6 py-4 text-left font-semibold transition bg-white hover:bg-slate-50 flex items-center justify-between"
                        >
                            <span className="flex items-center gap-3 text-slate-900">
                                <ShoppingBag className="w-4 h-4" />
                                Current Orders
                            </span>
                            <ChevronDown
                                className={`w-5 h-5 text-slate-600 transition ${expandedMobileSection === "orders" ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        {expandedMobileSection === "orders" && (
                            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 space-y-4">
                                <CurrentOrders
                                    orders={currentOrders}
                                    isLoading={isLoadingOrders}
                                    getStatusColor={getStatusColor}
                                />
                            </div>
                        )}
                    </div>

                    {/* Order History Accordion */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() =>
                                setExpandedMobileSection(
                                    expandedMobileSection === "history" ? null : "history"
                                )
                            }
                            className="w-full px-6 py-4 text-left font-semibold transition bg-white hover:bg-slate-50 flex items-center justify-between"
                        >
                            <span className="flex items-center gap-3 text-slate-900">
                                <ArrowRight className="w-4 h-4" />
                                Order History
                            </span>
                            <ChevronDown
                                className={`w-5 h-5 text-slate-600 transition ${expandedMobileSection === "history" ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        {expandedMobileSection === "history" && (
                            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 space-y-3">
                                <OrderHistory
                                    orders={orders}
                                    isLoading={isLoadingOrders}
                                    getStatusColor={getStatusColor}
                                    onViewOrder={setSelectedOrder}
                                />
                            </div>
                        )}
                    </div>

                    {/* Addresses Accordion */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() =>
                                setExpandedMobileSection(
                                    expandedMobileSection === "addresses" ? null : "addresses"
                                )
                            }
                            className="w-full px-6 py-4 text-left font-semibold transition bg-white hover:bg-slate-50 flex items-center justify-between"
                        >
                            <span className="flex items-center gap-3 text-slate-900">
                                <MapPin className="w-4 h-4" />
                                Addresses
                            </span>
                            <ChevronDown
                                className={`w-5 h-5 text-slate-600 transition ${expandedMobileSection === "addresses" ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        {expandedMobileSection === "addresses" && (
                            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 space-y-4">
                                <SavedAddresses addresses={userProfile?.addresses || []} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Details Dialog */}
            <Dialog
                open={!!selectedOrder}
                onOpenChange={(open) => !open && setSelectedOrder(null)}
            >
                <DialogContent className="w-[95vw] max-w-3xl rounded-lg p-4 md:p-6">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about your order.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="text-xs md:text-sm text-slate-500">Order ID</p>
                                    <p
                                        className="text-sm md:text-base font-semibold text-slate-900 truncate"
                                        title={selectedOrder.sub_order_id}
                                    >
                                        #{selectedOrder.sub_order_id}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-slate-500">Date</p>
                                    <p className="text-sm md:text-base font-semibold text-slate-900">
                                        {selectedOrder.ordered_date}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-slate-500">Amount</p>
                                    <p className="text-sm md:text-base font-semibold text-slate-900">
                                        QAR {selectedOrder.order_price}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-slate-500">Status</p>
                                    <span
                                        className={`inline-block px-2 py-1 rounded text-[10px] md:text-xs font-semibold mt-1 ${getStatusColor(
                                            selectedOrder.order_status
                                        )}`}
                                    >
                                        {selectedOrder.order_status}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs md:text-sm text-slate-500">
                                        Delivery Type
                                    </p>
                                    <p className="text-sm md:text-base font-semibold text-slate-900">
                                        {getDeliveryType(selectedOrder.sub_order_id)}
                                    </p>
                                </div>
                            </div>

                            {/* Images */}
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-3">Items</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 max-h-[40vh] overflow-y-auto pr-2">
                                    {selectedOrder.order_product_images &&
                                        selectedOrder.order_product_images.length > 0 ? (
                                        selectedOrder.order_product_images.map((image, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-white p-2 md:p-4 rounded-lg border border-gray-200 flex items-center justify-center"
                                            >
                                                <div className="relative w-full h-24 md:h-32">
                                                    <Image
                                                        src={image}
                                                        alt={`Product ${idx + 1}`}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No images available</p>
                                    )}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <Button className="bg-gray-800 hover:bg-gray-900 text-white w-full md:w-auto">
                                    Reorder
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PageContainer>
    );
}
