// middleware.ts (place in root of project)

import { NextRequest, NextResponse } from "next/server";
import { i18n } from "@/lib/i18n/config";

function getLocale(request: NextRequest): string {
    // Check if locale is in cookie (user preference)
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    if (cookieLocale && i18n.locales.includes(cookieLocale as any)) {
        return cookieLocale;
    }

    // Check Accept-Language header
    const acceptLanguage = request.headers.get("Accept-Language");
    if (acceptLanguage) {
        const preferredLocale = acceptLanguage
            .split(",")
            .map((lang) => lang.split(";")[0].trim().substring(0, 2))
            .find((lang) => i18n.locales.includes(lang as any));

        if (preferredLocale) {
            return preferredLocale;
        }
    }

    return i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if pathname already has a locale
    const pathnameHasLocale = i18n.locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) {
        return NextResponse.next();
    }

    // Skip for static files, api routes, etc.
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/static") ||
        pathname.includes(".") // files with extensions
    ) {
        return NextResponse.next();
    }

    // Redirect to locale-prefixed path
    const locale = getLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);

    return NextResponse.redirect(newUrl);
}

export const config = {
    matcher: [
        // Match all paths except static files and api
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],
};