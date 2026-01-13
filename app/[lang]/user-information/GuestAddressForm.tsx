"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowRight, User, Phone, Home, MapPin, CheckCircle2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { MapPreview } from "@/components/map/MapPreview";
import { MapPicker } from "@/components/map";

import { useAddress, useMapLocation } from "@/lib/address";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { useZoneStore } from "@/store/useZoneStore";
import { UserAddress } from "@/lib/user/user.types";
import { checkUserExist } from "@/lib/auth/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { useUpdateCart } from "@/lib/cart/cart.api";

import { addressSchema, AddressFormValues } from "./schema";

const mapApiKey = process.env.NEXT_PUBLIC_MAP_API_KEY;

interface GuestAddressFormProps {
    onSuccess: () => void;
}

export function GuestAddressForm({ onSuccess }: GuestAddressFormProps) {
    const {
        address,
        saveAddress,
        updateLocation,
        isSaving: isAddressSaving,
    } = useAddress();

    const {
        location: mapLocation,
        saveLocation: saveMapLocation,
        isMapOpen,
        openMap,
        closeMap,
        clearLocation,
    } = useMapLocation();

    const { zone, setZone } = useZoneStore();

    const {
        isSendingOtp,
        isVerifyingOtp,
        sendVerificationOtp,
        verifyVerificationOtp,
        successMessage,
        error: otpError,
        clearStates,
    } = usePhoneVerification();

    const { setAuth } = useAuthStore();
    const { mutateAsync: syncCart } = useUpdateCart();

    const [activeTab, setActiveTab] = useState("Home");
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
    const [userExists, setUserExists] = useState(false);
    const [isCheckingUser, setIsCheckingUser] = useState(false);

    const form = useForm<AddressFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(addressSchema) as any,
        defaultValues: {
            firstname: "",
            lastname: "",
            email: "",
            telephone: "",
            street: "",
            postcode: "",
            city: "Doha",
            countryId: "QA",
            region: "Qatar",
            area: "Qatar",
            customLatitude: "",
            customLongitude: "",
            customAddressOption: "Home",
            company: "",
            customBuildingName: "",
            customBuildingNumber: "",
            customFloorNumber: "",
            flatNo: "",
            customAddressLabel: "",
        },
    });

    // Populate from existing address or Map Location
    useEffect(() => {
        // Priority: Map Location > Address from Props/Store
        const initialLat = mapLocation?.latitude || address?.customLatitude || "";
        const initialLng = mapLocation?.longitude || address?.customLongitude || "";
        const initialStreet = mapLocation?.formattedAddress || (Array.isArray(address?.street) ? address?.street[0] : (address?.street || ""));
        const initialZone = zone || address?.postcode || "";

        if (address && !form.getValues("firstname") && address.street) {
            form.reset({
                ...(address as any),
                street: initialStreet,
                postcode: initialZone,
                telephone: address.telephone ? address.telephone.replace(/^(?:\+?974)/, "") : "",
                id: address.id || undefined,
                customAddressOption: address.customAddressOption || "Home",
                customLatitude: initialLat.toString(),
                customLongitude: initialLng.toString(),
            });

            if (address.telephone) {
                setVerifiedPhone(address.telephone.replace(/^(?:\+?974)/, ""));
            }
            if (address.customAddressOption) {
                setActiveTab(address.customAddressOption);
            }
            if (!zone && address.postcode) {
                setZone(address.postcode);
            }

            // Sync hook state if map location is missing but address has coords
            if (!mapLocation && address.customLatitude && address.customLongitude) {
                saveMapLocation({
                    latitude: address.customLatitude.toString(),
                    longitude: address.customLongitude.toString(),
                    formattedAddress: Array.isArray(address.street) ? address.street[0] : address.street,
                });
            }
        } else if (mapLocation && !form.getValues("street")) {
            // Case where we have map location but no full address object yet (e.g. fresh guest)
            form.setValue("street", mapLocation.formattedAddress || "");
            form.setValue("customLatitude", mapLocation.latitude);
            form.setValue("customLongitude", mapLocation.longitude);
            if (zone) form.setValue("postcode", zone);
        }
    }, [address, form, setZone, saveMapLocation, mapLocation, zone]);

    // Sync Map Location to Form
    useEffect(() => {
        if (mapLocation) {
            updateLocation(mapLocation.latitude, mapLocation.longitude);
            form.setValue("street", mapLocation.formattedAddress || "");
            form.setValue("customLatitude", mapLocation.latitude);
            form.setValue("customLongitude", mapLocation.longitude);
            form.setValue("customAddressLabel", mapLocation.formattedAddress || ""); // Default label

            if (zone) {
                form.setValue("postcode", zone);
            }
        }
    }, [mapLocation, updateLocation, zone, form]);

    const watchedLat = form.watch("customLatitude");
    const watchedLng = form.watch("customLongitude");
    const watchedTelephone = form.watch("telephone");
    const isPhoneVerified = watchedTelephone && watchedTelephone === verifiedPhone;

    // Check user existence
    const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        form.setValue("telephone", value);

        if (value.length === 8) {
            setIsCheckingUser(true);
            try {
                // Assuming 974 prefix needs to be added for the API or handled as is
                // The API requires "97430078398" format based on user request example
                const fullPhone = `974${value}`;
                const response = await checkUserExist({ customerId: 0, phoneNumber: fullPhone });
                if (response.success && response.exist) {
                    setUserExists(true);
                } else {
                    setUserExists(false);
                }
            } catch (error) {
                console.error("Error checking user:", error);
            } finally {
                setIsCheckingUser(false);
            }
        } else {
            setUserExists(false);
        }
    };


    // Phone Verification Handlers
    const handleSendOtp = async () => {
        if (!watchedTelephone) return;
        const success = await sendVerificationOtp(watchedTelephone);
        if (success) {
            setShowOtpInput(true);
        }
    };

    const handleVerifyOtp = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!watchedTelephone || otpValue.length !== 6) return;

        // Use existing verifyVerificationOtp from hook which calls verifyOtp API
        // If userExists, we need to handle the response to get token
        // But the hook currently ignores the token return.
        // We might need to call verifyOtp directly here for login case, OR modify hook.
        // For minimal invasion, let's look at `usePhoneVerification`. It abstracts the API.
        // I should probably import verifyOtp API directly here for the login case to get full response.

        if (userExists) {
            // Logic for Login:
            // 1. Verify OTP
            // 2. Set Auth
            // 3. Sync Cart
            // 4. Refresh
            try {
                const fullPhone = `974${watchedTelephone}`;
                const { verifyOtp: verifyOtpApi } = await import("@/lib/auth/auth.api");
                const response = await verifyOtpApi({
                    username: fullPhone,
                    otp: parseInt(otpValue),
                    isNumber: 1
                });

                if (response.success && response.token && response.id && response.profile) {
                    // Login Success
                    setAuth(response.token, response.id, response.profile);
                    await syncCart();
                    // Refresh page to show logged-in view
                    window.location.reload();
                } else {
                    alert(response.message || "Login failed");
                }
            } catch (error) {
                console.error("Login error:", error);
                alert("Login failed");
            }
            return;
        }

        const success = await verifyVerificationOtp(watchedTelephone, otpValue);
        if (success) {
            setVerifiedPhone(watchedTelephone);
            setShowOtpInput(false);
            setOtpValue("");
        }
    };

    const handleMapLocationSelect = (loc: { latitude: string; longitude: string; formattedAddress?: string }) => {
        saveMapLocation(loc);
    };

    const onSubmit = async (data: AddressFormValues) => {
        try {
            const formattedPhone = data.telephone.startsWith("974") ? data.telephone : `974${data.telephone}`;
            // Sanitize postcode to ensure only numbers are sent (e.g. "Zone 56" -> "56")
            const sanitizedPostcode = data.postcode ? data.postcode.replace(/\D/g, "") : "";

            const addressToSave: UserAddress = {
                ...data,
                telephone: formattedPhone,
                postcode: sanitizedPostcode,
            };

            const success = await saveAddress(addressToSave);
            if (success) {
                onSuccess();
            } else {
                alert("Failed to save address. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Guest Checkout</h2>
            <Card className="max-w-4xl mx-auto mb-4">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Delivery Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* First Name & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName" className="mb-1">Full Name *</Label>
                                <Input
                                    id="firstName"
                                    placeholder="Enter your name"
                                    {...form.register("firstname")}
                                />
                                {form.formState.errors.firstname && (
                                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.firstname.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="email" className="mb-1">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    {...form.register("email")}
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Phone Number & OTP */}
                        <div className="mb-2">
                            <Label htmlFor="phone" className="mb-1">Phone Number *</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-[53%] -translate-y-1/2 flex items-center gap-2 z-10">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">+974</span>
                                </div>
                                <Input
                                    id="phone"
                                    placeholder="Enter phone number"
                                    className="pl-20 h-10"
                                    {...form.register("telephone")}
                                    onChange={handlePhoneChange}
                                />
                            </div>
                            {isCheckingUser && <p className="text-xs text-gray-400 mt-1">Checking user...</p>}
                            {userExists && (
                                <p className="text-sm text-red-600 mt-1">User already exists. Please login using the button below.</p>
                            )}
                            {form.formState.errors.telephone && (
                                <p className="text-sm text-red-500 mt-1">{form.formState.errors.telephone.message}</p>
                            )}

                            {/* OTP UI Logic - Identical to main page */}
                            {watchedTelephone && (!isPhoneVerified || userExists) && !form.formState.errors.telephone && (
                                <div className="p-4 bg-gray-50 rounded-lg space-y-3 text-center mt-3 border border-gray-100">
                                    {otpError && <p className="text-sm text-red-500">{otpError}</p>}
                                    {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

                                    {!showOtpInput ? (
                                        <Button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={isSendingOtp}
                                            variant="outline"
                                            size="sm"
                                        >
                                            {isSendingOtp ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                                    Sending OTP...
                                                </>
                                            ) : (
                                                userExists ? "Login with OTP" : "Send Verification Code"
                                            )}
                                        </Button>
                                    ) : (
                                        <div className="space-y-3">
                                            <Label htmlFor="otp" className="text-xs text-center block">Enter 6-digit code</Label>
                                            <div className="flex justify-center">
                                                <InputOTP
                                                    maxLength={6}
                                                    value={otpValue}
                                                    onChange={setOtpValue}
                                                >
                                                    <InputOTPGroup>
                                                        <InputOTPSlot index={0} />
                                                        <InputOTPSlot index={1} />
                                                        <InputOTPSlot index={2} />
                                                        <InputOTPSlot index={3} />
                                                        <InputOTPSlot index={4} />
                                                        <InputOTPSlot index={5} />
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            </div>
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    type="button"
                                                    onClick={handleVerifyOtp}
                                                    disabled={isVerifyingOtp || otpValue.length !== 6}
                                                    size="sm"
                                                >
                                                    {isVerifyingOtp ? "Verifying..." : (userExists ? "Verify & Login" : "Verify")}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => { setShowOtpInput(false); setOtpValue(""); clearStates(); }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {isPhoneVerified && watchedTelephone && !userExists && (
                                <p className="text-sm text-green-600 mt-1 flex items-center gap-1"> Verified Number <CheckCircle2 className="h-3 w-3" /></p>
                            )}
                        </div>

                        {/* Location / Map */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <Label className="text-lg font-semibold">Address Location *</Label>
                            </div>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-primary transition-colors bg-white group relative overflow-hidden h-[150px] flex items-center justify-center"
                                onClick={openMap}
                            >
                                {watchedLat && watchedLng ? (
                                    <>
                                        <div className="absolute inset-0 z-0">
                                            <MapPreview
                                                apiKey={mapApiKey}
                                                latitude={watchedLat}
                                                longitude={watchedLng}
                                            />
                                            <div className="absolute inset-0 z-10 bg-black/10 hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <Button type="button" variant="secondary" size="sm" className="shadow-sm">Change Location</Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-1">
                                        <MapPin className="h-6 w-6 mx-auto text-gray-400 group-hover:text-primary transition-colors" />
                                        <p className="text-sm text-gray-600">Select Location on Map</p>
                                    </div>
                                )}
                            </div>
                            {form.formState.errors.customLatitude && (
                                <p className="text-sm text-red-500">Please select a location on the map.</p>
                            )}
                        </div>

                        {/* Street & Zone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="street" className="mb-1">Street Address</Label>
                                <Input id="street" {...form.register("street")} placeholder="Street Address" />
                            </div>
                            <div>
                                <Label htmlFor="postcode" className="mb-1">Zone</Label>
                                <Input id="postcode" {...form.register("postcode")} placeholder="Zone" readOnly={false} />
                            </div>
                        </div>

                        {/* Address Type Tabs (Optional for Guest, but kept for consistency) */}
                        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); form.setValue("customAddressOption", val); }} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
                                <TabsTrigger value="Home">Home</TabsTrigger>
                                <TabsTrigger value="Office">Office</TabsTrigger>
                                <TabsTrigger value="Apartment">Apartment</TabsTrigger>
                            </TabsList>
                            <div className="mt-4 space-y-4">
                                <TabsContent value="Home">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Building No</Label>
                                            <Input {...form.register("customBuildingNumber")} placeholder="Building No" />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="Office">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Building Name</Label>
                                            <Input {...form.register("customBuildingName")} placeholder="Building Name" />
                                        </div>
                                        <div>
                                            <Label>Floor No</Label>
                                            <Input {...form.register("customFloorNumber")} placeholder="Floor" />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="Apartment">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Building Name</Label>
                                            <Input {...form.register("customBuildingName")} placeholder="Name" />
                                        </div>
                                        <div>
                                            <Label>Unit/Flat No</Label>
                                            <Input {...form.register("flatNo")} placeholder="Unit No" />
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={isAddressSaving || form.formState.isSubmitting || (!!watchedTelephone && !isPhoneVerified)}
                            className="w-full h-12 text-lg"
                        >
                            {(isAddressSaving || form.formState.isSubmitting) ? (
                                <> <Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving...</>
                            ) : (
                                <>Proceed to Checkout <ArrowRight className="h-5 w-5 ml-2" /></>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <MapPicker
                isOpen={isMapOpen}
                onClose={closeMap}
                onSelectLocation={handleMapLocationSelect}
                initialLocation={
                    watchedLat && watchedLng
                        ? { latitude: watchedLat, longitude: watchedLng }
                        : null
                }
                mapApikey={mapApiKey}
            />
        </div>
    );
}
