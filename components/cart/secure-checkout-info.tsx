
import { CreditCardIcon, RotateCw } from "lucide-react";
import Link from "next/link";

export const SecureCheckoutInfo = () => {
    return (
        <div className="mt-4 space-y-4 text-sm text-gray-600">
            {/* Report Issue */}
            <div className="text-center">
                <Link href="/report-issue" className="text-red-500 hover:underline font-medium text-xs">Report an Issue</Link>
            </div>

            {/* Secure Payments */}
            <div className="">
                <div className="flex items-center gap-2 mb-2 text-[#003B5C] font-semibold text-base">
                    <CreditCardIcon className="h-5 w-5 fill-[#003B5C] text-white" />
                    <span>Secure Payments</span>
                </div>
                <p className="mb-2 text-sm font-bold text-black">
                    Ansar Gallery ensures your payment security.
                </p>
                <p className="mb-2 text-xs text-black">
                    We adhere to PCI DSS standards,
                    employ robust encryption, and conduct routine system reviews to safeguard your privacy.
                </p>
                <p className="font-medium text-xs mb-2 text-[#00304C] ">Payment methods we accept</p>
                {/* Payment Icons Placeholders */}
                <div className="flex gap-2 mb-2">
                    <div className="w-8 h-4 bg-gray-200 rounded"></div>
                    <div className="w-8 h-4 bg-gray-200 rounded"></div>
                    <div className="w-8 h-4 bg-gray-200 rounded"></div>
                    <div className="w-8 h-4 bg-gray-200 rounded"></div>
                </div>
                <p className="font-medium text-xs mb-2 text-[#00304C]">Security certifications we use</p>
                <div className="flex gap-2 mb-2">
                    <div className="w-12 h-6 bg-gray-200 rounded"></div>
                    <div className="w-12 h-6 bg-gray-200 rounded"></div>
                </div>
                <Link href="/payment-policy" className="text-blue-600 hover:underline text-xs block text-right">Read Payment Policy</Link>
            </div>
            {/* Divider */}
            <div className="my-4 border-t border-gray-400"></div>

            {/* Free Returns */}
            <div className="">
                <div className="flex items-center gap-2 mb-2 text-[#003B5C] font-semibold text-base">
                    <RotateCw className="h-5 w-5 text-[#003B5C]" />
                    <span>Free Returns</span>
                </div>
                <p className="mb-2 text-xs text-black">
                    If any of our products fall below the high standard you expect, we will happily refund or exchange it according to the terms and conditions set out below.
                </p>
                <Link href="/return-policy" className="text-blue-600 hover:underline text-xs block text-right">Read Return Policy</Link>
            </div>
        </div>
    );
};
