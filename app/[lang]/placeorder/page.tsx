"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/pageContainer";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { usePersonalInfo } from "@/lib/user";
import { useAddress, useMapLocation } from "@/lib/address";
import { Loader2, MapPin, Phone, CreditCard, Banknote, CheckCircle2, Edit2, CarTaxiFrontIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
// import { usePlaceOrder } from "@/lib/order";
import { useGetGuestCheckoutData, useGetLoggedInCheckoutData, usePlaceOrder } from "@/lib/placeorder/usePlaceOrder";
import { useAuthStore } from "@/store/auth.store";
import { useCheckoutData } from "@/lib/placeorder/useCheckoutData";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import ProductsDetailsSlider from "./productsDetailsSlider";
import { DeliveryItemsType, placeorderItem, PaymentMethod } from "@/types";
import { SecureCheckoutInfo } from "@/components/cart/secure-checkout-info";
import Link from "next/link";
const PlaceOrderPage = () => {
    const router = useRouter();
    const { items, totalPrice } = useCartStore();
    const { personalInfo, isLoading: isPersonalLoading } = usePersonalInfo();
    const { address, isLoading: isAddressLoading } = useAddress();
    const { location, isLoading: isLocationLoading } = useMapLocation();
    // const { mutateAsync: placeOrder, isPending: isPlaceOrderPending } = usePlaceOrder();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState("cashondelivery");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const { mutateAsync: placeOrder, isPending: isPlaceOrderPending } = usePlaceOrder();
    const { userProfile, guestProfile } = useAuthStore();
    const productImageUrl = process.env.NEXT_PUBLIC_PRODUCT_IMG_URL;
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
    const paymentMethods: PaymentMethod[] = checkoutData?.payment || []
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
            paymentMethod: paymentMethod || "cashondelivery",
            quoteId: quoteId,
            addressId: address?.id
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
    let uniqueItems: placeorderItem[] = [];
    if (checkoutData?.items[0]?.data?.length > 0) {
        uniqueItems = checkoutData?.items[0]?.data?.filter((item, index) => {
            return checkoutData?.items[0]?.data?.findIndex((i) => i.sku === item.sku) === index;
        });
    }
    const standardDeliveryItems: DeliveryItemsType = checkoutData?.items[0] || [];

    return (
        <PageContainer>
            <h1 className="text-2xl font-bold mb-6">Review & Place Order</h1>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
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
                                        <p className="font-medium">{address.firstname} {address.lastname}</p>
                                        <div className="flex items-center gap-1 text-gray-600 mt-1">
                                            <Phone className="h-3 w-3" />
                                            <span>{address.telephone}</span>
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
                    {/* items array here */}
                    <Card className="gap-0">
                        <CardHeader className="pb-3 flex justify-between items-center">
                            <CardTitle className="text-lg flex items-start gap-2 flex-col">
                                <div className="flex items-center gap-2">
                                    <CarTaxiFrontIcon className="h-5 w-5 text-primary" />
                                    {standardDeliveryItems?.title} {"Items"}
                                </div>
                                <span className="text-xs text-gray-500">{standardDeliveryItems?.content}</span>
                            </CardTitle>
                            {/* it will open a sheet from right side which will have the items details, eg. name price and quantity only */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="link" className="p-0 h-auto text-blue-500 cursor-pointer">View Details</Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="lg:max-w-[450px] max-w-[350px] p-0">
                                    <SheetTitle className="sr-only">Delivery Items details</SheetTitle>
                                    <SheetDescription className="sr-only">
                                        View and manage items in your shopping cart
                                    </SheetDescription>
                                    <ProductsDetailsSlider data={standardDeliveryItems} />
                                </SheetContent>
                            </Sheet>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto space-x-3 pr-2 scrollbar-thin flex flex-nowrap">
                                {isCheckoutLoading ? (<div className="flex justify-center items-center h-[6vh]">
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                                </div>) : (
                                    <>
                                        {uniqueItems?.map((item) => (
                                            <div key={item.sku} className="flex gap-3 text-sm relative rounded-md shrink-0">
                                                {/* Placeholder for image if available */}
                                                {item.image && (
                                                    <Image src={`${productImageUrl}/${item.image}`} alt={item.name} width={85} height={85} className="object-contain rounded-md" />
                                                )}
                                                <span className="absolute top-0 right-0 bg-primary text-white px-2 py-1 rounded-full text-xs">{item.qty}</span>

                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-20 gap-2">
                        <CardHeader>
                            <CardTitle>Order Summary (QAR)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Items Preview (collapsed list) */}


                            <div className=" border-b mb-0 pb-2 flex flex-col gap-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>{checkoutData?.total[0]?.sub_total}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    {checkoutData?.total[0]?.delivery > 0 ? (
                                        <span>+{checkoutData?.total[0]?.delivery}</span>
                                    ) : (
                                        <span className="text-green-600"> {checkoutData?.total[0]?.delivery}</span>
                                    )}
                                </div>
                                {checkoutData?.total[0]?.discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Discount</span>
                                        <span className="text-red-600"> - {checkoutData?.total[0]?.discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                    <span>Total</span>
                                    <span>QAR {checkoutData?.total[0]?.total_amount}</span>
                                </div>
                            </div>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-1 gap-1 pt-2">
                                <span className="text-sm font-semibold">Payment Method</span>
                                {paymentMethods.map((method) => {
                                    const isSelected = paymentMethod === method.code;
                                    let Icon = Banknote;
                                    // let iconColor = "text-gray-500";

                                    if (method.icon === "money") {
                                        Icon = Banknote;
                                        // iconColor = "text-green-600";
                                    } else if (method.icon === "credit-card") {
                                        Icon = CreditCard;
                                        // iconColor = "text-primary";
                                    } else if (method.icon === "fax") {
                                        Icon = CreditCard; // Card machine
                                        // iconColor = "text-blue-600";
                                    }

                                    return (
                                        <div
                                            key={method.code}
                                            onClick={() => setPaymentMethod(method.code)}
                                            className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer transition-colors ${isSelected ? 'border-[#b7d635] bg-[#b7d635]/5' : 'hover:bg-gray-50'}`}
                                        >
                                            <RadioGroupItem value={method.code} id={method.code} />
                                            <Label htmlFor={method.code} className="flex-1 cursor-pointer flex items-center gap-2 font-medium">
                                                <Icon className={`h-5 w-5 `} />
                                                {method.title}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </RadioGroup>
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
                            {/* Report Issue */}
                            <div className="text-center">
                                <Link href="/report-issue" className="text-red-500 hover:underline font-medium text-xs">Report an Issue</Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Card className="pt-0 mb-4 pb-4">
                <CardContent>
                    <SecureCheckoutInfo />
                </CardContent>
            </Card>
        </PageContainer>
    );
};

export default PlaceOrderPage;
