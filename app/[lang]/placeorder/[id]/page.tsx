import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/pageContainer";
import { useCheckoutData } from "@/lib/placeorder/useCheckoutData";
import { CheckoutData } from "@/types";
interface OrderSuccessPageProps {
    params: Promise<{
        lang: string;
        id?: string;
        slug?: string;
        checkoutData?: CheckoutData;
    }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
    const { lang, id, slug } = await params;
    const orderId = slug || id;

    return (
        <PageContainer>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 py-12">
                <div className="rounded-full bg-green-100 p-6">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Order Placed Successfully!</h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Thank you for your purchase from Ansar Gallery. <br></br> Your order has been confirmed and is being processed.
                    </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border w-full max-w-sm">
                    <p className="text-sm text-gray-500 mb-1">Order Number</p>
                    <p className="text-2xl font-bold font-mono text-primary">{orderId}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button asChild size="lg" className="min-w-[200px]">
                        <Link href="/">
                            Continue Shopping
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="min-w-[200px]">
                        {/* Placeholder for viewing order details if/when user profile orders page exists */}
                        <Link href="/user-dashboard/orders">
                            View My Orders
                        </Link>
                    </Button>
                </div>
            </div>
        </PageContainer>
    );
}
