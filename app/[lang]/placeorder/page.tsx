"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/pageContainer";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useLocale } from "@/hooks/useLocale";
import { usePersonalInfo } from "@/lib/user";
import { useAddress, useMapLocation } from "@/lib/address";
import { Loader2, MapPin, Phone, CreditCard, Banknote, CheckCircle2, Edit2, CarTaxiFrontIcon, TruckElectric } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
// import { usePlaceOrder } from "@/lib/order";
import { usePlaceOrder } from "@/lib/placeorder/usePlaceOrder";
import { useAuthStore } from "@/store/auth.store";
import { useCheckoutData } from "@/lib/placeorder/useCheckoutData";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import ProductsDetailsSlider from "./productsDetailsSlider";
import { DeliveryItemsType, PaymentMethod, PlaceOrderSuccessResponse } from "@/types";
import { SecureCheckoutInfo } from "@/components/cart/secure-checkout-info";
import Link from "next/link";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutFooter from "@/components/checkout/CheckoutFooter";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MapPreview } from "@/components/map/MapPreview";

const PlaceOrderPage = () => {
    const router = useRouter();
    const { locale } = useLocale();
    const { items } = useCartStore();
    const { personalInfo, isLoading: isPersonalLoading } = usePersonalInfo();
    const { address, isLoading: isAddressLoading } = useAddress();
    const { location, isLoading: isLocationLoading } = useMapLocation();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { userProfile, guestId } = useAuthStore();
    const { mutateAsync: placeOrder, isPending: isPlaceOrderPending } = usePlaceOrder();
    const productImageUrl = process.env.NEXT_PUBLIC_PRODUCT_IMG_URL;
    const mapApiKey = process.env.NEXT_PUBLIC_MAP_API_KEY;

    const [paymentMethod, setPaymentMethod] = useState("cashondelivery");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [comment, setComment] = useState("");
    const { clearCart, setLastOrderId, setLastOrderData } = useCartStore();

    // Call hooks at top level with the `enabled` option to control when they run
    const {
        data: checkoutData,
        isLoading: isCheckoutLoading,
    } = useCheckoutData({
        isAuthenticated,
        isAuthLoading,
        userId: userProfile?.id,
        guestQuoteId: guestId as string // Use guestId from store, not guestProfile
    });

    const isMobile = useMediaQuery("(max-width: 768px)");
    const isLoading = isPersonalLoading || isAddressLoading || isLocationLoading || isAuthLoading;
    useEffect(() => {
        if (!isLoading && !orderSuccess) {
            if (!address || !address?.postcode || !location || !items?.length || (!personalInfo?.phone_number && !address?.telephone)) {
                // If cart is empty (unless success), redirect. 
                // Note: logic was going to /user-information. 
                // If the user says it went to cart page, maybe user-information redirects to cart?
                // Regardless, stopping this check on success fixes the issue.
                router.push("/user-information");
            }
        }
        console.log("checkoutData", checkoutData);
    }, [address, location, items, personalInfo, router, isLoading, checkoutData, orderSuccess]);

    const paymentMethods: PaymentMethod[] = checkoutData?.payment || []

    const handlePlaceOrder = async () => {
        setErrorMessage(null);

        // For guest, use guestId (cart ID) as quoteId
        const quoteId = isAuthenticated ? personalInfo?.id : guestId;
        const customerId = isAuthenticated ? personalInfo?.id : "0";

        const body = {
            // comment: comment || "Order placed from new website",
            comment: "test order placed form new website",
            customerId: customerId,
            delivery_date: "12/15/2025",
            delivery_time: "19:00 — 20:00",
            isUser: isAuthenticated, // Set isUser based on authentication status
            orderSource: "New website",
            paymentMethod: paymentMethod || "cashondelivery",
            quoteId: quoteId,
            addressId: address?.id
        }
        try {
            const response = await placeOrder(body) as unknown as PlaceOrderSuccessResponse;
            console.log("place order the response is ", response);

            // Check if placeorder object contains order id. it means order is successfully placed.
            if (response && response.order_id) {
                // Success!
                // Success!
                setOrderSuccess(true); // Prevent redirect effect

                console.log("Saving Order ID for Success Page:", response.increment_id);

                clearCart();
                setLastOrderId(response.increment_id);
                // Clear guest session data (except address which is stored separately in local storage)
                if (!isAuthenticated) {
                    useAuthStore.getState().clearGuestSession();
                }

                // Small delay to ensure state persistence
                await new Promise(resolve => setTimeout(resolve, 100));

                console.log("Redirecting to success page...");
                router.push(`/${locale}/checkout/onepage/success`);
                return;
            }

            // If not successful (no order_id), check for message
            if (response && response.message) {
                //    show error message
                setErrorMessage(response.message);
                return;
            }

        } catch (error: unknown) {
            console.error("Error placing order:", error);
            // Try to extract message from error object if possible
            const err = error as { message?: string };
            const msg = `${err?.message}. <a title="cart page" href="/cart" class="text-blue-600 cursor-pointer">Cart Page</a>` || `An error occurred while placing the order. <a title="cart page" href="/cart" class="text-blue-600 cursor-pointer">Cart Page</a>`;
            setErrorMessage(msg);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <CheckoutHeader />
                <PageContainer className="flex-1">
                    <div className="flex h-[50vh] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                </PageContainer>
                <CheckoutFooter />
            </div>
        );
    }

    if (!address || !address?.postcode || !location || !items?.length || (!personalInfo?.phone_number && !address?.telephone)) {
        return null; // redirecting
    }

    // const shippingCost = totalPrice() >= 99 ? 0 : 10;
    // const finalTotal = totalPrice() + shippingCost;
    // remove items with same sku and keep only one 
    // let uniqueItems: placeorderItem[] = []; // Unused
    // if (checkoutData && checkoutData?.items?.[0]?.data?.length > 0) {
    //     uniqueItems = checkoutData?.items[0]?.data?.filter((item, index) => {
    //         return checkoutData?.items[0]?.data?.findIndex((i) => i.sku === item.sku) === index;
    //     });
    // }
    const extractedItems: DeliveryItemsType[] = checkoutData?.items || [];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <CheckoutHeader />
            <PageContainer className="flex-1 py-6 w-full">
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
                                            <p className="font-medium">{location?.formattedAddress || address?.street || ""}</p>
                                            <p className="text-gray-600">
                                                {address.city}
                                                {!location?.formattedAddress && address.street ? `, ${address.street}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {location?.latitude && location?.longitude && (
                                        <div className="mt-4 border rounded-md overflow-hidden h-40 relative">
                                            <MapPreview
                                                apiKey={mapApiKey}
                                                latitude={location.latitude}
                                                longitude={location.longitude}
                                            />
                                            {/* Mask to prevent interaction (make it read-only) */}
                                            <div className="absolute inset-0 bg-transparent z-10" />
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-2">
                                        <Label htmlFor="order-comment" className="text-gray-500">Order Comments (Optional)</Label>
                                        <textarea
                                            id="order-comment"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Add any special instructions for delivery..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                    </div>

                                    <button className="flex items-center gap-1 font-medium text-sm p-0 h-auto cursor-pointer float-right text-blue-500 px-0 mt-2" onClick={() => router.push('/user-information')}>
                                        <Edit2 className="h-4 w-4" />
                                        Edit Details
                                    </button>
                                </CardContent>
                            )}
                        </Card>
                        {/* extractedItems array here */}
                        {
                            extractedItems?.length > 0 && extractedItems?.map((item) => (
                                <Card className="gap-0" key={item.timeslot}>
                                    <CardHeader className="pb-3 flex justify-between items-top">
                                        <CardTitle className="text-lg flex items-start gap-2 flex-col">
                                            <div className={`flex items-baseline gap-2 ${item.express ? 'text-green-600' : ''}`}>
                                                {item.express ? <TruckElectric className="h-5 w-5 " /> : <CarTaxiFrontIcon className="h-5 w-5 text-primary" />}
                                                {item?.title} {"Items"}
                                                <span className="text-xs text-gray-500">{item?.timeslot}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{item?.content}</span>
                                        </CardTitle>
                                        {/* it will open a sheet from right side which will have the items details, eg. name price and quantity only */}
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button variant="link" className="p-0 h-auto text-blue-500 cursor-pointer">View Details</Button>
                                            </SheetTrigger>
                                            <SheetContent side={isMobile ? "bottom" : "right"} className="lg:max-w-[450px] max-w-full p-0">
                                                <SheetTitle className="sr-only">Delivery Items details</SheetTitle>
                                                <SheetDescription className="sr-only">
                                                    View and manage items in your shopping cart
                                                </SheetDescription>
                                                <ProductsDetailsSlider data={item} />
                                            </SheetContent>
                                        </Sheet>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto space-x-3 pr-2 scrollbar-thin flex flex-nowrap">
                                            {isCheckoutLoading ? (<div className="flex justify-center items-center h-[6vh]">
                                                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                                            </div>) : (
                                                <>
                                                    {item?.data?.map((item, index) => (
                                                        <div key={index} className="flex gap-3 text-sm relative rounded-md shrink-0">
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
                            ))}
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
                                        {checkoutData && checkoutData?.total[0]?.delivery as number > 0 ? (
                                            <span>+{checkoutData?.total[0]?.delivery as number}</span>
                                        ) : (
                                            <span className="text-green-600"> {checkoutData?.total[0]?.delivery as number}</span>
                                        )}
                                    </div>
                                    {checkoutData && checkoutData?.total[0]?.discount > 0 && (
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
                                {errorMessage && (
                                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm text-center">
                                        <div dangerouslySetInnerHTML={{ __html: errorMessage }} />
                                    </div>
                                )}
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
            <CheckoutFooter />
        </div >
    );
};

export default PlaceOrderPage;
