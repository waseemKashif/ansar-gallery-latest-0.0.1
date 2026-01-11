"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Loader2 } from "lucide-react";
import type { StaticImageData } from "next/image";
import { updatePersonalInfo } from "@/lib/user/user.service";
import { useAuthStore } from "@/store/auth.store";
import { UserProfile } from "@/lib/user/user.types";

interface ProfileInfoProps {
    userData: {
        name: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        joinedDate?: string;
        profileImage?: string | StaticImageData;
        membershipTier?: string;
    };
}

const ProfileInfo = ({ userData }: ProfileInfoProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
    });

    const { userProfile, updateProfile } = useAuthStore();

    const handleSave = async () => {
        if (!userProfile) return;

        setIsLoading(true);
        try {
            // Create updated profile object
            // We need to pass the full object or at least what the service expects.
            // The service implementation constructs the payload using specific fields.
            // We can pass a merged object.
            const updatedProfile: UserProfile = {
                ...userProfile,
                firstname: formData.firstName,
                lastname: formData.lastName,
                email: formData.email,
            };

            await updatePersonalInfo(updatedProfile);

            // Update store
            updateProfile(updatedProfile);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
        });
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">My Information</h3>
                    {!isEditing && (
                        <Button
                            variant="outline"
                            className="border-slate-300 text-slate-900 hover:bg-slate-50"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </Button>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-4">Personal Details</h4>
                        <div className="bg-slate-50 p-6 rounded-lg">
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                                        <Input
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                                        <Input
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Email Address
                                        </label>
                                        <Input
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-white"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                        <p className="text-slate-900 font-medium">
                                            {isEditing ? `${formData.firstName} ${formData.lastName}` : userData.name}
                                        </p>
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
                            )}
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

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="bg-gray-900 text-white hover:bg-gray-800"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
