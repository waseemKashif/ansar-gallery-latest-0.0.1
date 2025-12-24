"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAddress, useMapLocation, emptyAddress } from "@/lib/address";
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

const mapApiKey = process.env.NEXT_PUBLIC_MAP_API_KEY;

export default function PlaceOrderPage() {
    const router = useRouter();
    const { totalItems } = useCartStore();

    // Address Hook (now handles fetching V1 list and V2 save)
    const {
        address,
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

    // Temp state for editing the form
    const [tempAddress, setTempAddress] = useState<UserAddress>(address);
    const [isSaving, setIsSaving] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // Sync temp state when address updates
    useEffect(() => {
        setTempAddress({
            ...address,
            customAddressOption: address.customAddressOption || "Home"
        });
    }, [address]);

    // Redirect if cart is empty
    useEffect(() => {
        if (totalItems() === 0) {
            router.push("/cart");
        }
    }, [totalItems, router]);

    // Redirect if not authenticated (since guest logic removed)
    useEffect(() => {
        // Optional: redirect to login if not authenticated
        // if (!isAuthenticated && !isAddressLoading) { router.push("/login"); }
    }, [isAuthenticated, isAddressLoading, router]);


    // Sync map location with address form
    useEffect(() => {
        if (mapLocation) {
            updateLocation(mapLocation.latitude, mapLocation.longitude);
            setTempAddress((prev) => ({
                ...prev,
                street: mapLocation.formattedAddress, // Auto-fill street from map
                postcode: zone || prev.postcode,      // Auto-fill zone (postcode) from store
                customLatitude: mapLocation.latitude,
                customLongitude: mapLocation.longitude,
                customAddressLabel: mapLocation.formattedAddress,
            }));
        }
    }, [mapLocation, updateLocation, zone]);

    // ... (previous handlers)

    const handleAddNewAddress = () => {
        setTempAddress({
            ...emptyAddress,
            customAddressOption: "Home" // Default to Home
        });
        clearLocation(); // Clear map
        setZone(null); // Clear zone
    };

    const handleSelectSavedAddress = (savedAddr: UserAddress) => {
        selectAddress(savedAddr);
        setTempAddress(savedAddr);
        // Sync Zone from postcode
        if (savedAddr.postcode) {
            setZone(savedAddr.postcode);
        }
        // Sync Map Location
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

    const canProceed =
        (tempAddress.firstname?.trim() ?? "") !== "" &&

        (tempAddress.telephone?.trim() ?? "") !== "" &&
        (tempAddress.street?.trim() ?? "") !== "" &&
        Boolean(tempAddress.customLatitude && tempAddress.customLongitude); // Map location required

    const handleProceedToCheckout = async () => {
        if (!canProceed) {
            // Just in case
            return;
        }
        setIsSaving(true);
        try {
            const success = await saveAddress(tempAddress);
            if (success) {
                router.push("/placeorder");
            } else {
                alert("Failed to save address. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsSaving(false);
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
                            {tempAddress.id ? "Edit Delivery Address" : "New Delivery Address"}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleAddNewAddress}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add New Address
                            </Button>
                            {savedAddresses.length > 0 && (
                                <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
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
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 flex flex-col justify-between ${tempAddress.id === savedAddr.id
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
                                                    setTempAddress({ ...address, id: undefined });
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
                    {/* Replaced old address list logic with just the content */}
                    <CardContent className="space-y-6">
                        {/* Personal Details in Address */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="firstName" className="mb-1">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={tempAddress.firstname || ""}
                                    onChange={(e) => setTempAddress({ ...tempAddress, firstname: e.target.value })}
                                    placeholder="Enter first name"
                                />
                            </div>

                        </div>

                        <div>
                            <Label htmlFor="phone" className="mb-1">Phone Number *</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="phone"
                                    value={tempAddress.telephone || ""}
                                    onChange={(e) => setTempAddress({ ...tempAddress, telephone: e.target.value })}
                                    placeholder="Enter phone number"
                                    className="pl-10"
                                />
                            </div>
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
                                {tempAddress.customLatitude && tempAddress.customLongitude ? (
                                    <>
                                        <div className="space-y-2 relative z-10">
                                            {/* <MapPin className="h-8 w-8 mx-auto text-red-500 drop-shadow-md" /> */}
                                            {/* <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded shadow-sm inline-block">
                                                <div className="text-gray-900 font-medium text-sm">Location Pinned</div>
                                            </div> */}
                                            <Button variant="secondary" size="sm" className="mt-2 text-xs shadow-sm bg-white hover:bg-white/90" onClick={(e) => { e.stopPropagation(); openMap(); }}>
                                                Change Location
                                            </Button>
                                        </div>
                                        {/* Static Map Background (Replaced with Live Preview) */}
                                        <div className="absolute inset-0 z-0">
                                            <MapPreview
                                                apiKey={mapApiKey}
                                                latitude={tempAddress.customLatitude}
                                                longitude={tempAddress.customLongitude}
                                            />
                                            {/* Overlay to ensure clickability if needed, or just let map handle it? 
                                                Actually, the parent div has interaction. 
                                                We adding a transparent overlay to prevent map interaction (dragging) 
                                                and unify the click to "Open Map" 
                                            */}
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

                            {/* Common Fields: Street and Area/Zone (Read-Only from Map) */}
                            <div className="bg-gray-50 p-4 rounded-md border text-sm space-y-2">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-700">Street Address:</span>
                                    <span className="text-gray-900">{tempAddress.street || "No street selected"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-700">Zone:</span>
                                    <span className="text-gray-900">{tempAddress.postcode || "No zone selected"}</span>
                                </div>
                            </div>

                            {/* Tabs for Specific Address Types */}
                            <Tabs
                                value={tempAddress.customAddressOption || "Home"}
                                onValueChange={(val) => setTempAddress({ ...tempAddress, customAddressOption: val })}
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
                                                value={tempAddress.customBuildingNumber || ""}
                                                onChange={(e) => setTempAddress({ ...tempAddress, customBuildingNumber: e.target.value })}
                                                placeholder="Building Number"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="homeLabel" className="mb-1">Address Label</Label>
                                            <Input
                                                id="homeLabel"
                                                value={tempAddress.customAddressLabel || ""}
                                                onChange={(e) => setTempAddress({ ...tempAddress, customAddressLabel: e.target.value })}
                                                placeholder="e.g. My Home"
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
                                                value={tempAddress.company || ""}
                                                onChange={(e) => setTempAddress({ ...tempAddress, company: e.target.value })}
                                                placeholder="Company Name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="officeBuildingName" className="mb-1">Building Name</Label>
                                            <Input
                                                id="officeBuildingName"
                                                value={tempAddress.customBuildingName || ""}
                                                onChange={(e) => setTempAddress({ ...tempAddress, customBuildingName: e.target.value })}
                                                placeholder="Building Name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="officeFloor" className="mb-1">Floor No</Label>
                                            <Input
                                                id="officeFloor"
                                                value={tempAddress.customFloorNumber || ""}
                                                onChange={(e) => setTempAddress({ ...tempAddress, customFloorNumber: e.target.value })}
                                                placeholder="Floor No"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="officeLabel" className="mb-1">Address Label</Label>
                                            <Input
                                                id="officeLabel"
                                                value={tempAddress.customAddressLabel || ""}
                                                onChange={(e) => setTempAddress({ ...tempAddress, customAddressLabel: e.target.value })}
                                                placeholder="e.g. Work"
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
                                                value={tempAddress.customBuildingName || ""}
                                                onChange={(e) => setTempAddress({ ...tempAddress, customBuildingName: e.target.value })}
                                                placeholder="Building Name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="unitNo" className="mb-1">Unit No</Label>
                                            <Input
                                                id="unitNo"
                                                value={tempAddress.flatNo || ""}
                                                onChange={(e) => setTempAddress({ ...tempAddress, flatNo: e.target.value })}
                                                placeholder="Unit / Flat No"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="aptFloor" className="mb-1">Floor No</Label>
                                            <Input
                                                id="aptFloor"
                                                value={tempAddress.customFloorNumber || ""}
                                                onChange={(e) => setTempAddress({ ...tempAddress, customFloorNumber: e.target.value })}
                                                placeholder="Floor No"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="aptLabel" className="mb-1">Address Label</Label>
                                            <Input
                                                id="aptLabel"
                                                value={tempAddress.customAddressLabel || ""}
                                                onChange={(e) => setTempAddress({ ...tempAddress, customAddressLabel: e.target.value })}
                                                placeholder="e.g. My Apartment"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                    </CardContent>
                </Card>
            </div>

            <div className="w-full flex justify-center mt-8">
                <Button
                    onClick={handleProceedToCheckout}
                    disabled={!canProceed || isSaving || isAddressSaving}
                    className="w-full max-w-md mx-auto h-12 text-lg"
                    size="lg"
                >
                    {(isSaving || isAddressSaving) ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                        <>Save & Continue <ArrowRight className="h-5 w-5 ml-2" /></>
                    )}
                </Button>
            </div>

            {/* Map Picker Modal */}
            <MapPicker
                isOpen={isMapOpen}
                onClose={closeMap}
                onSelectLocation={handleMapLocationSelect}
                initialLocation={
                    tempAddress.customLatitude && tempAddress.customLongitude
                        ? { latitude: tempAddress.customLatitude, longitude: tempAddress.customLongitude }
                        : null
                }
                mapApikey={mapApiKey}
            />
        </PageContainer>
    );
}