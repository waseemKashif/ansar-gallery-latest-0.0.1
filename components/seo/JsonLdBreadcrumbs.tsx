import React from 'react';

// Use standard type from 'schema-dts' or define locally if package not available
// We'll define locally to ensure no extra dependencies for now
interface BreadcrumbItem {
    label: string;
    url: string;
}

interface JsonLdBreadcrumbsProps {
    breadcrumbs: BreadcrumbItem[];
}

export function JsonLdBreadcrumbs({ breadcrumbs }: JsonLdBreadcrumbsProps) {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    const breadcrumbList = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.label,
            "item": crumb.url
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
        />
    );
}

// Ensure it's a client component if using hooks, but it renders a script so it's fine as server/shared.
// Since it just renders static JSON, it can be a Server or Client component.
