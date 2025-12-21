"use client";

import { UserIcon, LogOutIcon, Loader2, MapPin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import TopCartIcon from "../../ui/topCartIcon";
import AuthModal from "@/components/auth/authenticatio-model";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useUpdateCart } from "@/lib/cart/cart.api";
import { MapPicker } from "@/components/map";
import { useAddress, useMapLocation } from "@/lib/address";
import { useZoneStore } from "@/store/useZoneStore";
import HeaderCategorySliderMenu from "./headerCategorySliderMenu";
import SearchBox from "./searchBox";
import LocaleLink from "../LocaleLink";
import type { Dictionary } from "@/lib/i18n";
import LanguageSwitcher from "@/components/Languageswitcher";
import { Locale } from "@/lib/i18n";

interface HeaderProps {
  dict: Dictionary;
  lang: Locale;
}

const Header = ({ dict, lang }: HeaderProps) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthSuccess = () => {
    console.log("User logged in!");
  };

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userProfile = useAuthStore((state) => state.userProfile);
  const authStore = useAuthStore();
  const isLoading = useAuthStore((state) => state.isLoading);
  const useStore = useCartStore();
  const clearCart = useStore.clearCart;
  const items = useStore.items;
  const { mutateAsync: updateCart } = useUpdateCart();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const guestId = useAuthStore((state) => state.guestId);

  const handleLogout = () => {
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
              <LocaleLink href="/" title="ansar gallery shopping">
                <Image
                  className="block h-8 w-auto"
                  src="/images/ansar-gallery-logo.webp"
                  alt="Ansar Gallery Logo"
                  width={200}
                  height={200}
                  priority
                />
              </LocaleLink>
            </div>

            <div className="flex items-center w-full max-w-[1000px]">
              <SearchBox />
            </div>

            <div className="hidden lg:flex items-center">
              {isLoading || isLogoutLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {dict.common.loading}
                </div>
              ) : (
                <div className="flex space-x-4 items-center grow">
                  <button
                    onClick={openMap}
                    className="cursor-pointer"
                    title={`Deliver to ${mapLocation?.formattedAddress}`}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="h-6 w-6 text-green-600" />
                      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                        Deliver to
                      </span>
                    </div>
                    {mapLocation?.formattedAddress ? (
                      <span className="text-sm line-clamp-1 max-w-[200px] text-start">
                        {mapLocation.formattedAddress}
                      </span>
                    ) : (
                      <span className="text-sm">Select Location</span>
                    )}
                  </button>

                  {isAuthenticated ? (
                    <div className="flex items-center gap-2">
                      <LocaleLink
                        href="/profile"
                        title="Profile"
                        className="text-gray-700 hover:text-gray-900 rounded-md text-sm font-medium flex items-center gap-1"
                      >
                        <UserIcon className="h-8 w-8" />
                        <div className="flex flex-col">
                          <span className="text-sm">{dict.home.welcome}</span>
                          <span className="text-sm line-clamp-1 max-w-[200px]">
                            {userProfile?.firstname + " " + userProfile?.lastname}
                          </span>
                        </div>
                      </LocaleLink>
                      <Button
                        onClick={handleLogout}
                        className="bg-transparent hover:bg-transparent shadow-none border-none text-gray-700 hover:text-gray-900 rounded-md text-sm font-medium flex items-center gap-1 p-0"
                      >
                        <LogOutIcon className="h-5 w-5" /> {dict.common.logout}
                      </Button>
                    </div>
                  ) : (
                    <button
                      aria-label={dict.common.login}
                      title={dict.common.login}
                      onClick={() => setIsAuthModalOpen(true)}
                      className="text-gray-700 hover:text-gray-900 rounded-md text-sm font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <UserIcon className="h-8 w-8" />
                      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                        {dict.common.login} / <br /> {dict.auth.register}
                      </span>
                    </button>
                  )}
                  <LanguageSwitcher currentLocale={lang} />
                  <TopCartIcon dict={dict} />
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Header;