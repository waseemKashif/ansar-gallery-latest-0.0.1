
import { CreditCardIcon, RotateCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const SecureCheckoutInfo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("mt-4 space-y-4 text-sm text-gray-600", className)}>
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
                <Image src="/images/payment_methods.webp" alt="Payment Methods" width={1500} height={200} className="w-full h-auto max-w-[400px]" />
                <p className="font-medium text-xs mb-2 text-[#00304C]">Security certifications we use</p>
                <Image src="/images/payment_certifications.webp" alt="Security Certifications" width={1500} height={200} className="w-full h-auto max-w-[400px]" />
                <Link href="/paymentMethodsInfo" className="text-blue-600 hover:underline text-xs block text-right">Read Payment Policy</Link>
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
