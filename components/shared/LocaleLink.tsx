"use client";

// components/shared/LocaleLink.tsx

import NextLink from "next/link";
import { useLocale } from "@/hooks/useLocale";
import { ComponentProps } from "react";

type LocaleLinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
    href: string;
};

/**
 * Link component that automatically adds the current locale to the href
 * Use this instead of next/link for internal navigation
 */
const LocaleLink = ({ href, children, ...props }: LocaleLinkProps) => {
    const { locale } = useLocale();

    // If href already starts with a locale, don't add another
    const hasLocale = href.startsWith("/en") || href.startsWith("/ar");
    const localizedHref = hasLocale ? href : `/${locale}${href.startsWith("/") ? href : `/${href}`}`;

    return (
        <NextLink href={localizedHref} {...props}>
            {children}
        </NextLink>
    );
};

export default LocaleLink;