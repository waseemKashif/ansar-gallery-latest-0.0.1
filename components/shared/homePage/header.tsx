"use client";

import { UserIcon, LogOutIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import TopCartIcon from "../../ui/topCartIcon";
import AuthModal from "@/components/auth/authenticatio-model"; // Adjust path as needed
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useCartProducts, useUpdateCart } from "@/lib/cart/cart.api";

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
  console.log(userProfile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const useStore = useCartStore();
  const clearCart = useStore.clearCart;
  const items = useStore.items;
  const { mutateAsync: updateCart } = useUpdateCart();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

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

  return (
    <>
      <header className="w-full border-b border-gray-300 bg-white">
        <div className="max-w-[1600px] mx-auto md:px-4 px-2">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" title="ansar gallery shopping">
                  <Image
                    className="block h-8 w-auto"
                    src="/images/ansarGallerylogo.png"
                    alt="Ansar Gallery Logo"
                    width={200}
                    height={200}
                    priority
                  />
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {isLoading || isLogoutLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </div>
              ) : (
                <nav className="flex space-x-4">
                  {isAuthenticated ? (
                    <div className="flex items-center gap-2">

                      <Link href="/profile" title="Profile" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                        <UserIcon className="h-8 w-8" />
                        <div className="flex flex-col">
                          <span className="text-sm">Welcome </span>
                          <span className="text-sm"> {userProfile?.firstname + " " + userProfile?.lastname}</span>
                        </div>
                      </Link>
                      <Button onClick={handleLogout} className="bg-transparent hover:bg-transparent shadow-none border-none text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                        <LogOutIcon className="h-5 w-5" /> Logout
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                    >
                      <UserIcon className="h-5 w-5" /> Sign In
                    </button>
                  )}
                  <TopCartIcon />
                </nav>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
    </>
  );
};

export default Header;