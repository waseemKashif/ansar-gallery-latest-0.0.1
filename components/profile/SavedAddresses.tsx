"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Home, Phone, Edit2, Trash2, Loader2, MapPin } from "lucide-react";
import { UserAddress, MapLocation } from "@/lib/user/user.types";
import { fetchUserAddresses, addUserAddress, updateUserAddress, deleteUserAddress } from "@/lib/address/address.service";
import { useAuthStore } from "@/store/auth.store";
import { MapPicker } from "@/components/map/MapPicker";

// API Key from env
const GOOGLE_MAP_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || "";

interface SavedAddressesProps {
    addresses: UserAddress[];
}

interface AddressFormProps {
    initialData?: UserAddress;
    onSubmit: (data: UserAddress) => Promise<void>;
    onCancel: () => void;
    submitLabel: string;
    defaultPhone?: string;
}

const AddressForm = ({ initialData, onSubmit, onCancel, submitLabel, defaultPhone }: AddressFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [formData, setFormData] = useState<UserAddress>(initialData || {
        firstname: "",
        lastname: "",
        street: [],
        city: "",
        postcode: "",
        telephone: defaultPhone || "",
        custom_address_option: "",
        customAddressOption: "",
        country_id: "QA",
        region: "",
        customLatitude: "",
        customLongitude: ""
    });

    const handleMapSelect = (location: MapLocation) => {
        setFormData(prev => ({
            ...prev,
            street: [location.formattedAddress || ""],
            customLatitude: location.latitude,
            customLongitude: location.longitude,
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const dataToSubmit = {
                ...formData,
                custom_address_option: formData.customAddressOption || formData.custom_address_option
            };
            await onSubmit(dataToSubmit);
        } catch (error) {
            console.error(error);
            alert("Operation failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="rounded-lg border-2 border-primary/20 bg-white p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-slate-900">{initialData ? "Edit Address" : "Add New Address"}</h4>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full mb-4 border-dashed border-2"
                onClick={() => setIsMapOpen(true)}
            >
                <MapPin className="w-4 h-4 mr-2" />
                Select Map Location
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-700">First Name</label>
                    <Input
                        value={formData.firstname || ""}
                        onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <Input
                        value={formData.lastname || ""}
                        onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Street Address</label>
                    <Input
                        value={Array.isArray(formData.street) ? formData.street[0] : (formData.street || "")}
                        onChange={(e) => setFormData({ ...formData, street: [e.target.value] })}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">City</label>
                    <Input
                        value={formData.city || ""}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">Postcode</label>
                    <Input
                        value={formData.postcode || ""}
                        onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">Phone</label>
                    <Input
                        value={formData.telephone || ""}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        disabled={true}
                        className="bg-slate-100 text-slate-500 cursor-not-allowed"
                        placeholder="Phone number cannot be changed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Can not Change Phone Number</p>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">Address Label</label>
                    <Input
                        value={formData.customAddressOption || formData.custom_address_option || ""}
                        onChange={(e) => setFormData({ ...formData, custom_address_option: e.target.value, customAddressOption: e.target.value })}
                        placeholder="Home, Office, etc."
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {submitLabel}
                </Button>
            </div>

            <MapPicker
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                onSelectLocation={handleMapSelect}
                mapApikey={GOOGLE_MAP_API_KEY}
                initialLocation={
                    formData.customLatitude && formData.customLongitude
                        ? {
                            latitude: formData.customLatitude,
                            longitude: formData.customLongitude,
                            formattedAddress: Array.isArray(formData.street) ? formData.street[0] : formData.street
                        }
                        : undefined
                }
            />
        </div>
    );
};

const AddressCard = ({
    address,
    isEditing,
    onEditStart,
    onEditCancel,

    onRefresh,
}: {
    address: UserAddress;
    isEditing: boolean;
    onEditStart: () => void;
    onEditCancel: () => void;
    onRefresh: () => Promise<void>;
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (data: UserAddress) => {
        if (!address.id) return;
        setIsLoading(true);
        try {
            await updateUserAddress(address.id, data);
            await onRefresh();
            onEditCancel();
        } catch (error) {
            console.error("Failed to update address", error);
            alert("Failed to update address");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetDefault = async () => {
        if (!address.id) return;
        setIsLoading(true);
        try {
            await updateUserAddress(address.id, {
                ...address,
                defaultShipping: true,
                defaultBilling: true
            });
            await onRefresh();
        } catch (error) {
            console.error("Failed to set default address", error);
            alert("Failed to set default address");
        } finally {
            setIsLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        if (!address.id) return;

        setIsLoading(true);
        try {
            await deleteUserAddress(address.id);
            await onRefresh();
        } catch (error) {
            console.error("Failed to delete address", error);
            alert("Failed to delete address");
        } finally {
            setIsLoading(false);
        }
    };

    if (isEditing) {
        return (
            <AddressForm
                initialData={address}
                onSubmit={handleSave}
                onCancel={onEditCancel}
                submitLabel="Save Changes"
            />
        );
    }

    return (
        <div
            className={`rounded-lg border-2 p-6 transition ${address.defaultBilling || address.defaultShipping
                ? "border-[#b7d635] "
                : "border-slate-200 bg-white hover:border-slate-300"
                }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Home className="w-4 h-4 text-slate-600" />
                        <h4 className="font-semibold text-slate-900">
                            {address.custom_address_option || address.customAddressOption || "Address"}
                        </h4>
                    </div>
                    {(address.isDefault || address.defaultShipping) && (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            Default Address
                        </span>
                    )}
                </div>
                {!(address.isDefault || address.defaultShipping) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={handleSetDefault}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Set as Default"}
                    </Button>
                )}
            </div>

            <div className="space-y-2 mb-4">
                <p className="text-slate-900 font-medium">
                    {address.firstname} {address.lastname}
                </p>
                <p className="text-slate-700">{Array.isArray(address.street) ? address.street.join(", ") : address.street}</p>
                <p className="text-slate-700">
                    {address.city}, {address.postcode}
                </p>
                {address.countryId || address.country_id && (
                    <p className="text-slate-700">{address.countryId || address.country_id}</p>
                )}
                {address.customBuildingNumber && (
                    <p className="text-slate-700">Bldg: {address.customBuildingNumber}</p>
                )}
                <p className="text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {address.telephone}
                </p>
            </div>

            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                    onClick={onEditStart}
                >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                </Button>
                {/* <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={handleDelete}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </Button> */}
            </div>
        </div>
    );
};

const SavedAddresses = ({ addresses }: SavedAddressesProps) => {
    const { userProfile, updateProfile } = useAuthStore();
    const [activeEditId, setActiveEditId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const refreshAddresses = async () => {
        if (!userProfile) return;
        try {
            const addresses = await fetchUserAddresses(userProfile.id);
            // Sort addresses: default shipping first
            addresses.sort((a, b) => (b.defaultShipping ? 1 : 0) - (a.defaultShipping ? 1 : 0));

            updateProfile({
                ...userProfile,
                addresses
            });
        } catch (error) {
            console.error("Failed to refresh addresses", error);
        }
    };

    const handleCreate = async (data: UserAddress) => {
        if (!userProfile) return;

        try {
            await addUserAddress({
                ...data,
                customer_id: Number(userProfile.id)
            });

            await refreshAddresses();
            setIsAdding(false);
        } catch (error) {
            console.error("Error creating address:", error);
            alert("Failed to create address. Please try again.");
        }
    };

    const displayAddresses = userProfile?.addresses || addresses;

    const startAdding = () => {
        setActiveEditId(null); // Stop editing others
        setIsAdding(true);
    };

    const startEditing = (id: number) => {
        setIsAdding(false); // Stop adding
        setActiveEditId(id);
    };

    const cancelAction = () => {
        setIsAdding(false);
        setActiveEditId(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Saved Addresses</h3>
                {!isAdding && activeEditId === null && (
                    <Button className="bg-[#b7d635] hover:bg-[#b7d635]/90 text-white" onClick={startAdding}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Address
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="mb-6">
                    <AddressForm
                        onSubmit={handleCreate}
                        onCancel={cancelAction}
                        submitLabel="Save New Address"
                        defaultPhone={userProfile?.phone_number}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayAddresses && displayAddresses.length > 0 ? (
                    displayAddresses.map((address) => (
                        <AddressCard
                            key={address.id}
                            address={address}
                            isEditing={activeEditId === address.id}
                            onEditStart={() => address.id && startEditing(address.id)}
                            onEditCancel={cancelAction}
                            onRefresh={refreshAddresses}
                        />
                    ))
                ) : (
                    !isAdding && <p>No addresses found</p>
                )}
            </div>
        </div>
    );
};

export default SavedAddresses;
