"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Loader2, TruckElectric, CarTaxiFrontIcon, Info, Clock4, Package } from "lucide-react";
import Image from "next/image";
import ProductsDetailsSlider from "@/app/[lang]/placeorder/productsDetailsSlider";
import { DeliveryItemsType } from "@/types";
import { getTimeSlots } from "@/lib/placeorder/placeorder.service";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface DeliveryItemCardProps {
    item: DeliveryItemsType;
    deliveryInfo: { date: string, time: string, label: string } | null;
    onTimeSlotUpdate: (date: string, time: string, label: string) => void;
    isCheckoutLoading: boolean;
    productImageUrl?: string;
}

export const DeliveryItemCard = ({
    item,
    deliveryInfo,
    onTimeSlotUpdate,
    isCheckoutLoading,
    productImageUrl
}: DeliveryItemCardProps) => {
    const isMobile = useMediaQuery("(max-width: 768px)");

    // Tooltip State
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    // Time Slot Logic State
    const [availableSlots, setAvailableSlots] = useState<{ [date: string]: string[] }[]>([]);
    const [isSlotsLoading, setIsSlotsLoading] = useState(false);
    const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);

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
        onTimeSlotUpdate(date, time, `${date} - ${time}`);
        setIsTimeDialogOpen(false);
    };

    return (
        <Card className="gap-0 mt-2 mb-0 py-2 lg:py-4">
            <CardHeader className="pb-3 flex justify-between items-top px-2 lg:px-4">
                <CardTitle className="text-lg flex items-start gap-2 flex-col">
                    <div className={`flex items-center gap-2 ${item.express ? 'text-green-600' : ''}`}>
                        {item.express ? <TruckElectric className="h-5 w-5 " /> : <Package className="h-5 w-5 text-primary" />}
                        {item?.title} {"Items"}
                    </div>
                </CardTitle>

                {item.content && (
                    <TooltipProvider>
                        <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsTooltipOpen(prev => !prev);
                                    }}
                                >
                                    <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    <span className="sr-only">Info</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px]">
                                <p>{item.content}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </CardHeader>
            <CardContent className="px-2 lg:px-4">
                <div className="flex items-center gap-2 justify-between w-full bg-gray-100 p-0 rounded mb-2">
                    <span className="text-sm text-black font-medium p-2">
                        {item.express && deliveryInfo ? deliveryInfo.label : item?.timeslot}
                    </span>
                    {item.express && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 bg-primary text-white text-xs border-primary rounded-none hover:bg-primary/90 hover:text-white cursor-pointer"
                                onClick={handleFetchTimeSlots}
                                disabled={isSlotsLoading}
                            >
                                {isSlotsLoading ? (
                                    <span className="flex items-center gap-2">
                                        Change Slot
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    </span>
                                ) : (
                                    <span className="font-medium flex items-center gap-2">
                                        Change Slot <Clock4 className="h-3 w-3" />
                                    </span>
                                )}
                            </Button>

                            <Dialog open={isTimeDialogOpen} onOpenChange={setIsTimeDialogOpen}>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Select Delivery Time</DialogTitle>
                                        <DialogDescription>
                                            Click on the time slot to select it for delivery.
                                        </DialogDescription>
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
                {/* Items Details Sheet Trigger */}
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
                    {isCheckoutLoading ? (
                        <div className="flex justify-center items-center h-[6vh]">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                        </div>
                    ) : (
                        <>
                            {item?.data?.map((cartItem, index) => (
                                <div key={index} className="flex gap-3 text-sm relative rounded-md shrink-0">
                                    {cartItem.image && (
                                        <Image src={`${productImageUrl}/${cartItem.image}`} alt={cartItem.name} width={85} height={85} className="object-contain rounded-md" />
                                    )}
                                    <span className="absolute top-0 right-0 bg-primary text-white px-2 py-1 rounded-full text-xs">{cartItem.qty}</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
