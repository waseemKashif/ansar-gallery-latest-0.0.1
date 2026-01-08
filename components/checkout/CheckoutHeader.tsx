import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";


export default function CheckoutHeader() {
    return (
        <header className="w-full border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50 flex">
            <Link href="/cart" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Cart</span>
            </Link>
            <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/images/ansar-gallery-logo.webp"
                        alt="Ansar Gallery"
                        width={150}
                        height={40}
                        className="h-8 w-auto object-contain"
                        priority
                    />
                </Link>

                {/* <div className="flex items-center gap-2 text-gray-600">
                    <Lock className="h-4 w-4" />
                    <span className="font-medium text-sm">Secure Checkout</span>
                </div> */}
            </div>
        </header>
    );
}
