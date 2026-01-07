"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAddress, useMapLocation } from "@/lib/address";
import { useZoneStore } from "@/store/useZoneStore";
import { MapPicker } from "@/components/map";
import { MapPreview } from "@/components/map/MapPreview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    MapPin,
    User,
    Phone,
    Home,
    ArrowLeft,
    ArrowRight,
    Loader2,
    Plus,
    CheckCircle2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import PageContainer from "@/components/pageContainer";
import Link from "next/link";
import { UserAddress } from "@/lib/user/user.types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";

const mapApiKey = process.env.NEXT_PUBLIC_MAP_API_KEY;

// 1. Define Zod Schema
const addressSchema = z.object({
    id: z.number().optional(), // Important for updates
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().default(""),
    email: z.string().default(""),
    telephone: z.string().min(1, "Phone number is required"),
    street: z.string().min(1, "Address location is required"),
    postcode: z.string().default(""), // Zone
    city: z.string().default("Doha"),
    countryId: z.string().default("QA"),
    region: z.string().default("Qatar"),
    area: z.string().default("Qatar"),
    customLatitude: z.string().min(1, "Location is required"),
    customLongitude: z.string().min(1, "Location is required"),
    customAddressOption: z.string().default("Home"),
    // Optional Fields
    company: z.string().default(""),
    customBuildingName: z.string().default(""),
    customBuildingNumber: z.string().default(""),
    customFloorNumber: z.string().default(""),
    flatNo: z.string().default(""), // Maps to Unit No
    customAddressLabel: z.string().default(""),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function PlaceOrderPage() {
    const router = useRouter();
    const { totalItems } = useCartStore();

    // Address Hook
    const {
        address, // Default/current address from store
        savedAddresses,
        saveAddress,
        selectAddress,
        updateLocation,
        isLoading: isAddressLoading,
        isSaving: isAddressSaving,
        isAuthenticated,
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

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Home");


    const { isSendingOtp, isVerifyingOtp, sendVerificationOtp, verifyVerificationOtp, successMessage, error: otpError, clearStates } = usePhoneVerification();
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);

    // 2. Initialize Form
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

    // Populate form with initial/default address
    useEffect(() => {
        if (address && !form.getValues("firstname")) {
            // Only populate if form is empty to avoid overwriting edits
            form.reset({
                ...address,
                id: address.id, // Ensure ID is passed for updates
                firstname: address.firstname || "",
                lastname: address.lastname || "",
                email: address.email || "",
                telephone: address.telephone || "",
                street: address.street || "",
                postcode: address.postcode || "",
                region: address.region || "Qatar",
                area: address.area || "Qatar",
                customLatitude: address.customLatitude || "",
                customLongitude: address.customLongitude || "",
                customAddressOption: address.customAddressOption || "Home",
                customBuildingName: address.customBuildingName || "",
                customBuildingNumber: address.customBuildingNumber || "",
                customFloorNumber: address.customFloorNumber || "",
                flatNo: address.flatNo || "",
                customAddressLabel: address.customAddressLabel || "",
                company: address.company || "",
            });
            // address loaded from props/store is considered verified initially if it exists
            if (address.telephone) {
                setVerifiedPhone(address.telephone);
            }
            if (address.customAddressOption) {
                setActiveTab(address.customAddressOption);
            }
        }
    }, [address, form]);


    // 3. Sync Map Location to Form
    useEffect(() => {
        if (mapLocation) {
            updateLocation(mapLocation.latitude, mapLocation.longitude);

            // Update form values
            form.setValue("street", mapLocation.formattedAddress || "");
            form.setValue("customLatitude", mapLocation.latitude);
            form.setValue("customLongitude", mapLocation.longitude);

            // Update zone if available
            if (zone) {
                form.setValue("postcode", zone);
            }

            form.setValue("customAddressLabel", mapLocation.formattedAddress || "");
        }
    }, [mapLocation, updateLocation, zone, form]);


    // Redirect if cart is empty
    useEffect(() => {
        if (totalItems() === 0) {
            router.push("/cart");
        }
    }, [totalItems, router]);


    const handleAddNewAddress = () => {
        form.reset({
            firstname: "",
            lastname: "",
            email: "",
            telephone: "",
            street: "",
            postcode: "",
            customLatitude: "",
            customLongitude: "",
            customAddressOption: "Home",
            region: "Qatar",
            area: "Qatar",
            id: undefined, // Clear ID to ensure creation
        });
        setActiveTab("Home");
        clearLocation(); // Clear map
        setZone(null); // Clear zone
        setVerifiedPhone(null);
        setShowOtpInput(false);
        clearStates();
        setOtpValue("");
    };

    const handleSelectSavedAddress = (savedAddr: UserAddress) => {
        selectAddress(savedAddr);
        // Reset form with saved address data
        form.reset({
            ...savedAddr,
            id: savedAddr.id, // IMPORTANT: Keep ID for updates
            flatNo: savedAddr.flatNo || savedAddr.customFlatNumber
        });

        if (savedAddr.customAddressOption) {
            setActiveTab(savedAddr.customAddressOption);
        }

        // Sync Zone from postcode
        if (savedAddr.postcode) {
            setZone(savedAddr.postcode);
        }
        setVerifiedPhone(savedAddr.telephone || null);
        setShowOtpInput(false);
        clearStates();
        setOtpValue("");
        // Sync Map Location for hook state (though form has its own)
        if (savedAddr.customLatitude && savedAddr.customLongitude) {
            saveMapLocation({
                latitude: savedAddr.customLatitude.toString(),
                longitude: savedAddr.customLongitude.toString(),
                formattedAddress: savedAddr.street,
            });
        }
    };

    const handleMapLocationSelect = (loc: { latitude: string; longitude: string; formattedAddress?: string }) => {
        saveMapLocation(loc);
    };

    // 4. Handle Submission
    const onSubmit = async (data: AddressFormValues) => {
        try {
            const addressToSave: UserAddress = {
                ...data,
                // Ensure optional fields are handled or mapped correctly if needed
            };

            const success = await saveAddress(addressToSave);
            if (success) {
                router.push("/placeorder");
            } else {
                alert("Failed to save address. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        }
    };

    // Watch values for preview
    const watchedLat = form.watch("customLatitude");
    const watchedLng = form.watch("customLongitude");
    const watchedStreet = form.watch("street");
    const watchedPostcode = form.watch("postcode");
    const watchedTelephone = form.watch("telephone");
    const isPhoneVerified = watchedTelephone && watchedTelephone === verifiedPhone;

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
        const success = await verifyVerificationOtp(watchedTelephone, otpValue);
        if (success) {
            setVerifiedPhone(watchedTelephone);
            setShowOtpInput(false);
            setOtpValue("");
            // clearStates(); // keep success message for a moment?
        }
    };

    if (isAddressLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Back to cart */}
            <Link
                href="/cart"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Cart
            </Link>

            <h1 className="text-2xl font-bold mb-6">Delivery Information</h1>

            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8">

                {/* Saved Address Selection & Form Combined */}
                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {form.getValues("id") ? "Edit Delivery Address" : "New Delivery Address"}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleAddNewAddress} type="button">
                                <Plus className="h-4 w-4 mr-1" />
                                Add New Address
                            </Button>
                            {savedAddresses.length > 0 && (
                                <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" type="button">
                                            Select Saved Address
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Select Saved Address</DialogTitle>
                                            <DialogDescription>
                                                Choose from your saved addresses below to autofill the delivery details.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {savedAddresses.map((savedAddr, index) => (
                                                <div
                                                    key={savedAddr.id || index}
                                                    onClick={() => {
                                                        handleSelectSavedAddress(savedAddr);
                                                        setIsAddressModalOpen(false);
                                                    }}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 flex flex-col justify-between ${form.getValues("id") === savedAddr.id
                                                        ? "border-primary ring-1 ring-primary"
                                                        : "border-gray-200"
                                                        }`}
                                                >
                                                    <div>
                                                        <p className="font-semibold">{savedAddr.firstname} {savedAddr.lastname}</p>
                                                        <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                                                            {savedAddr.customBuildingName && <p>Bldg: {savedAddr.customBuildingName}</p>}
                                                            <p>{savedAddr.street}</p>
                                                            {savedAddr.area && <p>{savedAddr.area}</p>}
                                                            <p>{savedAddr.city}</p>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                                            <Phone className="h-3 w-3" /> {savedAddr.telephone}
                                                        </p>
                                                    </div>
                                                    {savedAddr.defaultShipping && (
                                                        <div className="mt-3">
                                                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">Default</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    handleAddNewAddress();
                                                    setIsAddressModalOpen(false);
                                                }}
                                            >
                                                + Add New Address
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-2">
                        <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="space-y-6">
                            {/* Personal Details in Address */}
                            <div className="grid grid-cols-1 gap-2 mb-2">
                                <div>
                                    <Label htmlFor="firstName" className="mb-1">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="Enter first name"
                                        {...form.register("firstname")}
                                    />
                                    {form.formState.errors.firstname && (
                                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.firstname.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-2">
                                <Label htmlFor="phone" className="mb-1">Phone Number *</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="phone"
                                        placeholder="Enter phone number"
                                        className="pl-10"
                                        {...form.register("telephone")}
                                    />
                                </div>
                                {form.formState.errors.telephone && (
                                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.telephone.message}</p>
                                )}

                                {/* OTP Verification UI */}
                                {watchedTelephone && !isPhoneVerified && !form.formState.errors.telephone && (
                                    <div className="p-2 rounded-lg space-y-3 text-center">
                                        {/* <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-amber-600">Verification Required</p>
                                        </div> */}

                                        {otpError && (
                                            <p className="text-sm text-red-500">{otpError}</p>
                                        )}
                                        {successMessage && (
                                            <p className="text-sm text-green-600">{successMessage}</p>
                                        )}

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
                                                    "Send Verification Code"
                                                )}
                                            </Button>
                                        ) : (
                                            <div className="space-y-3 text-center">
                                                <Label htmlFor="otp" className="text-xs justify-center">Enter 6-digit code sent to {watchedTelephone}</Label>
                                                <div className="flex justify-center">
                                                    <InputOTP
                                                        maxLength={6}
                                                        value={otpValue}
                                                        onChange={(val) => setOtpValue(val)}
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
                                                        className="w-fit bg-primary hover:bg-primary/50 text-white"
                                                        size="sm"
                                                    >
                                                        {isVerifyingOtp ? "Verifying..." : "Verify & Save Number"}
                                                    </Button>

                                                </div>
                                                <div className="text-center">
                                                    <Button type="button" variant="link" size="sm" className="text-xs h-auto p-0" onClick={handleSendOtp} disabled={isSendingOtp}>Resend Code</Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowOtpInput(false);
                                                            setOtpValue("");
                                                            clearStates();
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {isPhoneVerified && watchedTelephone && (
                                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1"> Verified Number <CheckCircle2 className="h-3 w-3" /></p>
                                )}
                            </div>

                            {/* Location Details */}
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <Label className="text-lg font-semibold">Address Location *</Label>
                                </div>

                                {/* Map Trigger/Display */}
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-primary transition-colors bg-white group relative overflow-hidden h-[180px] flex items-center justify-center p-0"
                                >
                                    {watchedLat && watchedLng ? (
                                        <>
                                            <div className="space-y-2 relative z-10">
                                                <Button variant="secondary" size="sm" className="mt-2 text-xs shadow-sm bg-white hover:bg-white/90" onClick={(e) => { e.stopPropagation(); openMap(); }} type="button">
                                                    Change Location
                                                </Button>
                                            </div>
                                            {/* Static Map Background (Replaced with Live Preview) */}
                                            <div className="absolute inset-0 z-0">
                                                <MapPreview
                                                    apiKey={mapApiKey}
                                                    latitude={watchedLat}
                                                    longitude={watchedLng}
                                                />
                                                <div className="absolute inset-0 z-10 bg-white/10 cursor-pointer" onClick={openMap} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <MapPin className="h-8 w-8 mx-auto text-gray-400 group-hover:text-primary transition-colors" />
                                            <p className="text-sm text-gray-600">Click to pin location on map</p>
                                            <p className="text-xs text-gray-400">Required for delivery</p>
                                        </div>
                                    )}
                                </div>
                                {form.formState.errors.customLatitude && (
                                    <p className="text-sm text-red-500">Please select a location on the map.</p>
                                )}

                                {/* Common Fields: Street and Area/Zone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="street" className="mb-1">Street Address</Label>
                                        <Input
                                            id="street"
                                            {...form.register("street")}
                                            placeholder="Street Address"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="postcode" className="mb-1">Zone</Label>
                                        <Input
                                            id="postcode"
                                            {...form.register("postcode")}
                                            placeholder="Zone"
                                        />
                                    </div>
                                </div>

                                {/* Tabs for Specific Address Types */}
                                <Tabs
                                    value={activeTab}
                                    onValueChange={(val) => {
                                        setActiveTab(val);
                                        form.setValue("customAddressOption", val);
                                    }}
                                    className="w-full mt-4"
                                >
                                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
                                        <TabsTrigger
                                            value="Home"
                                            className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                                        >
                                            <Home className="h-4 w-4 mr-2" />
                                            Home
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="Office"
                                            className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">B</span>
                                                Office
                                            </div>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="Apartment"
                                            className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">A</span>
                                                Apartment
                                            </div>
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Home Tab: Building No, Address Label */}
                                    <TabsContent value="Home" className="space-y-4 mt-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="homeBuildingNo" className="mb-1">Building No</Label>
                                                <Input
                                                    id="homeBuildingNo"
                                                    placeholder="Building Number"
                                                    {...form.register("customBuildingNumber")}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="homeLabel" className="mb-1">Address Label</Label>
                                                <Input
                                                    id="homeLabel"
                                                    placeholder="e.g. My Home"
                                                    {...form.register("customAddressLabel")}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Office Tab: Company, Building Name, Floor, Address Label */}
                                    <TabsContent value="Office" className="space-y-4 mt-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="company" className="mb-1">Company</Label>
                                                <Input
                                                    id="company"
                                                    placeholder="Company Name"
                                                    {...form.register("company")}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="officeBuildingName" className="mb-1">Building Name</Label>
                                                <Input
                                                    id="officeBuildingName"
                                                    placeholder="Building Name"
                                                    {...form.register("customBuildingName")}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="officeFloor" className="mb-1">Floor No</Label>
                                                <Input
                                                    id="officeFloor"
                                                    placeholder="Floor No"
                                                    {...form.register("customFloorNumber")}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="officeLabel" className="mb-1">Address Label</Label>
                                                <Input
                                                    id="officeLabel"
                                                    placeholder="e.g. Work"
                                                    {...form.register("customAddressLabel")}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Apartment Tab: Address Label, Building Name, Unit No, Floor No */}
                                    <TabsContent value="Apartment" className="space-y-4 mt-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="aptBuildingName" className="mb-1">Building Name</Label>
                                                <Input
                                                    id="aptBuildingName"
                                                    placeholder="Building Name"
                                                    {...form.register("customBuildingName")}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="unitNo" className="mb-1">Unit No</Label>
                                                <Input
                                                    id="unitNo"
                                                    placeholder="Unit / Flat No"
                                                    {...form.register("flatNo")}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="aptFloor" className="mb-1">Floor No</Label>
                                                <Input
                                                    id="aptFloor"
                                                    placeholder="Floor No"
                                                    {...form.register("customFloorNumber")}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="aptLabel" className="mb-1">Address Label</Label>
                                                <Input
                                                    id="aptLabel"
                                                    placeholder="e.g. My Apartment"
                                                    {...form.register("customAddressLabel")}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div className="w-full flex justify-center mt-8">
                                <Button
                                    type="submit"
                                    disabled={isAddressSaving || form.formState.isSubmitting || (!!watchedTelephone && !isPhoneVerified)}
                                    className="w-full max-w-md mx-auto h-12 text-lg"
                                    size="lg"
                                >
                                    {(isAddressSaving || form.formState.isSubmitting) ? (
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    ) : (
                                        <>Save & Continue <ArrowRight className="h-5 w-5 ml-2" /></>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Map Picker Modal */}
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
        </PageContainer>
    );
}