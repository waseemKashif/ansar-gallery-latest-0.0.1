"use client";

import { useEffect } from "react";
import PageContainer from "@/components/pageContainer";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { usePersonalInfo } from "@/lib/user";
import { useAddress, useMapLocation } from "@/lib/address";


const PlaceOrderPage = () => {
    const router = useRouter();
    const { items } = useCartStore();
    const { personalInfo } = usePersonalInfo();
    const { address } = useAddress();
    const { location } = useMapLocation();

    useEffect(() => {
        if (!address || !location || !items?.length || !personalInfo?.phone_number) {
            router.push("/user-information");
        }
    }, [address, location, items, personalInfo, router]);

    console.log("the address is", address);
    console.log("the location is", location);
    console.log("the items is", items.length);
    console.log("the personalInfo is", personalInfo);
    return (
        <PageContainer>
            <div>
                <h1 className="text-2xl font-bold mb-6">Place Order</h1>
                <span>{personalInfo?.phone_number}</span>
                <span>{address?.defaultShipping}</span>
                <span>{location?.formattedAddress}</span>
                <span>{items?.length}</span>
            </div>
        </PageContainer>
    );
};

export default PlaceOrderPage;
