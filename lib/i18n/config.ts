
export const i18n = {
    defaultLocale: "en",
    locales: ["en", "ar"],
} as const;

export type Locale = (typeof i18n)["locales"][number];

// RTL languages
export const rtlLocales: Locale[] = ["ar"];

export const isRtlLocale = (locale: Locale): boolean => {
    return rtlLocales.includes(locale);
};

// Language display names
export const localeNames: Record<Locale, string> = {
    en: "English",
    ar: "العربية",
};

// Language flags (optional - for visual display)
// export const localeFlags: Record<Locale, string> = {
//     en: "🇺🇸",
//     ar: "🇶🇦",
// };