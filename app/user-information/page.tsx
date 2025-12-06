"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { usePersonalInfo } from "@/lib/user";
import { useAddress, useMapLocation } from "@/lib/address";
import { MapPicker } from "@/components/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    MapPin,
    User,
    Phone,
    Mail,
    Home,
    Building2,
    ArrowLeft,
    ArrowRight,
    Edit2,
    Check,
    X,
    Loader2,
} from "lucide-react";
import PageContainer from "@/components/pageContainer";
import Link from "next/link";

const mapApiKey = process.env.NEXT_PUBLIC_MAP_API_KEY;
export default function PlaceOrderPage() {
    const router = useRouter();
    const { items, totalItems, totalPrice } = useCartStore();
    // Use reusable hooks
    const {
        personalInfo,
        setPersonalInfo,
        savePersonalInfo,
        isLoading: isPersonalLoading,
        isSaving: isPersonalSaving,
        isValid: isPersonalValid,
        isAuthenticated,
    } = usePersonalInfo();

    const {
        address,
        setAddress,
        savedAddresses,
        saveAddress,
        selectAddress,
        updateLocation,
        isLoading: isAddressLoading,
        isSaving: isAddressSaving,
        isValid: isAddressValid,
        hasLocation,
    } = useAddress();

    const {
        location: mapLocation,
        saveLocation: saveMapLocation,
        isMapOpen,
        openMap,
        closeMap,
    } = useMapLocation();

    // Edit mode states
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);

    // Temp states for editing
    const [tempPersonalInfo, setTempPersonalInfo] = useState(personalInfo);
    const [tempAddress, setTempAddress] = useState(address);

    // Sync temp states when data loads
    useEffect(() => {
        setTempPersonalInfo(personalInfo);
        setTempAddress(address);
    }, [personalInfo, address]);

    // Auto-enable edit mode for guests with no data
    useEffect(() => {
        if (!isPersonalLoading && !isAuthenticated) {
            if (!personalInfo.firstname && !personalInfo.phone_number) {
                setIsEditingPersonal(true);
            }
        }
    }, [isPersonalLoading, isAuthenticated, personalInfo]);

    useEffect(() => {
        if (!isAddressLoading && !address.street) {
            setIsEditingAddress(true);
        }
    }, [isAddressLoading, address]);

    // Redirect if cart is empty
    useEffect(() => {
        if (totalItems() === 0) {
            router.push("/cart");
        }
    }, [totalItems, router]);

    // Sync map location with address
    useEffect(() => {
        if (mapLocation) {
            updateLocation(mapLocation.latitude, mapLocation.longitude);
            setTempAddress((prev) => ({
                ...prev,
                latitude: mapLocation.latitude,
                longitude: mapLocation.longitude,
                formattedAddress: mapLocation.formattedAddress,
            }));
        }
    }, [mapLocation, updateLocation]);

    // Personal Info handlers
    const handleEditPersonal = () => {
        setTempPersonalInfo(personalInfo);
        setIsEditingPersonal(true);
    };

    const handleSavePersonal = async () => {
        const success = await savePersonalInfo(tempPersonalInfo);
        if (success) {
            setIsEditingPersonal(false);
        }
    };

    const handleCancelPersonal = () => {
        setTempPersonalInfo(personalInfo);
        setIsEditingPersonal(false);
    };

    // Address handlers
    const handleEditAddress = () => {
        setTempAddress(address);
        setIsEditingAddress(true);
    };

    const handleSaveAddress = async () => {
        const success = await saveAddress(tempAddress);
        if (success) {
            setIsEditingAddress(false);
        }
    };

    const handleCancelAddress = () => {
        setTempAddress(address);
        setIsEditingAddress(false);
    };

    const handleSelectSavedAddress = (savedAddr: typeof address) => {
        selectAddress(savedAddr);
        setTempAddress(savedAddr);
        setIsEditingAddress(false);
    };

    // Map location handler
    const handleMapLocationSelect = (loc: { latitude: string; longitude: string; formattedAddress?: string }) => {
        saveMapLocation(loc);
    };

    // Validation
    const canProceed =
        isPersonalValid() &&
        isAddressValid() &&
        !isEditingPersonal &&
        !isEditingAddress;

    const handleProceedToCheckout = () => {
        if (canProceed) {
            router.push("/checkout");
        }
    };

    // Loading state
    if (isPersonalLoading || isAddressLoading) {
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

            <div className="grid lg:grid-cols-3 gap-2">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-2 lg:space-y-4 lg:my-4">
                    {/* Personal Information Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                            {!isEditingPersonal && (
                                <Button variant="ghost" size="sm" onClick={handleEditPersonal}>
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isEditingPersonal ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="firstName" className="mb-1">First Name *</Label>
                                            <Input
                                                id="firstName"
                                                value={tempPersonalInfo.firstname}
                                                onChange={(e) =>
                                                    setTempPersonalInfo({ ...tempPersonalInfo, firstname: e.target.value })
                                                }
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName" className="mb-1">Last Name *</Label>
                                            <Input
                                                id="lastName"
                                                value={tempPersonalInfo.lastname}
                                                onChange={(e) =>
                                                    setTempPersonalInfo({ ...tempPersonalInfo, lastname: e.target.value })
                                                }
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="phone" className="mb-1">
                                            Phone Number *
                                            {isAuthenticated && (
                                                <span className="text-xs text-gray-500 ml-2 font-normal">
                                                    (Cannot be changed)
                                                </span>
                                            )}
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="phone"
                                                value={tempPersonalInfo.phone_number}
                                                onChange={(e) =>
                                                    setTempPersonalInfo({ ...tempPersonalInfo, phone_number: e.target.value })
                                                }
                                                placeholder="Enter phone number"
                                                className={`pl-10 ${isAuthenticated ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                                disabled={isAuthenticated}
                                                readOnly={isAuthenticated}
                                            />
                                        </div>
                                        {isAuthenticated && (
                                            <p className="text-xs text-gray-500 mt-1.5">
                                                Phone number is linked to your account and cannot be modified
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="email" className="mb-1">Email (Optional)</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={tempPersonalInfo.email}
                                                onChange={(e) =>
                                                    setTempPersonalInfo({ ...tempPersonalInfo, email: e.target.value })
                                                }
                                                placeholder="Enter email address"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button onClick={handleSavePersonal} size="sm" disabled={isPersonalSaving}>
                                            {isPersonalSaving ? (
                                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                            ) : (
                                                <Check className="h-4 w-4 mr-1" />
                                            )}
                                            Save
                                        </Button>
                                        <Button variant="outline" onClick={handleCancelPersonal} size="sm">
                                            <X className="h-4 w-4 mr-1" />
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {personalInfo.firstname ? (
                                        <>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span>
                                                    {personalInfo.firstname} {personalInfo.lastname}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span>{personalInfo.phone_number}</span>
                                                {isAuthenticated && (
                                                    <span className="text-xs text-gray-500 ml-1">(Verified)</span>
                                                )}
                                            </div>
                                            {personalInfo.email && (
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <span>{personalInfo.email}</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-gray-500 italic">No personal information provided</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Shipping Address Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-5 w-5" />
                                Shipping Address
                            </CardTitle>
                            {!isEditingAddress && (
                                <Button variant="ghost" size="sm" onClick={handleEditAddress}>
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isEditingAddress ? (
                                <div className="space-y-4">
                                    {/* Saved Addresses */}
                                    {savedAddresses.length > 0 && (
                                        <div>
                                            <Label className="text-sm text-gray-600 mb-2 block">Saved Addresses</Label>
                                            <div className="space-y-2">
                                                {savedAddresses.map((savedAddr, index) => (
                                                    <div
                                                        key={savedAddr.id || index}
                                                        onClick={() => handleSelectSavedAddress(savedAddr)}
                                                        className={`p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors ${tempAddress.street === savedAddr.street
                                                            ? "border-primary bg-primary/5"
                                                            : ""
                                                            }`}
                                                    >
                                                        <p className="font-medium">
                                                            {savedAddr.building}, {savedAddr.street}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {savedAddr.city}
                                                            {savedAddr.area && `, ${savedAddr.area}`}
                                                        </p>
                                                        {savedAddr.isDefault && (
                                                            <span className="text-xs text-green-600">Default</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="relative my-4">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t" />
                                                </div>
                                                <div className="relative flex justify-center text-sm">
                                                    <span className="bg-white px-2 text-gray-500">Or enter new address</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Address Form */}
                                    <div>
                                        <Label htmlFor="street" className="mb-1">Street Address *</Label>
                                        <div className="relative">
                                            <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="street"
                                                value={tempAddress.street}
                                                onChange={(e) => setTempAddress({ ...tempAddress, street: e.target.value })}
                                                placeholder="Enter street address"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="building" className="mb-1">Building Name/No *</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="building"
                                                    value={tempAddress.building}
                                                    onChange={(e) =>
                                                        setTempAddress({ ...tempAddress, building: e.target.value })
                                                    }
                                                    placeholder="Building name/number"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="floor" className="mb-1">Floor No</Label>
                                            <Input
                                                id="floor"
                                                value={tempAddress.floor}
                                                onChange={(e) => setTempAddress({ ...tempAddress, floor: e.target.value })}
                                                placeholder="Floor number"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="flatNo" className="mb-1">Flat/Unit No</Label>
                                            <Input
                                                id="flatNo"
                                                value={tempAddress.flatNo}
                                                onChange={(e) => setTempAddress({ ...tempAddress, flatNo: e.target.value })}
                                                placeholder="Flat/Unit number"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="area" className="mb-1">Area/Zone</Label>
                                            <Input
                                                id="area"
                                                value={tempAddress.area}
                                                onChange={(e) => setTempAddress({ ...tempAddress, area: e.target.value })}
                                                placeholder="Area/Zone"
                                            />
                                        </div>
                                        {/* <div>
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                value={tempAddress.city}
                                                onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })}
                                                placeholder="City"
                                            />
                                        </div> */}
                                    </div>

                                    {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     
                                        <div>
                                            <Label htmlFor="landmark" className="mb-1">Landmark</Label>
                                            <Input
                                                id="landmark"
                                                value={tempAddress.landmark}
                                                onChange={(e) =>
                                                    setTempAddress({ ...tempAddress, landmark: e.target.value })
                                                }
                                                placeholder="Nearby landmark"
                                            />
                                        </div>
                                    </div> */}

                                    <div className="flex gap-2 pt-2">
                                        <Button onClick={handleSaveAddress} size="sm" disabled={isAddressSaving}>
                                            {isAddressSaving ? (
                                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                            ) : (
                                                <Check className="h-4 w-4 mr-1" />
                                            )}
                                            Save
                                        </Button>
                                        <Button variant="outline" onClick={handleCancelAddress} size="sm">
                                            <X className="h-4 w-4 mr-1" />
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {address.street ? (
                                        <>
                                            <div className="flex items-start gap-2 text-gray-700">
                                                <Home className="h-4 w-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p>
                                                        {address.building}, {address.street}
                                                    </p>
                                                    {address.floor && <p>Floor: {address.floor}</p>}
                                                    {address.flatNo && <p>Flat: {address.flatNo}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span>
                                                    {address.city}
                                                    {address.area && `, ${address.area}`}
                                                </span>
                                            </div>
                                            {address.landmark && (
                                                <p className="text-sm text-gray-500 ml-6">Landmark: {address.landmark}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-gray-500 italic">No address provided</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    {/* Map Location */}
                    <div>
                        <Label className="text-lg font-semibold">Pin Location on Map</Label>
                        <div
                            onClick={openMap}
                            className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors bg-white"
                        >
                            {/* need show here the selected location from map */}
                            {mapLocation?.formattedAddress ? (
                                <div className="space-y-2">
                                    <MapPin className="h-8 w-8 mx-auto text-green-500" />
                                    <p className="text-sm text-green-600">Location selected</p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {mapLocation.formattedAddress}
                                    </p>
                                    <Button variant="outline" size="sm" type="button" onClick={openMap}>
                                        Change Location
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <MapPin className="h-8 w-8 mx-auto text-gray-400" />
                                    <p className="text-sm text-gray-600">Click to select location on map</p>
                                    <p className="text-xs text-gray-400">This helps us deliver faster</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="max-h-48 overflow-y-auto space-y-3">
                                {items.map((item) => (
                                    <div key={item.product.sku} className="flex gap-3 text-sm">
                                        <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate">{item.product.name}</p>
                                            <p className="text-gray-500">x{item.quantity}</p>
                                        </div>
                                        <p className="font-medium">
                                            {(item.product.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal ({totalItems()} items)</span>
                                    <span>QAR {totalPrice().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Shipping</span>
                                    <span className={totalPrice() >= 99 ? "text-green-600" : ""}>
                                        {totalPrice() >= 99 ? "Free" : "QAR 10.00"}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Total</span>
                                    <span>QAR {(totalPrice() + (totalPrice() >= 99 ? 0 : 10)).toFixed(2)}</span>
                                </div>
                            </div>

                            {!canProceed && (
                                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                                    {!isPersonalValid() && <p>• Complete your personal information</p>}
                                    {!isAddressValid() && <p>• Add your shipping address</p>}
                                    {(isEditingPersonal || isEditingAddress) && <p>• Save your changes</p>}
                                </div>
                            )}

                            <Button
                                onClick={handleProceedToCheckout}
                                disabled={!canProceed}
                                className="w-full"
                                size="lg"
                            >
                                Continue to Payment
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Map Picker Modal */}
            <MapPicker
                isOpen={isMapOpen}
                onClose={closeMap}
                onSelectLocation={handleMapLocationSelect}
                initialLocation={
                    address.latitude && address.longitude
                        ? { latitude: address.latitude, longitude: address.longitude }
                        : null
                }
                mapApikey={mapApiKey}
            />
        </PageContainer>
    );
}