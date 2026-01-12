"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Loader2 } from "lucide-react";
import type { StaticImageData } from "next/image";
import { updatePersonalInfo } from "@/lib/user/user.service";
import { sendOtp, verifyOtp } from "@/lib/auth/auth.api";
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
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState("");

    // Form data
    const [formData, setFormData] = useState({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
    });

    // Store original email to check for changes
    const [originalEmail, setOriginalEmail] = useState(userData.email);

    const { userProfile, updateProfile } = useAuthStore();

    const handleSave = async () => {
        if (!userProfile) return;

        setIsLoading(true);
        try {
            // Check if email has changed
            if (formData.email !== userData.email) {
                // Determine if it's an email change
                // Trigger OTP flow
                const response = await sendOtp({
                    username: formData.email,
                    isNumber: 0, // 0 for email
                });

                if (response.success) {
                    setShowOtpInput(true);
                } else {
                    alert(response.message || "Failed to send OTP");
                }
                setIsLoading(false);
                return; // Stop here, wait for OTP
            }

            // No email change, proceed with normal update
            const updatedProfile: UserProfile = {
                ...userProfile,
                firstname: formData.firstName,
                lastname: formData.lastName,
                email: formData.email,
            };

            await updatePersonalInfo(updatedProfile);

            updateProfile(updatedProfile);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        } finally {
            if (!showOtpInput) setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!userProfile) return;
        setIsLoading(true);
        try {
            const response = await verifyOtp({
                username: formData.email,
                otp: Number(otp),
                isNumber: 0
            });

            if (response.success) {
                // OTP verified, proceed with update
                const updatedProfile: UserProfile = {
                    ...userProfile,
                    firstname: formData.firstName,
                    lastname: formData.lastName,
                    email: formData.email,
                };

                await updatePersonalInfo(updatedProfile);
                updateProfile(updatedProfile);

                // Reset states
                setIsEditing(false);
                setShowOtpInput(false);
                setOtp("");
            } else {
                alert(response.message || "Invalid OTP");
            }
        } catch (error) {
            console.error("OTP Verification failed", error);
            alert("OTP Verification failed");
        } finally {
            setIsLoading(false);
        }
    }

    const handleCancel = () => {
        setFormData({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
        });
        setIsEditing(false);
        setShowOtpInput(false);
        setOtp("");
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
                                showOtpInput ? (
                                    <div className="max-w-md mx-auto text-center space-y-4">
                                        <h5 className="font-semibold text-slate-900">Verify Email</h5>
                                        <p className="text-sm text-slate-600">
                                            We sent a verification code to <strong>{formData.email}</strong>
                                        </p>
                                        <div className="flex justify-center">
                                            <Input
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="Enter OTP"
                                                className="bg-white text-center tracking-widest text-lg w-40"
                                                maxLength={6}
                                            />
                                        </div>
                                        <div className="flex justify-center gap-3 pt-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowOtpInput(false)}
                                                disabled={isLoading}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                onClick={handleVerifyOtp}
                                                disabled={isLoading || !otp}
                                                className="bg-gray-900 text-white hover:bg-gray-800"
                                            >
                                                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                Verify & Save
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
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
                                            {formData.email !== userData.email && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    Changing email will require OTP verification.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                        <p className="text-slate-900 font-medium">
                                            {userData.name}
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
                    {isEditing && !showOtpInput && (
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
