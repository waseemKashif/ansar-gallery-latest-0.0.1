"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CurrentOrder } from "@/lib/user/user.types";
import Image from "next/image";
import { Check, ClipboardList, Package, Truck, Home, ShoppingBasket } from "lucide-react";

interface OrderTrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: CurrentOrder | null;
}

const STEPS = [
    {
        key: 'placed',
        label: 'Order Placed', // Step 1
        statuses: ['pending'],
        icon: ClipboardList,
        image: '/images/order_tracking/order_placed.png',
        description: 'Your order has been placed!',
        topImage: '/images/order_tracking/placedDone.png',
    },
    {
        key: 'preparing',
        label: 'Preparing Order', // Step 2 (Processing, Picking)
        statuses: ['processing', 'assigned_picker', 'start_picking'],
        icon: ShoppingBasket,
        image: '/images/order_tracking/processing.png',
        description: 'Picker has started preparing your order',
        topImage: '/images/order_tracking/order_preparing.png',
    },
    {
        key: 'ready',
        label: 'Ready to Dispatch', // Step 3 (End Picking, Assigned Driver)
        statuses: ['end_picking', 'assigned_driver', 'ready_to_dispatch'],
        icon: Package,
        image: '/images/order_tracking/read_to_dispath.png',
        description: 'Your order is ready to dispatch',
        topImage: '/images/order_tracking/order_preparing.png',
    },
    {
        key: 'way',
        label: 'On the Way', // Step 4
        statuses: ['on_the_way', 'order_collected'],
        icon: Truck,
        image: '/images/order_tracking/on_the_way.png',
        description: 'Your order is on the way',
        topImage: '/images/order_tracking/order_preparing.png',
    },
    {
        key: 'delivered',
        label: 'Delivered', // Step 5
        statuses: ['complete'],
        icon: Home,
        image: '/images/order_tracking/complete.png',
        description: 'Your order has been delivered',
        topImage: '/images/order_tracking/order_preparing.png',
    }
];

const OrderTrackingModal = ({ isOpen, onClose, order }: OrderTrackingModalProps) => {
    if (!order) return null;

    // Determine current step index
    // We search through steps to find which one contains the current order_status
    // Default to 0 if not found
    let currentStepIndex = STEPS.findIndex(step => step.statuses.includes(order.order_status));
    // let currentStepIndex = 3

    // Fallback logic for statuses that might implied advanced progress but aren't explicitly mapped
    if (currentStepIndex === -1) {
        // If status is cancelled or refunded, we might need special handling. 
        // For now, let's default to step 0 or maybe check if backend gives a status_key?
        // User provided logic relies on status strings. 
        // Let's assume 'pending' (index 0) as fallback.
        currentStepIndex = 0;
    }

    const currentStep = STEPS[currentStepIndex];
    console.log("the order", order)
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg bg-gray-50 p-0 border-0 overflow-hidden lg:max-w-2xl">
                {/* Header Section */}
                <div className="bg-white p-3 border-b border-gray-100 flex justify-between items-start sticky top-0 z-10">
                    <div>
                        <DialogTitle className="text-xl font-bold text-gray-900 mb-1">
                            #{order.subgroup_identifier || order.increment_id}
                        </DialogTitle>
                        <p className="text-sm text-gray-500">Order ID</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Arriving by <span className="text-green-600 font-bold">{order.delivery_time?.timerange}</span></p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-4 flex flex-col items-center justify-center min-h-[350px]">

                    {/* Hero Image & Status Text */}
                    <div className="flex flex-col items-center mb-16 text-center">
                        <div className="relative w-32 h-32 mb-6">
                            <Image
                                src={currentStep.topImage}
                                alt={currentStep.label}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">{currentStep.description}</h2>
                    </div>


                    {/* Stepper */}
                    <div className="w-full relative">
                        {/* Connecting Line */}
                        {/* The line should be behind the circles. 
                             We need to calculate width based on progress. 
                             Or have a gray bg line and a green progress line. */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 hidden md:block" />
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-[#666666] -translate-y-1/2 z-0 transition-all duration-500 hidden md:block"
                            style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                        />

                        {/* Animated Progress Bar Segment */}
                        {currentStepIndex < STEPS.length - 1 && (
                            <div
                                className="absolute top-1/2 h-1 -translate-y-1/2 z-0 hidden md:block bg-green-600/20"
                                style={{
                                    left: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
                                    width: `${100 / (STEPS.length - 1)}%`
                                }}
                            >
                                <div className="h-full bg-green-600 animate-pulse-width rounded-r-full" />
                                <style jsx>{`
                                    @keyframes pulse-width {
                                        0% { width: 20%; }
                                        50% { width: 60%; }
                                        100% { width: 20%; }
                                    }
                                    .animate-pulse-width {
                                        animation: pulse-width 2s ease-in-out infinite;
                                    }
                                `}</style>
                            </div>
                        )}

                        {/* Steps */}
                        <div className="flex justify-between relative z-10 w-full">
                            {STEPS.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                const Icon = step.icon;

                                return (
                                    <div key={step.key} className="flex flex-col items-center gap-2 group">
                                        <div
                                            className={`
                                                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 overflow-hidden relative
                                                ${isCompleted
                                                    ? 'bg-[#666666] border-[#666666] text-white shadow-md'
                                                    : 'bg-[#CACACA] border-[#CACACA]'
                                                }
                                            ${isCurrent ? 'bg-green-600 border-green-600 text-white shadow-md' : ''}
                                            `}
                                        >
                                            <div className="relative w-6 h-6">
                                                <Image
                                                    src={step.image}
                                                    alt={step.label}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default OrderTrackingModal;
