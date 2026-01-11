"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { i18n, localeNames, type Locale } from "@/lib/i18n";
import { ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

interface LanguageSwitcherProps {
    currentLocale: Locale;
}

const LanguageSwitcher = ({ currentLocale }: LanguageSwitcherProps) => {
    const router = useRouter();
    const pathname = usePathname();

    // Switch language
    const switchLanguage = useCallback(
        (newLocale: Locale) => {
            if (newLocale === currentLocale) {
                return;
            }

            // Replace the locale in the pathname
            const segments = pathname.split("/");
            segments[1] = newLocale; // Replace locale segment
            const newPath = segments.join("/");

            // Set cookie for persistence
            document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 year

            router.push(newPath);
        },
        [currentLocale, pathname, router]
    );

    const countries = [
        { name: "Qatar", url: null, id: "qa", flag: "/images/flag-qatar-min.png" }, // Current site
        { name: "UAE", url: "https://uae.ahmarket.com/", id: "ae", flag: "/images/flag-uae-min.png" },
        {
            name: "Bahrain",
            url: "https://bahrain.ahmarket.com/",
            id: "bh",
            flag: "/images/flag-bahrain-min.png",
        },
        { name: "Oman", url: "https://oman.ahmarket.com/", id: "om", flag: "/images/flag-oman-min.png" },
    ];

    const handleCountryChange = (url: string | null) => {
        if (url) {
            window.location.href = url;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="flex items-center gap-0 px-1 py-1 rounded-lg hover:bg-gray-50 transition-colors text-primary outline-none"
                    aria-label="Select language and region"
                >
                    {/* Flag Icon (Placeholder for current region - Qatar) */}
                    <Image
                        src="/images/flag-qatar-min.png"
                        alt="Qatar Flag"
                        className="object-cover rounded-sm border border-gray-200"
                        width={50}
                        height={50}
                    />

                    <span className="text-sm font-medium">
                        {currentLocale === "ar" ? "AR" : "EN"}
                    </span>

                    <ChevronDown className="h-8 w-8 ml-0.5 opacity-50" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-[200px] p-2">
                {/* Language Section */}
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <div className="flex flex-col gap-1 mb-2">
                    {i18n.locales.map((locale) => (
                        <DropdownMenuItem
                            key={locale}
                            onClick={() => switchLanguage(locale)}
                            className={`cursor-pointer flex items-center justify-between rounded-md px-2 py-2 ${locale === currentLocale ? "bg-blue-50/50 text-primary" : "text-gray-700"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span>{localeNames[locale]}</span>
                            </div>
                            {locale === currentLocale ? (
                                <div className="h-2 w-2 rounded-full bg-[#b7d635]" />
                            ) : (
                                <div className="h-2 w-2 rounded-full border border-gray-300" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </div>

                <div className="h-px bg-gray-100 my-1" />

                {/* Region Section */}
                <DropdownMenuLabel>Region</DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                    {countries.map((country) => (
                        <DropdownMenuItem
                            key={country.id}
                            onClick={() => handleCountryChange(country.url)}
                            className={`cursor-pointer flex items-center gap-3 rounded-md px-2 py-2 ${country.id === "qa" ? "bg-blue-50/50" : ""
                                }`}
                        >
                            {/* Radio Indicator */}
                            <div
                                className={`h-4 w-4 rounded-full border flex items-center justify-center ${country.id === "qa" ? "border-[#b7d635]" : "border-gray-300"
                                    }`}
                            >
                                {country.id === "qa" && (
                                    <div className="h-2 w-2 rounded-full bg-[#b7d635]" />
                                )}
                            </div>

                            {/* Flag */}
                            <Image
                                src={country.flag}
                                alt={`${country.name} Flag`}
                                className="h-5 w-8 object-cover rounded-sm border border-gray-200"
                                width={20}
                                height={20}
                            />

                            <span
                                className={`font-medium ${country.id === "qa" ? "text-primary" : "text-gray-700"
                                    }`}
                            >
                                {country.name}
                            </span>
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSwitcher;