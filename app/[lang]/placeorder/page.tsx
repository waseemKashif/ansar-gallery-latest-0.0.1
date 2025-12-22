"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/pageContainer";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { usePersonalInfo } from "@/lib/user";
import { useAddress, useMapLocation } from "@/lib/address";
import { Loader2, MapPin, Phone, CreditCard, Banknote, CheckCircle2, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
// import { usePlaceOrder } from "@/lib/order";
import { useGetGuestCheckoutData, useGetLoggedInCheckoutData, usePlaceOrder } from "@/lib/placeorder/usePlaceOrder";
import { useAuthStore } from "@/store/auth.store";
import { useCheckoutData } from "@/lib/placeorder/useCheckoutData";
const PlaceOrderPage = () => {
    const router = useRouter();
    const { items, totalPrice } = useCartStore();
    const { personalInfo, isLoading: isPersonalLoading } = usePersonalInfo();
    const { address, isLoading: isAddressLoading } = useAddress();
    const { location, isLoading: isLocationLoading } = useMapLocation();
    // const { mutateAsync: placeOrder, isPending: isPlaceOrderPending } = usePlaceOrder();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const { mutateAsync: placeOrder, isPending: isPlaceOrderPending } = usePlaceOrder();
    const { userProfile, guestProfile } = useAuthStore();
    // Call hooks at top level with the `enabled` option to control when they run
    const {
        data: checkoutData,
        isLoading: isCheckoutLoading,
        error: checkoutError,
        refetch: refetchCheckout
    } = useCheckoutData({
        isAuthenticated,
        isAuthLoading,
        userId: userProfile?.id,
        guestQuoteId: guestProfile?.id
    });


    const isLoading = isPersonalLoading || isAddressLoading || isLocationLoading || isAuthLoading;
    useEffect(() => {
        if (!isLoading) {
            if (!address || !location || !items?.length || !personalInfo?.phone_number) {
                router.push("/user-information");
            }
        }
        console.log("checkoutData", checkoutData);
    }, [address, location, items, personalInfo, router, isLoading, checkoutData]);
    // Log checkout data when it changes

    const handlePlaceOrder = async () => {
        setIsPlacingOrder(true);
        const quoteId = personalInfo?.id;
        const customerId = personalInfo?.id;
        const body = {
            comment: "Test Order placed from new website",
            customerId: customerId,
            delivery_date: "12/15/2025",
            delivery_time: "19:00 — 20:00",
            isUser: true,
            orderSource: "New website",
            paymentMethod: paymentMethod || "banktransfer",
            quoteId: quoteId
        }
        try {
            const response = await placeOrder(body);
            console.log("place order the response is ", response);

        } catch (error) {
            console.error("Error placing order:", error);
            setIsPlacingOrder(false);
        }
        // Simulate API call
        setTimeout(() => {
            console.log("Order Placed:", {
                personalInfo,
                address,
                location,
                cart: items,
                paymentMethod,
                total: totalPrice()
            });
            setIsPlacingOrder(false);
            // Navigate to success page or show success message (todo)
            alert("Order placed successfully! (Simulator)");
        }, 2000);
    };

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            </PageContainer>
        );
    }

    if (!address || !location || !items?.length || !personalInfo?.phone_number) {
        return null; // redirecting
    }

    const shippingCost = totalPrice() >= 99 ? 0 : 10;
    const finalTotal = totalPrice() + shippingCost;
    // remove items with same sku and keep only one 
    let uniqueItems;
    if (checkoutData?.items[0]?.data?.length > 0) {
        uniqueItems = checkoutData?.items[0]?.data?.filter((item, index) => {
            return checkoutData?.items[0]?.data?.findIndex((i) => i.sku === item.sku) === index;
        });
    }
    return (
        <PageContainer>
            <h1 className="text-2xl font-bold mb-6">Review & Place Order</h1>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Review & Payment */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Delivery Details Review */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Delivery Details
                            </CardTitle>
                        </CardHeader>
                        {isCheckoutLoading ? (<div className="flex justify-center items-center h-[6vh]">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                        </div>) : (
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-gray-500">Contact Person</Label>
                                        <p className="font-medium">{personalInfo.firstname} {personalInfo.lastname}</p>
                                        <div className="flex items-center gap-1 text-gray-600 mt-1">
                                            <Phone className="h-3 w-3" />
                                            <span>{personalInfo.phone_number}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-500">Shipping Address</Label>
                                        <p className="font-medium">{address.customBuildingName}, {address.street}</p>
                                        <p className="text-gray-600">
                                            {address.city}{address.street ? `, ${address.street}` : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 border">
                                    <span className="font-medium text-gray-900">Map Location: </span>
                                    {location.formattedAddress}
                                </div>

                                <Button variant="link" className="p-0 h-auto text-primary cursor-pointer" onClick={() => router.push('/user-information')}>
                                    <Edit2 className="h-4 w-4" />
                                    Edit Details
                                </Button>
                            </CardContent>
                        )}
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Payment Method
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                                <div className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                                    <RadioGroupItem value="cod" id="cod" />
                                    <Label htmlFor="cod" className="flex-1 cursor-pointer flex items-center gap-2 font-medium">
                                        <Banknote className="h-5 w-5 text-green-600" />
                                        Cash on Delivery
                                    </Label>
                                </div>
                                <div className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                                    <RadioGroupItem value="card" id="card" disabled /> {/* Disabled for now as per plan */}
                                    <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-2 font-medium text-gray-400">
                                        <CreditCard className="h-5 w-5" />
                                        Credit / Debit Card (Coming Soon)
                                    </Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-20">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Items Preview (collapsed list) */}
                            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                                {isCheckoutLoading ? (<div className="flex justify-center items-center h-[6vh]">
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                                </div>) : (
                                    <>
                                        {uniqueItems?.map((item) => (
                                            <div key={item.sku} className="flex gap-3 text-sm">
                                                <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 relative overflow-hidden">
                                                    {/* Placeholder for image if available */}
                                                    {item.image && (
                                                        <Image src={item.image} alt={item.name} width={48} height={48} className="object-cover w-full h-full" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="truncate font-medium">{item.name}</p>
                                                    <p className="text-gray-500 text-xs">Qty: {item.qty}</p>
                                                </div>
                                                <p className="font-medium whitespace-nowrap">
                                                    QAR {(item.price * item.qty).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>QAR {checkoutData?.total[0]?.sub_total}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    {/* <span className={shippingCost === 0 ? "text-green-600" : ""}>
                                        {shippingCost === 0 ? "Free" : `QAR ${shippingCost.toFixed(2)}`}
                                    </span> */}
                                    <span className="text-green-600"> {checkoutData?.total[0]?.delivery}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                    <span>Total</span>
                                    <span>QAR {checkoutData?.total[0]?.total_amount}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full mt-4"
                                size="lg"
                                onClick={handlePlaceOrder}
                                disabled={isPlaceOrderPending}
                            >
                                {isPlaceOrderPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Place Order
                                        <CheckCircle2 className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
};

export default PlaceOrderPage;
