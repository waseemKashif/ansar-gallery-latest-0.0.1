"use client";

import { UserIcon, LogOutIcon, Loader2, MapIcon, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import TopCartIcon from "../../ui/topCartIcon";
import AuthModal from "@/components/auth/authenticatio-model"; // Adjust path as needed
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useUpdateCart } from "@/lib/cart/cart.api";
import { MapPicker } from "@/components/map";
import { useAddress, useMapLocation } from "@/lib/address";
import { useZoneStore } from "@/store/useZoneStore";
import HeaderCategorySliderMenu from "./headerCategorySliderMenu";
import SearchBox from "./searchBox";

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const handleAuthSuccess = () => {
    console.log("User logged in!");
    // Show success toast, redirect, etc.
  };
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  console.log(isAuthenticated);
  const userProfile = useAuthStore((state) => state.userProfile);
  const authStore = useAuthStore();
  console.log("userProfile", userProfile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const useStore = useCartStore();
  const clearCart = useStore.clearCart;
  const items = useStore.items;
  const { mutateAsync: updateCart } = useUpdateCart();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const guestId = useAuthStore((state) => state.guestId);
  console.log("guestId", guestId);

  const handleLogout = () => {
    // here I want to call bluk api to send all items to server before user logout
    if (items.length > 0 && isAuthenticated) {
      setIsLogoutLoading(true);
      updateCart().then(() => {
        console.log("Cart updated successfully");
        authStore.clearAuth();
        clearCart();
        setIsLogoutLoading(false);
      });
    } else {
      authStore.clearAuth();
      clearCart();
      setIsLogoutLoading(false);
    }
  };

  const {
    location: mapLocation,
    saveLocation: saveMapLocation,
    isMapOpen,
    openMap,
    closeMap,
  } = useMapLocation();
  const { address } = useAddress();
  const { zone } = useZoneStore();
  const mapApiKey = process.env.NEXT_PUBLIC_MAP_API_KEY;
  const handleMapLocationSelect = (loc: { latitude: string; longitude: string; formattedAddress?: string }) => {
    saveMapLocation(loc);
    closeMap();
  };
  const handleMapClose = () => {
    closeMap();
  };
  return (
    <>
      <header className="w-full border-b border-gray-300 bg-white">
        <div className="max-w-[1600px] mx-auto md:px-4 px-2">
          <div className="flex justify-between h-16 gap-2">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" title="ansar gallery shopping">
                <Image
                  className="block h-8 w-auto"
                  src="/images/ansar-gallery-logo.webp"
                  alt="Ansar Gallery Logo"
                  width={200}
                  height={200}
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center w-full max-w-[1000px]">
              <SearchBox />
            </div>
            <div className="hidden lg:flex items-center ">
              {isLoading || isLogoutLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </div>
              ) : (
                <div className="flex space-x-4 items-center grow">
                  <button onClick={openMap} className="cursor-pointer" title={`Deliver to ${mapLocation?.formattedAddress}`}>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-6 w-6 text-green-600" />
                      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Deliver to</span>
                    </div>
                    {mapLocation?.formattedAddress ? (
                      <span className="text-sm line-clamp-1 max-w-[200px] text-start">{mapLocation.formattedAddress}</span>
                    ) : (
                      <span className="text-sm">Select Location</span>
                    )}
                  </button>
                  {isAuthenticated ? (
                    <div className="flex items-center gap-2">

                      <Link href="/profile" title="Profile" className="text-gray-700 hover:text-gray-900 rounded-md text-sm font-medium flex items-center gap-1">
                        <UserIcon className="h-8 w-8" />
                        <div className="flex flex-col">
                          <span className="text-sm">Welcome </span>
                          <span className="text-sm line-clamp-1 max-w-[200px]"> {userProfile?.firstname + " " + userProfile?.lastname}</span>
                        </div>
                      </Link>
                      <Button onClick={handleLogout} className="bg-transparent hover:bg-transparent shadow-none border-none text-gray-700 hover:text-gray-900 rounded-md text-sm font-medium flex items-center gap-1 p-0">
                        <LogOutIcon className="h-5 w-5" /> Logout
                      </Button>
                    </div>
                  ) : (
                    <button
                      aria-label="Sign In / Register"
                      title="Sign In / Register"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="text-gray-700 hover:text-gray-900 rounded-md text-sm font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <UserIcon className="h-8 w-8" /> <span className="text-sm font-semibold text-gray-700 whitespace-nowrap"> Sign In / <br /> Register</span>
                    </button>
                  )}
                  <TopCartIcon />
                </div>
              )}
            </div>
          </div>
        </div>
        <MapPicker
          isOpen={isMapOpen}
          onClose={handleMapClose}
          onSelectLocation={handleMapLocationSelect}
          initialLocation={
            mapLocation
              ? mapLocation
              : address.customLatitude && address.customLongitude
                ? {
                  latitude: address.customLatitude,
                  longitude: address.customLongitude,
                  formattedAddress: address.formattedAddress,
                }
                : null
          }
          mapApikey={mapApiKey}
        />
        <HeaderCategorySliderMenu />
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
    </>
  );
};

export default Header;