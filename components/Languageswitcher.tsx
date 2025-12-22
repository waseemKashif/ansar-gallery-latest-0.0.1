"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { i18n, localeNames, type Locale } from "@/lib/i18n";
import { Globe, ChevronDown, Check } from "lucide-react";

interface LanguageSwitcherProps {
    currentLocale: Locale;
}

const LanguageSwitcher = ({ currentLocale }: LanguageSwitcherProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Switch language
    const switchLanguage = useCallback((newLocale: Locale) => {
        if (newLocale === currentLocale) {
            setIsOpen(false);
            return;
        }

        // Replace the locale in the pathname
        const segments = pathname.split("/");
        segments[1] = newLocale; // Replace locale segment
        const newPath = segments.join("/");

        // Set cookie for persistence
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 year

        router.push(newPath);
        setIsOpen(false);
    }, [currentLocale, pathname, router]);

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Select language"
                aria-expanded={isOpen}
            >
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">
                    {currentLocale === "ar" ? "AR" : "EN"}
                </span>
                <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[150px] z-60">
                    {i18n.locales.map((locale) => (
                        <button
                            key={locale}
                            onClick={() => switchLanguage(locale)}
                            className={`
                                w-full flex items-center justify-between px-4 py-2 text-sm
                                hover:bg-gray-50 transition-colors
                                ${locale === currentLocale ? "bg-gray-50 text-primary" : "text-gray-700"}
                            `}
                        >
                            <span className="flex items-center gap-2">
                                <span>{localeNames[locale]}</span>
                            </span>
                            {locale === currentLocale && (
                                <Check className="h-4 w-4 text-primary" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;