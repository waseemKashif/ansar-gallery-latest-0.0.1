"use client";

import { useLocale } from "@/hooks/useLocale";
import { cn } from "@/lib/utils";
import { Home, LayoutGrid, Tag, User, ShoppingCart, Languages } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import MobileCategories from "./mobile-categories";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";

const MobileBottomNav = () => {
    const { locale } = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [mounted, setMounted] = useState(false);
    const lastScrollY = useRef(0);
    const { totalItems } = useCartStore();
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
    const mobileNavVisible = useUIStore((state) => state.mobileNavVisible);

    const switchLocale = (newLocale: string) => {
        const pathSegments = pathname.split("/");
        // pathSegments[0] is empty, pathSegments[1] is current locale (usually)
        if (pathSegments.length > 1) {
            pathSegments[1] = newLocale;
        }
        const newPath = pathSegments.join("/");

        // Set cookie for persistence
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

        router.push(newPath);
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // If Categories is open, always keep nav visible
            if (isCategoriesOpen) {
                setIsVisible(true);
                return;
            }

            // Determine direction
            if (currentScrollY > lastScrollY.current && currentScrollY > 20) {
                // Scrolling DOWN -> Hide
                setIsVisible(false);
            } else {
                // Scrolling UP -> Show
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;

            // On Scroll Stop -> Show quickly
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }

            scrollTimeout.current = setTimeout(() => {
                setIsVisible(true);
            }, 500); // Reappear quickly after stop
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, [isCategoriesOpen]);

    const navItems = [
        {
            label: "Home",
            icon: Home,
            href: `/${locale}`,
            isButton: false,
        },
        {
            label: "Categories",
            icon: LayoutGrid,
            href: "#",
            isButton: true,
            onClick: () => setIsCategoriesOpen((prev) => !prev),
        },
        {
            label: "Offers",
            icon: Tag,
            href: `/${locale}/promotions`,
            isButton: false,
        },
        {
            label: "Account",
            icon: User,
            href: `/${locale}/profile`,
            isButton: false,
        },
        {
            label: "Cart",
            icon: ShoppingCart,
            href: `/${locale}/cart`,
            isButton: false,
        },
    ];
    if (pathname?.includes("/placeorder")) return null;

    // If configured to be hidden globally (e.g. on product/cart pages), hide it.
    if (!mobileNavVisible) return null;

    return (
        <>
            <div
                className={cn(
                    "fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 z-[60] pb-safe transition-transform duration-300",
                    isVisible ? "translate-y-0" : "translate-y-full"
                )}
            >
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        let isActive = false;
                        if (item.label === "Categories") {
                            isActive = isCategoriesOpen;
                        } else if (item.href === `/${locale}`) {
                            isActive = pathname === `/${locale}`;
                        } else {
                            isActive = pathname.startsWith(item.href);
                        }

                        if (item.isButton) {
                            return (
                                <button
                                    key={item.label}
                                    onClick={item.onClick}
                                    className="flex flex-col items-center justify-center w-full h-full space-y-1"
                                >
                                    <div
                                        className={cn(
                                            "p-1.5 rounded-full transition-colors",
                                            isActive ? "bg-pink-100 text-pink-600" : "text-gray-500"
                                        )}
                                    >
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[10px] font-medium",
                                            isActive ? "text-pink-600" : "text-gray-500"
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex flex-col items-center justify-center w-full h-full space-y-1"
                            >
                                <div
                                    className={cn(
                                        "p-1.5 rounded-full transition-colors relative",
                                        isActive ? "bg-pink-100 text-pink-600" : "text-gray-500"
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                    {item.label === "Cart" && mounted && totalItems() > 0 && (
                                        <span className="absolute top-[5px] right-[-5px] w-5 h-5 bg-red-500 rounded-full z-10 text-white text-xs font-semibold flex items-center justify-center">
                                            {totalItems()}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-[10px] font-medium",
                                        isActive ? "text-pink-600" : "text-gray-500"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="fixed bottom-18 right-0 lg:hidden bg-white z-[40] pb-safe transition-transform duration-300 w-fit">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center border-none focus:ring-0 focus:outline-none">
                        <div className="p-1.5 rounded-full text-gray-500">
                            <Languages className="w-6 h-6" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32 mb-2">
                        <DropdownMenuItem
                            className={cn("cursor-pointer", locale === "en" && "bg-slate-100 font-medium")}
                            onClick={() => switchLocale("en")}
                        >
                            English
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={cn("cursor-pointer", locale === "ar" && "bg-slate-100 font-medium")}
                            onClick={() => switchLocale("ar")}
                        >
                            Arabic
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {/* Render Categories Overlay */}
            <MobileCategories
                isOpen={isCategoriesOpen}
                onClose={() => setIsCategoriesOpen(false)}
            />
        </>
    );
};

export default MobileBottomNav;
