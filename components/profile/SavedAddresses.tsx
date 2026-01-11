import { Button } from "@/components/ui/button";
import { Plus, Home, Phone, Edit2, Trash2 } from "lucide-react";

interface Address {
    id: string | number;
    custom_address_option: string;
    default_shipping: boolean;
    firstname: string;
    lastname: string;
    street: string;
    city: string;
    postcode: string;
    country_id: string;
    custom_building_number?: string;
    telephone: string;
}

interface SavedAddressesProps {
    addresses: Address[];
}

const SavedAddresses = ({ addresses }: SavedAddressesProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Saved Addresses</h3>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses && addresses.length > 0 ? (
                    addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`rounded-lg border-2 p-6 transition ${address.default_shipping
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Home className="w-4 h-4 text-slate-600" />
                                        <h4 className="font-semibold text-slate-900">
                                            {address.custom_address_option}
                                        </h4>
                                    </div>
                                    {address.default_shipping && (
                                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                            Default Address
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-slate-900 font-medium">
                                    {address.firstname + " " + address.lastname}
                                </p>
                                <p className="text-slate-700">{address.street}</p>
                                <p className="text-slate-700">
                                    {address.city}, {address.country_id} {address.postcode}
                                </p>
                                {address.custom_building_number && (
                                    <p className="text-slate-700">{address.custom_building_number}</p>
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
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No addresses found</p>
                )}
            </div>
        </div>
    );
};

export default SavedAddresses;
