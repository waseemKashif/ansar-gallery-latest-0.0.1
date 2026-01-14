"use client";


import { useEffect, useState } from "react";
import PageContainer from "@/components/pageContainer";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useLocale } from "@/hooks/useLocale";
import { usePersonalInfo } from "@/lib/user";
import { useAddress, useMapLocation } from "@/lib/address";
import { Loader2, MapPin, Phone, CreditCard, Banknote, CheckCircle2, Edit2, CarTaxiFrontIcon, TruckElectric, Info, Clock4 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
// import { usePlaceOrder } from "@/lib/order";
import { usePlaceOrder } from "@/lib/placeorder/usePlaceOrder";
import { useAuthStore } from "@/store/auth.store";
import { useCheckoutData } from "@/lib/placeorder/useCheckoutData";
import { getTimeSlots } from "@/lib/placeorder/placeorder.service";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ProductsDetailsSlider from "./productsDetailsSlider";
import { DeliveryItemsType, PaymentMethod, PlaceOrderSuccessResponse } from "@/types";
import { SecureCheckoutInfo } from "@/components/cart/secure-checkout-info";
import Link from "next/link";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutFooter from "@/components/checkout/CheckoutFooter";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MapPreview } from "@/components/map/MapPreview";
import { useDictionary } from "@/hooks/useDictionary";

const PlaceOrderPage = () => {
    const router = useRouter();
    const { locale } = useLocale();
    const { dict } = useDictionary();
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

    // Delivery Time Logic
    const [deliveryInfo, setDeliveryInfo] = useState<{ date: string, time: string, label: string } | null>(null);
    const [availableSlots, setAvailableSlots] = useState<{ [date: string]: string[] }[]>([]);
    const [isSlotsLoading, setIsSlotsLoading] = useState(false);
    const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);

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
        // Initialize delivery info from checkoutData if available and not set
        if (checkoutData?.items) {
            const expressItem = checkoutData.items.find((i: DeliveryItemsType) => i.express);
            if (expressItem && expressItem.timeslot && !deliveryInfo) {
                // Expected format: "2026-01-14 - 14:00 — 15:00"
                const parts = expressItem.timeslot.split(' - ');
                if (parts.length >= 2) {
                    const date = parts[0];
                    // Join the rest back in case time has hyphens (though separator is usually ' - ')
                    // Actually based on "2026-01-14 - 14:00 — 15:00", parts[0] is date, parts[1] is time
                    const time = parts.slice(1).join(' - ');
                    setDeliveryInfo({
                        date: date,
                        time: time,
                        label: expressItem.timeslot
                    });
                }
            }
        }
        console.log("checkoutData", checkoutData);
    }, [address, location, items, personalInfo, router, isLoading, checkoutData, orderSuccess, deliveryInfo]);

    const handleFetchTimeSlots = async () => {
        setIsSlotsLoading(true);
        try {
            const response = await getTimeSlots();
            if (response && response.express_slots) {
                setAvailableSlots(response.express_slots);
                setIsTimeDialogOpen(true);
            }
        } catch (error) {
            console.error("Failed to fetch time slots", error);
        } finally {
            setIsSlotsLoading(false);
        }
    };

    const handleSelectTimeSlot = (date: string, time: string) => {
        setDeliveryInfo({
            date,
            time,
            label: `${date} - ${time}`
        });
        setIsTimeDialogOpen(false);
    };

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
            delivery_date: deliveryInfo?.date || "12/15/2025",
            delivery_time: deliveryInfo?.time || "19:00 — 20:00",
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
            <PageContainer className="flex-1 py-6 w-full max-w-6xl!">
                <h1 className="text-2xl font-bold mb-6 sr-only">Review & Place Order</h1>

                <div className="grid lg:grid-cols-3 gap-2 mb-2">
                    {/* Left Column: Review & Payment */}
                    <div className="lg:col-span-2 space-y-2">

                        {/* Delivery Details Review */}
                        <Card className="mb-0 gap-2 py-3 lg:py-5">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Delivery Details
                                </CardTitle>
                            </CardHeader>
                            {isCheckoutLoading ? (<div className="flex justify-center items-center h-[6vh]">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                            </div>) : (
                                <CardContent className="space-y-2 px-3 lg:px-6">
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

                                    <button className="flex items-center gap-1  text-sm p-0 h-auto cursor-pointer float-right text-blue-500 px-0 mt-2" onClick={() => router.push('/user-information')}>
                                        <Edit2 className="h-4 w-4" />
                                        Edit Details
                                    </button>
                                </CardContent>
                            )}
                        </Card>
                        {/* extractedItems array here */}
                        {
                            extractedItems?.length > 0 && extractedItems?.map((item) => (
                                <Card className="gap-0 mt-2 mb-0 py-3 lg:py-5" key={item.timeslot}>
                                    <CardHeader className="pb-3 flex justify-between items-top">
                                        <CardTitle className="text-lg flex items-start gap-2 flex-col">
                                            <div className={`flex items-center gap-2 ${item.express ? 'text-green-600' : ''}`}>
                                                {item.express ? <TruckElectric className="h-5 w-5 " /> : <CarTaxiFrontIcon className="h-5 w-5 text-primary" />}
                                                {item?.title} {"Items"}

                                            </div>

                                        </CardTitle>


                                        {item.content && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button type="button" className="cursor-pointer">
                                                        <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                        <span className="sr-only">Info</span>
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[300px]">
                                                    <p>{item.content}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}

                                    </CardHeader>
                                    <CardContent className="px-3 lg:px-6">
                                        <div className="flex items-center gap-2 justify-between w-full bg-gray-100 p-0 rounded mb-2">
                                            <span className="text-sm text-black font-medium p-2">{item.express && deliveryInfo ? deliveryInfo.label : item?.timeslot}</span>
                                            {item.express && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 bg-primary text-white text-xs border-primary rounded-none hover:bg-primary/90 hover:text-white cursor-pointer"
                                                        onClick={handleFetchTimeSlots}
                                                        disabled={isSlotsLoading}
                                                    >
                                                        {isSlotsLoading ? (<span className="flex items-center gap-2">
                                                            Change Slot
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        </span>) : <span className="font-medium flex items-center gap-2">Change Slot <Clock4 className="h-3 w-3" /></span>}

                                                    </Button>

                                                    <Dialog open={isTimeDialogOpen} onOpenChange={setIsTimeDialogOpen}>
                                                        <DialogContent className="max-w-md">
                                                            <DialogHeader>
                                                                <DialogTitle>Select Delivery Time</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="py-4 space-y-4">
                                                                {availableSlots.map((slotGroup, index) => {
                                                                    const date = Object.keys(slotGroup)[0];
                                                                    const times = slotGroup[date];
                                                                    return (
                                                                        <div key={index} className="space-y-2">
                                                                            <h3 className="font-semibold text-sm text-gray-700 bg-gray-100 p-2 rounded">{date}</h3>
                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                {times.map((time, tIndex) => (
                                                                                    <Button
                                                                                        key={tIndex}
                                                                                        variant={deliveryInfo?.date === date && deliveryInfo?.time === time ? "default" : "outline"}
                                                                                        className={`text-xs ${deliveryInfo?.date === date && deliveryInfo?.time === time ? 'bg-primary text-white' : ''}`}
                                                                                        onClick={() => handleSelectTimeSlot(date, time)}
                                                                                    >
                                                                                        {time}
                                                                                    </Button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </>
                                            )}
                                        </div>
                                        {/* it will open a sheet from right side which will have the items details, eg. name price and quantity only */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-base text-gray-500 font-medium">{item.data.length} items </span>
                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <Button variant="link" className="font-normal p-0 h-auto text-blue-500 cursor-pointer">View Details</Button>
                                                </SheetTrigger>
                                                <SheetContent side={isMobile ? "bottom" : "right"} className="lg:max-w-[450px] max-w-full p-0">
                                                    <SheetTitle className="sr-only">Delivery Items details</SheetTitle>
                                                    <SheetDescription className="sr-only">
                                                        View and manage items in your shopping cart
                                                    </SheetDescription>
                                                    <ProductsDetailsSlider data={item} />
                                                </SheetContent>
                                            </Sheet>
                                        </div>
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
                        <Card className="sticky top-20 gap-2 py-3 lg:py-5">
                            <CardHeader>
                                <CardTitle>Order Summary ({dict?.common?.QAR})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 px-3 lg:px-6">
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
                                        <span>{dict?.common?.QAR} {checkoutData?.total[0]?.total_amount}</span>
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
                                <div className="text-center mb-2">
                                    <Link href="/report-issue" className="text-red-500 hover:underline font-medium text-xs">Report an Issue</Link>
                                </div>
                                <SecureCheckoutInfo className="mt-0" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <Card className="pt-0 mb-4 py-3 lg:py-5">
                    <CardContent>
                        <SecureCheckoutInfo className="mt-0" />
                    </CardContent>
                </Card>
            </PageContainer>
            <CheckoutFooter />
        </div >
    );
};

export default PlaceOrderPage;
