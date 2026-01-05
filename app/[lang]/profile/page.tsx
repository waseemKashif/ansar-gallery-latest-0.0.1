"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import placeholderImage from "@/public/images/placeholder.jpg";
import {
    ShoppingBag,
    MapPin,
    Mail,
    Phone,
    User,
    ArrowRight,
    ChevronDown,
    Edit2,
    Trash2,
    Plus,
    Home,
    Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import PageContainer from "@/components/pageContainer";
import { redirect } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getUserOrders } from "@/lib/user/user.service";
import { OrderItem } from "@/lib/user/user.types";
import { useEffect } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type MenuSection = "profile" | "orders" | "history" | "addresses";

export default function Profile() {
    const [activeSection, setActiveSection] = useState<MenuSection>("profile");
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
    const [expandedMobileSection, setExpandedMobileSection] = useState<MenuSection | null>("profile");
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const userProfile = useAuthStore((state) => state.userProfile);

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


    // console.log("userProfile in profile page", userProfile);
    if (!userProfile || !isAuthenticated) {
        redirect("/");
    }

    // Mock user data

    // here I want to show user data in profile page
    const userData = {
        name: userProfile?.firstname + " " + userProfile?.lastname ? userProfile?.firstname + " " + userProfile?.lastname : "Add name",
        email: userProfile?.email ? userProfile?.email : "Add email",
        phone: userProfile?.phone_number ? userProfile?.phone_number : "Add phone number",
        joinedDate: userProfile?.created_at ? userProfile?.created_at : "N/A",
        profileImage: placeholderImage ? placeholderImage : "No Image",
    };


    // this is the customer data I get from the server
    // Mock addresses
    // const addresses = [
    //     {
    //         id: 2897,
    //         customer_id: 137481,
    //         region_code: null,
    //         region: null,
    //         region_id: 0,
    //         country_id: "QA",
    //         street: "511",
    //         telephone: "30078398",
    //         postcode: "24",
    //         city: "",
    //         firstname: "waseem kashif",
    //         lastname: "",
    //         prefix: null,
    //         company: null,
    //         custom_address_option: "home",
    //         custom_building_name: null,
    //         custom_building_number: "51",
    //         custom_floor_number: null,
    //         custom_latitude: "25.276850191090695",
    //         custom_longitude: "51.51880492754467",
    //         custom_flat_number: null,
    //         custom_address_label: "test",
    //         default_shipping: true,
    //         default_billing: true
    //     },
    // ]
    const getStatusColor = (status: string) => {
        const lowerStatus = status?.toLowerCase() || "";
        if (lowerStatus.includes("delivered")) {
            return "bg-green-100 text-green-800";
        } else if (lowerStatus.includes("pending") || lowerStatus.includes("processing")) {
            return "bg-blue-100 text-blue-800";
        } else if (lowerStatus.includes("cancel")) {
            return "bg-red-100 text-red-800";
        }
        return "bg-gray-100 text-gray-800";
    };

    const getDeliveryType = (subOrderId: string) => {
        if (!subOrderId) return "Standard Delivery";
        const prefix = subOrderId.split("-")[0];
        if (prefix === "NOL") return "Normal Delivery";
        if (prefix === "EXP") return "Express Delivery";
        if (prefix === "SUP") return "Supplier Delivery";
        return "Standard Delivery";
    };

    const currentOrders = orders.filter(order =>
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
                {/* Profile Header Card */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-8 shadow-sm">
                    {/* <div className="h-32 bg-gradient-to-r from-pink-500 to-pink-800"></div> */}
                    <div className="px-6 ">
                        <div className="flex flex-row items-center gap-4 ">
                            <Image
                                src={userData.profileImage}
                                alt={userData.name}
                                className="w-24 h-24 rounded-full border-4 border-white object-cover"
                            />
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-slate-900 capitalize mb-1">
                                    {userData.name}
                                </h2>
                                <p className="text-slate-600">
                                    🟢 Joined {userData.joinedDate}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Desktop Layout: Sidebar + Content */}
                <div className="hidden lg:grid grid-cols-4 gap-6">
                    {/* Sidebar Menu */}
                    <div className="col-span-1">
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                            <nav className="divide-y divide-slate-200">
                                <button
                                    onClick={() => setActiveSection("profile")}
                                    className={`w-full px-6 py-4 text-left font-semibold transition ${activeSection === "profile"
                                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                                        : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    <User className="w-4 h-4 inline mr-3" />
                                    My Information
                                </button>
                                <button
                                    onClick={() => setActiveSection("orders")}
                                    className={`w-full px-6 py-4 text-left font-semibold transition ${activeSection === "orders"
                                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                                        : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    <ShoppingBag className="w-4 h-4 inline mr-3" />
                                    Current Orders
                                </button>
                                <button
                                    onClick={() => setActiveSection("history")}
                                    className={`w-full px-6 py-4 text-left font-semibold transition ${activeSection === "history"
                                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                                        : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    <ArrowRight className="w-4 h-4 inline mr-3" />
                                    Order History
                                </button>
                                <button
                                    onClick={() => setActiveSection("addresses")}
                                    className={`w-full px-6 py-4 text-left font-semibold transition ${activeSection === "addresses"
                                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                                        : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    <MapPin className="w-4 h-4 inline mr-3" />
                                    Addresses
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-3">
                        {/* Profile Section */}
                        {activeSection === "profile" && (
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                                <div className="px-6 py-8">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-8">
                                        My Information
                                    </h3>

                                    <div className="space-y-6">
                                        {/* Personal Information */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-900 mb-4">
                                                Personal Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Full Name
                                                    </label>
                                                    <p className="text-slate-900 font-medium">
                                                        {userData.name}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Email Address
                                                    </label>
                                                    <p className="text-slate-900 font-medium flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-slate-500" />
                                                        {userData.email}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Phone Number
                                                    </label>
                                                    <p className="text-slate-900 font-medium flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-slate-500" />
                                                        {userData.phone}
                                                    </p>
                                                </div>
                                                {/* <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Membership Tier
                                                    </label>
                                                    <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                                                        {userData.membershipTier}
                                                    </div>
                                                </div> */}
                                            </div>
                                        </div>

                                        {/* Account Preferences */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-900 mb-4">
                                                Account Preferences
                                            </h4>
                                            <div className="space-y-4">
                                                <label className="flex items-center p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked
                                                        className="w-5 h-5 rounded border-slate-300"
                                                    />
                                                    <span className="ml-3 text-slate-900">
                                                        Receive order updates via email
                                                    </span>
                                                </label>
                                                <label className="flex items-center p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked
                                                        className="w-5 h-5 rounded border-slate-300"
                                                    />
                                                    <span className="ml-3 text-slate-900">
                                                        Receive promotional offers
                                                    </span>
                                                </label>
                                                <label className="flex items-center p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 rounded border-slate-300"
                                                    />
                                                    <span className="ml-3 text-slate-900">
                                                        Subscribe to newsletter
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Account Security */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-900 mb-4">
                                                Security
                                            </h4>
                                            <Button
                                                variant="outline"
                                                className="border-slate-300 text-slate-900 hover:bg-slate-50"
                                            >
                                                Edit Profile Information
                                            </Button>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Orders Section */}
                        {activeSection === "orders" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        Current Orders
                                    </h3>
                                    <span className="text-slate-600">
                                        {currentOrders.length} active
                                    </span>
                                </div>

                                {isLoadingOrders ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                                    </div>
                                ) : (
                                    <>
                                        {currentOrders.map((order) => (
                                            <div
                                                key={order.sub_order_id}
                                                className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
                                            >
                                                {/* Order Header */}
                                                <button
                                                    onClick={() =>
                                                        setExpandedOrder(
                                                            expandedOrder === order.order_id ? null : order.order_id
                                                        )
                                                    }
                                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                                                >
                                                    <div className="flex-1 text-left">
                                                        <div className="flex items-center gap-4 flex-wrap">
                                                            <div>
                                                                <p className="font-semibold text-slate-900">
                                                                    Order #{order.order_id}
                                                                </p>
                                                                <p className="text-sm text-slate-600">
                                                                    {order.ordered_date}
                                                                </p>
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
                                                        <p className="font-bold text-slate-900">
                                                            QAR {order.order_price}
                                                        </p>
                                                    </div>
                                                    <ChevronDown
                                                        className={`w-5 h-5 text-slate-600 transition ${expandedOrder === order.order_id ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </button>

                                                {/* Order Details */}
                                                {expandedOrder === order.order_id && (
                                                    <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                                                        <h4 className="font-semibold text-slate-900 mb-4">
                                                            Items in this order
                                                        </h4>
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                {order.order_product_images && order.order_product_images.length > 0 ? (
                                                                    order.order_product_images.map((image, idx) => (
                                                                        <div key={idx} className="bg-white p-2 rounded-lg border border-gray-200">
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
                                                                    <p className="text-gray-500 whitespace-nowrap">No product images available</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 flex gap-2">
                                                            <Button className="bg-blue-600 hover:bg-blue-700 flex-1">
                                                                Track Order
                                                            </Button>
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



                                        {currentOrders.length === 0 && (
                                            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                                                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                <p className="text-slate-600">
                                                    You have no active orders
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Order History Section */}
                        {activeSection === "history" && (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                                    Order History
                                </h3>

                                {isLoadingOrders ? (
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
                                                                <tr
                                                                    key={order.sub_order_id}
                                                                    className="hover:bg-slate-50 transition"
                                                                >
                                                                    <td className="px-6 py-4 font-semibold text-slate-900">
                                                                        #{order.order_id}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-slate-600">
                                                                        {order.ordered_date}
                                                                    </td>
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
                                                                            onClick={() => setSelectedOrder(order)}
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
                        )}

                        {/* Addresses Section */}
                        {activeSection === "addresses" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        Saved Addresses
                                    </h3>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Address
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userProfile?.addresses?.length > 0 ? userProfile?.addresses?.map((address) => (
                                        <div
                                            key={address.id}
                                            className={`rounded-lg border-2 p-6 transition ${address.default_shipping
                                                ? "border-blue-600 bg-blue-50"
                                                : "border-slate-200 bg-white hover:border-slate-300"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Home className="w-4 h-4 text-slate-600" />
                                                        <h4 className="font-semibold text-slate-900">
                                                            {/* {address.custom_address_label} */}
                                                            {address.custom_address_option}
                                                        </h4>
                                                    </div>
                                                    {address.default_shipping && (
                                                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                                            Default Address
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <p className="text-slate-900 font-medium">
                                                    {address.firstname + " " + address.lastname}
                                                </p>
                                                <p className="text-slate-700">
                                                    {address.street}
                                                </p>
                                                <p className="text-slate-700">
                                                    {address.city}, {address.country_id} {address.postcode}
                                                </p>
                                                <p className="text-slate-700">{address.custom_building_number}</p>
                                                <p className="text-slate-700 flex items-center gap-2">
                                                    <Phone className="w-4 h-4" />
                                                    {address.telephone}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                                                >
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    )) : <p>No addresses found</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Layout: Accordion */}
                <div className="lg:hidden space-y-4">
                    {/* My Information Accordion */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setExpandedMobileSection(expandedMobileSection === "profile" ? null : "profile")}
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
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-900 mb-4">
                                            Personal Details
                                        </h4>
                                        <div className="space-y-4 bg-white p-6 rounded-lg">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Full Name
                                                </label>
                                                <p className="text-slate-900 font-medium">
                                                    {userData.name}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Email Address
                                                </label>
                                                <p className="text-slate-900 font-medium flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-slate-500" />
                                                    {userData.email}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Phone Number
                                                </label>
                                                <p className="text-slate-900 font-medium flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-slate-500" />
                                                    {userData.phone}
                                                </p>
                                            </div>
                                            {/* <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Membership Tier
                                                </label>
                                                <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                                                    {userData.membershipTier}
                                                </div>
                                            </div> */}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-900 mb-4">
                                            Account Preferences
                                        </h4>
                                        <div className="space-y-4">
                                            <label className="flex items-center p-4 bg-white rounded-lg cursor-pointer hover:bg-slate-100 transition">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="w-5 h-5 rounded border-slate-300"
                                                />
                                                <span className="ml-3 text-slate-900">
                                                    Receive order updates via email
                                                </span>
                                            </label>
                                            <label className="flex items-center p-4 bg-white rounded-lg cursor-pointer hover:bg-slate-100 transition">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="w-5 h-5 rounded border-slate-300"
                                                />
                                                <span className="ml-3 text-slate-900">
                                                    Receive promotional offers
                                                </span>
                                            </label>
                                            <label className="flex items-center p-4 bg-white rounded-lg cursor-pointer hover:bg-slate-100 transition">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded border-slate-300"
                                                />
                                                <span className="ml-3 text-slate-900">
                                                    Subscribe to newsletter
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-900 mb-4">
                                            Security
                                        </h4>
                                        <Button
                                            variant="outline"
                                            className="border-slate-300 text-slate-900 hover:bg-slate-50 w-full"
                                        >
                                            Edit Profile Information
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Current Orders Accordion */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setExpandedMobileSection(expandedMobileSection === "orders" ? null : "orders")}
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
                                {currentOrders.length > 0 ? (
                                    currentOrders.map((order) => (
                                        <div
                                            key={order.sub_order_id}
                                            className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                                        >
                                            <button
                                                onClick={() =>
                                                    setExpandedOrder(
                                                        expandedOrder === order.sub_order_id ? null : order.sub_order_id
                                                    )
                                                }
                                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
                                            >
                                                <div className="text-left">
                                                    <p className="font-semibold text-slate-900">
                                                        Order #{order.sub_order_id}
                                                    </p>
                                                    <p className="text-sm text-slate-600">{order.ordered_date}</p>
                                                </div>
                                                <ChevronDown
                                                    className={`w-4 h-4 text-slate-600 transition ${expandedOrder === order.sub_order_id ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </button>

                                            {expandedOrder === order.sub_order_id && (
                                                <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                                                                order.order_status
                                                            )}`}
                                                        >
                                                            {order.order_status}
                                                        </span>
                                                        <span className="font-bold text-slate-900">
                                                            {/* QAR {order.total} */}
                                                            QAR {order.order_price}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {order.order_product_images && order.order_product_images.map((image, idx) => (
                                                            <div key={idx} className="bg-white p-1 rounded border border-gray-200">
                                                                <div className="relative w-full h-12">
                                                                    <Image
                                                                        src={image}
                                                                        alt={`Product ${idx}`}
                                                                        fill
                                                                        className="object-contain rounded"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-2 pt-2">
                                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1 h-8">
                                                            Track
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-slate-300 text-slate-700 hover:bg-slate-50 flex-1 h-8"
                                                        >
                                                            Support
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                                        <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-slate-600 text-sm">
                                            No orders currently in progress
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Order History Accordion */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setExpandedMobileSection(expandedMobileSection === "history" ? null : "history")}
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
                                {orders.map((order) => (
                                    <div key={order.sub_order_id} className="bg-white p-4 rounded-lg border border-slate-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    Order #{order.order_id}
                                                </p>
                                                <p className="text-xs text-slate-600">{order.ordered_date}</p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                                                    order.order_status
                                                )}`}
                                            >
                                                {order.order_status}
                                            </span>
                                        </div>
                                        <p className="font-bold text-slate-900 mb-2">QAR {order.order_price}</p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-slate-300 text-slate-700 hover:bg-slate-50 w-full h-8"
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Addresses Accordion */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setExpandedMobileSection(expandedMobileSection === "addresses" ? null : "addresses")}
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
                                <Button className="bg-blue-600 hover:bg-blue-700 w-full mb-4">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Address
                                </Button>
                                {userProfile?.addresses?.length > 0 ? userProfile?.addresses?.map((address) => (
                                    <div
                                        key={address.id}
                                        className={`rounded-lg border-2 p-4 transition ${address.default_shipping
                                            ? "border-blue-600 bg-blue-50"
                                            : "border-slate-200 bg-white"
                                            }`}
                                    >
                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Home className="w-4 h-4 text-slate-600" />
                                                <h4 className="font-semibold text-slate-900">
                                                    {address.custom_address_option}
                                                </h4>
                                            </div>
                                            {address.default_shipping && (
                                                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">
                                                    Default
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1 text-sm mb-3">
                                            <p className="text-slate-900 font-medium">
                                                {address.firstname} {address.lastname}
                                            </p>
                                            <p className="text-slate-700">{address.street}</p>
                                            <p className="text-slate-700">
                                                {address.city}, {address.postcode}
                                            </p>
                                            <p className="text-slate-700">{address.country_id}</p>
                                            <p className="text-slate-700 flex items-center gap-2">
                                                <Phone className="w-3 h-3" />
                                                {address.telephone}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 text-sm">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 h-8"
                                            >
                                                <Edit2 className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-8"
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                )) : <p>No addresses found</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Order Details Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
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
                                    <p className="text-sm md:text-base font-semibold text-slate-900 truncate" title={selectedOrder.sub_order_id}>
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
                                    <p className="text-xs md:text-sm text-slate-500">Delivery Type</p>
                                    <p className="text-sm md:text-base font-semibold text-slate-900">
                                        {getDeliveryType(selectedOrder.sub_order_id)}
                                    </p>
                                </div>
                            </div>

                            {/* Images */}
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-3">Items</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 max-h-[40vh] overflow-y-auto pr-2">
                                    {selectedOrder.order_product_images && selectedOrder.order_product_images.length > 0 ? (
                                        selectedOrder.order_product_images.map((image, idx) => (
                                            <div key={idx} className="bg-white p-2 md:p-4 rounded-lg border border-gray-200 flex items-center justify-center">
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
