"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema } from "@/lib/validators/auth";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { formatTimer } from "@/lib/auth/auth.utils";

type AuthFormType = z.infer<typeof authSchema>;

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState("signin");
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [errorStatus, setErrorStatus] = useState<boolean>(false);
    const {
        isLoading,
        error,
        resendTimer,
        canResend,
        sendOtpCode,
        verifyOtpCode,
        resendOtpCode,
        clearError,
    } = useAuth();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        getValues,
    } = useForm<AuthFormType>({
        resolver: zodResolver(authSchema),
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);
    useEffect(() => {
        if (!error) return;
        if (error) {
            setErrorStatus(true);
        }
        const timer = setTimeout(() => {
            setErrorStatus(false);
        }, 4000);

        return () => clearTimeout(timer);
    }, [error]);
    const onSubmit = async () => {
        const mobileNumber = getValues("emailOrMobile");
        const success = await sendOtpCode(`974${mobileNumber}`);
        if (success) {
            setShowOtpForm(true);
            setOtp(["", "", "", "", "", ""]);
        } else if (!success && !canResend) {
            setShowOtpForm(true)
            setOtp(["", "", "", "", "", ""]);
        }
    };

    const handleVerifyOtp = async () => {
        const otpValue = otp.join("");

        if (otpValue.length !== 6) {
            return;
        }

        const mobileNumber = getValues("emailOrMobile");
        const success = await verifyOtpCode(`974${mobileNumber}`, otpValue);

        if (success) {
            closeModal();
            onSuccess?.();
        }
    };

    const handleResendOtp = async () => {
        const mobileNumber = getValues("emailOrMobile");
        const success = await resendOtpCode(`974${mobileNumber}`);
        if (success) {
            setOtp(["", "", "", "", "", ""]);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        const newOtp = [...otp];

        if (value === "" || /^\d$/.test(value)) {
            newOtp[index] = value;
            setOtp(newOtp);
            clearError();

            if (value && index < 5) {
                document.getElementById(`otp-${index + 1}`)?.focus();
            }
        }
    };

    const handleOtpKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Backspace") {
            if (otp[index] === "" && index > 0) {
                document.getElementById(`otp-${index - 1}`)?.focus();
            }
        }
    };

    const switchTab = (tab: string) => {
        setActiveTab(tab);
        setShowOtpForm(false);
        clearError();
        reset();
    };

    const closeModal = () => {
        onClose();
        setTimeout(() => {
            reset();
            setOtp(["", "", "", "", "", ""]);
            setShowOtpForm(false);
            setActiveTab("signin");
            clearError();
        }, 200);
    };

    const handleFormSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        handleSubmit(onSubmit)();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-[480px] relative p-6 animate-in fade-in zoom-in">
                <button
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                    onClick={closeModal}
                    disabled={isLoading}
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-gray-900">
                    {activeTab === "signin" ? "Welcome Back" : "Create Your Account"}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                    {activeTab === "signin"
                        ? "Sign in using your mobile number"
                        : "Enter your mobile number to register a new account"}
                </p>

                <div className="flex mt-4 border-b">
                    <Button
                        variant="ghost"
                        className={`flex-1 pb-2 rounded-none ${activeTab === "signin"
                            ? "text-primary border-b-2 border-[#E90E8B]"
                            : "text-gray-500"
                            }`}
                        onClick={() => switchTab("signin")}
                        disabled={isLoading}
                    >
                        Sign In
                    </Button>

                    <Button
                        variant="ghost"
                        className={`flex-1 pb-2 rounded-none ${activeTab === "register"
                            ? "text-primary border-b-2 border-[#E90E8B]"
                            : "text-gray-500"
                            }`}
                        onClick={() => switchTab("register")}
                        disabled={isLoading}
                    >
                        Register
                    </Button>
                </div>

                {error && errorStatus && (
                    <div className=" p-3 transition-all">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="mt-4">
                    {!showOtpForm && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Mobile Number</label>

                                <div className="relative mt-1 flex">
                                    <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md text-gray-500 text-sm">
                                        +974
                                    </div>
                                    <Input
                                        {...register("emailOrMobile")}
                                        placeholder="Enter your mobile number"
                                        className="rounded-l-none"
                                        disabled={isLoading}
                                    />
                                </div>

                                {errors.emailOrMobile && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.emailOrMobile.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                onClick={handleFormSubmit}
                                className="w-full bg-primary text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : activeTab === "signin" ? (
                                    "Continue to Sign In"
                                ) : (
                                    "Continue to Register"
                                )}
                            </Button>
                        </div>
                    )}

                    {showOtpForm && (
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium">
                                    {activeTab === "signin"
                                        ? "Sign In - Enter OTP"
                                        : "Register - Enter OTP"}
                                </label>

                                <button
                                    className="text-blue-600 text-sm cursor-pointer hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => {
                                        setShowOtpForm(false);
                                        clearError();
                                        reset();
                                    }}
                                    disabled={isLoading}
                                >
                                    Change Number
                                </button>
                            </div>

                            <p className="text-sm text-gray-600">
                                {activeTab === "signin"
                                    ? "We've sent a login code to "
                                    : "We've sent a registration code to "}
                                <span className="font-medium">{getValues("emailOrMobile")}</span>
                            </p>

                            <div className="flex gap-2 justify-center">
                                {otp.map((digit, i) => (
                                    <Input
                                        key={i}
                                        id={`otp-${i}`}
                                        maxLength={1}
                                        inputMode="numeric"
                                        value={digit}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        className="w-12 h-12 text-center text-lg font-semibold"
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>

                            <Button
                                onClick={handleVerifyOtp}
                                className="w-full"
                                disabled={isLoading || otp.join("").length !== 6}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify OTP"
                                )}
                            </Button>

                            <p className="text-center text-sm">
                                Didn&apos;t receive code?{" "}
                                {canResend ? (
                                    <button
                                        className="text-primary font-medium hover:underline disabled:opacity-50"
                                        onClick={handleResendOtp}
                                        disabled={isLoading}
                                    >
                                        Resend
                                    </button>
                                ) : (
                                    <span className="text-gray-500">
                                        Resend in {formatTimer(resendTimer)}
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-gray-500 mt-6">
                    By continuing, you agree to our{" "}
                    <Link href="/terms" className="text-blue-600">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600">
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </div>
    );
};


export default AuthModal;