"use client";

import { UserIcon, LogOutIcon, Loader2, MapPin } from "lucide-react";

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
import { LogoSVG } from "@/public/images/logoSVG";
import Image from "next/image";

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

  const handleLogout = async () => {
    if (items.length > 0 && isAuthenticated) {
      setIsLogoutLoading(true);
      await updateCart();
      authStore.clearAuth();
      clearCart();
      setIsLogoutLoading(false);
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
                  className="hidden lg:block h-8 w-auto"
                  src="/images/ansar-gallery-logo.webp"
                  alt="Ansar Gallery Logo"
                  width={200}
                  height={200}
                  priority
                />
                <LogoSVG
                  className="block w-auto lg:hidden "
                  width={70}
                  height={40}
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
                        {dict.common.deliverTo}
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

                  <div className="relative group h-full flex items-center">
                    <div className="flex items-center gap-2 cursor-pointer py-2">
                      {isAuthenticated ? (
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
                      ) : (
                        <div className="text-gray-700 hover:text-gray-900 rounded-md text-sm font-medium flex items-center gap-1">
                          <UserIcon className="h-8 w-8" />
                          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                            {dict.auth.login} / <br /> {dict.auth.register}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hover Dropdown */}
                    <div className="absolute top-full right-0 pt-2 w-36 hidden group-hover:block z-50">
                      <div className="bg-white border text-popover-foreground rounded-md shadow-md p-1">
                        {isAuthenticated ? (
                          <>
                            <LocaleLink
                              href="/profile"
                              className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                              <UserIcon className="h-4 w-4" />
                              <span>{dict.auth.profile}</span>
                            </LocaleLink>
                            <div
                              onClick={handleLogout}
                              className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                              <LogOutIcon className="h-4 w-4" />
                              <span>{dict.auth.logout}</span>
                            </div>
                          </>
                        ) : (
                          <div
                            onClick={() => setIsAuthModalOpen(true)}
                            className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          >
                            <UserIcon className="h-4 w-4" />
                            <span>{dict.auth.login} / {dict.auth.register}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
              : address.customAddressLabel && address.customAddressLabel
                ? {
                  latitude: address.customAddressLabel,
                  longitude: address.customAddressLabel,
                  formattedAddress: address.street,
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