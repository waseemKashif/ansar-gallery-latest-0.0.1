import { Button } from "@/components/ui/button";
import { Mail, Phone } from "lucide-react";
import type { StaticImageData } from "next/image";

interface ProfileInfoProps {
    userData: {
        name: string;
        email: string;
        phone: string;
        joinedDate?: string;
        profileImage?: string | StaticImageData;
        membershipTier?: string;
    };
}

const ProfileInfo = ({ userData }: ProfileInfoProps) => {
    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-8">My Information</h3>

                <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-4">Personal Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                <p className="text-slate-900 font-medium">{userData.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <p className="text-slate-900 font-medium flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                    {userData.email}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Phone Number
                                </label>
                                <p className="text-slate-900 font-medium flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                    {userData.phone}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Account Preferences */}
                    <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-4">Account Preferences</h4>
                        <div className="space-y-4">
                            <label className="flex items-center p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="w-5 h-5 rounded border-slate-300"
                                />
                                <span className="ml-3 text-slate-900">Receive order updates via email</span>
                            </label>
                            <label className="flex items-center p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="w-5 h-5 rounded border-slate-300"
                                />
                                <span className="ml-3 text-slate-900">Receive promotional offers</span>
                            </label>
                            <label className="flex items-center p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                                <input type="checkbox" className="w-5 h-5 rounded border-slate-300" />
                                <span className="ml-3 text-slate-900">Subscribe to newsletter</span>
                            </label>
                        </div>
                    </div>

                    {/* Account Security */}
                    <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-4">Security</h4>
                        <Button
                            variant="outline"
                            className="border-slate-300 text-slate-900 hover:bg-slate-50"
                        >
                            Edit Profile Information
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
